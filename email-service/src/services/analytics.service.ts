import { EmailStatus, EmailEventType } from '@prisma/client';
import { prisma } from '../config/database.js';
import { createLogger } from '../utils/logger.js';
import { EmailStats } from '../types/email.types.js';

const logger = createLogger('analytics-service');

export class AnalyticsService {
  /**
   * 获取总体统计
   */
  async getOverviewStats(startDate?: Date, endDate?: Date): Promise<EmailStats> {
    const dateFilter = this.buildDateFilter(startDate, endDate);
    
    const [sent, delivered, bounced, complaints, opened, clicked, failed] =
      await Promise.all([
        prisma.emailJob.count({
          where: { status: EmailStatus.SENT, ...dateFilter },
        }),
        prisma.emailJob.count({
          where: { status: EmailStatus.DELIVERED, ...dateFilter },
        }),
        prisma.emailJob.count({
          where: { status: EmailStatus.BOUNCED, ...dateFilter },
        }),
        prisma.complaint.count({
          where: dateFilter.createdAt ? { timestamp: dateFilter.createdAt } : {},
        }),
        prisma.emailTracking.count({
          where: { opened: true, ...dateFilter },
        }),
        prisma.emailTracking.count({
          where: { clicked: true, ...dateFilter },
        }),
        prisma.emailJob.count({
          where: { status: EmailStatus.FAILED, ...dateFilter },
        }),
      ]);
    
    const totalSent = sent + delivered; // SENT 和 DELIVERED 都算发送成功
    
    return {
      totalSent,
      totalDelivered: delivered,
      totalBounced: bounced,
      totalComplaints: complaints,
      totalOpened: opened,
      totalClicked: clicked,
      totalFailed: failed,
      deliveryRate: totalSent > 0 ? (delivered / totalSent) * 100 : 0,
      openRate: totalSent > 0 ? (opened / totalSent) * 100 : 0,
      clickRate: opened > 0 ? (clicked / opened) * 100 : 0,
      bounceRate: totalSent > 0 ? (bounced / totalSent) * 100 : 0,
    };
  }
  
  /**
   * 获取每日统计
   */
  async getDailyStats(
    startDate: Date,
    endDate: Date
  ): Promise<Array<{
    date: string;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    failed: number;
  }>> {
    // 尝试从缓存表获取
    const cachedStats = await prisma.dailyStatistics.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });
    
    if (cachedStats.length > 0) {
      return cachedStats.map(s => ({
        date: s.date.toISOString().split('T')[0],
        sent: s.totalSent,
        delivered: s.totalDelivered,
        opened: s.totalOpened,
        clicked: s.totalClicked,
        bounced: s.totalBounced,
        failed: s.totalFailed,
      }));
    }
    
    // 实时计算（性能较差，建议使用定时任务预计算）
    const jobs = await prisma.emailJob.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        tracking: true,
      },
    });
    
    // 按日期分组
    const dailyMap = new Map<string, {
      sent: number;
      delivered: number;
      opened: number;
      clicked: number;
      bounced: number;
      failed: number;
    }>();
    
    for (const job of jobs) {
      const dateKey = job.createdAt.toISOString().split('T')[0];
      
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, {
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          bounced: 0,
          failed: 0,
        });
      }
      
      const stats = dailyMap.get(dateKey)!;
      
      if (job.status === EmailStatus.SENT || job.status === EmailStatus.DELIVERED) {
        stats.sent++;
      }
      if (job.status === EmailStatus.DELIVERED) {
        stats.delivered++;
      }
      if (job.status === EmailStatus.BOUNCED) {
        stats.bounced++;
      }
      if (job.status === EmailStatus.FAILED) {
        stats.failed++;
      }
      if (job.tracking?.opened) {
        stats.opened++;
      }
      if (job.tracking?.clicked) {
        stats.clicked++;
      }
    }
    
    // 转换为数组并排序
    return Array.from(dailyMap.entries())
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
  
  /**
   * 获取模板统计
   */
  async getTemplateStats(templateId: string): Promise<{
    templateId: string;
    totalSent: number;
    totalDelivered: number;
    totalOpened: number;
    totalClicked: number;
    openRate: number;
    clickRate: number;
  }> {
    const jobs = await prisma.emailJob.findMany({
      where: { templateId },
      include: { tracking: true },
    });
    
    let totalSent = 0;
    let totalDelivered = 0;
    let totalOpened = 0;
    let totalClicked = 0;
    
    for (const job of jobs) {
      if (
        job.status === EmailStatus.SENT ||
        job.status === EmailStatus.DELIVERED
      ) {
        totalSent++;
      }
      if (job.status === EmailStatus.DELIVERED) {
        totalDelivered++;
      }
      if (job.tracking?.opened) {
        totalOpened++;
      }
      if (job.tracking?.clicked) {
        totalClicked++;
      }
    }
    
    return {
      templateId,
      totalSent,
      totalDelivered,
      totalOpened,
      totalClicked,
      openRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
      clickRate: totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0,
    };
  }
  
  /**
   * 获取退信分析
   */
  async getBounceAnalysis(
    type?: 'HARD' | 'SOFT',
    startDate?: Date,
    endDate?: Date
  ): Promise<Array<{
    email: string;
    bounceType: string;
    count: number;
    lastBounceAt: Date;
  }>> {
    const where: Record<string, unknown> = {};
    
    if (type) {
      where.bounceType = type;
    }
    
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        (where.timestamp as Record<string, Date>).gte = startDate;
      }
      if (endDate) {
        (where.timestamp as Record<string, Date>).lte = endDate;
      }
    }
    
    const bounces = await prisma.bounce.groupBy({
      by: ['email', 'bounceType'],
      where,
      _count: true,
      _max: { timestamp: true },
    });
    
    return bounces.map(b => ({
      email: b.email,
      bounceType: b.bounceType,
      count: b._count,
      lastBounceAt: b._max.timestamp!,
    }));
  }
  
  /**
   * 获取提供商统计
   */
  async getProviderStats(): Promise<Array<{
    provider: string;
    totalSent: number;
    totalFailed: number;
    successRate: number;
  }>> {
    const stats = await prisma.emailJob.groupBy({
      by: ['providerUsed'],
      where: {
        providerUsed: { not: null },
      },
      _count: true,
    });
    
    const result = [];
    
    for (const stat of stats) {
      if (!stat.providerUsed) continue;
      
      const failed = await prisma.emailJob.count({
        where: {
          providerUsed: stat.providerUsed,
          status: { in: [EmailStatus.FAILED, EmailStatus.BOUNCED] },
        },
      });
      
      const total = stat._count;
      const successful = total - failed;
      
      result.push({
        provider: stat.providerUsed,
        totalSent: total,
        totalFailed: failed,
        successRate: total > 0 ? (successful / total) * 100 : 0,
      });
    }
    
    return result;
  }
  
  /**
   * 更新每日统计缓存
   */
  async updateDailyStatistics(date: Date): Promise<void> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const stats = await this.getOverviewStats(startOfDay, endOfDay);
    
    await prisma.dailyStatistics.upsert({
      where: { date: startOfDay },
      update: {
        totalSent: stats.totalSent,
        totalDelivered: stats.totalDelivered,
        totalBounced: stats.totalBounced,
        totalComplaints: stats.totalComplaints,
        totalOpened: stats.totalOpened,
        totalClicked: stats.totalClicked,
        totalFailed: stats.totalFailed,
        deliveryRate: stats.deliveryRate,
        openRate: stats.openRate,
        clickRate: stats.clickRate,
        bounceRate: stats.bounceRate,
      },
      create: {
        date: startOfDay,
        totalSent: stats.totalSent,
        totalDelivered: stats.totalDelivered,
        totalBounced: stats.totalBounced,
        totalComplaints: stats.totalComplaints,
        totalOpened: stats.totalOpened,
        totalClicked: stats.totalClicked,
        totalFailed: stats.totalFailed,
        deliveryRate: stats.deliveryRate,
        openRate: stats.openRate,
        clickRate: stats.clickRate,
        bounceRate: stats.bounceRate,
      },
    });
    
    logger.info({ date: startOfDay.toISOString() }, 'Daily statistics updated');
  }
  
  /**
   * 构建日期过滤条件
   */
  private buildDateFilter(
    startDate?: Date,
    endDate?: Date
  ): { createdAt?: { gte?: Date; lte?: Date } } {
    if (!startDate && !endDate) {
      return {};
    }
    
    const filter: { gte?: Date; lte?: Date } = {};
    
    if (startDate) {
      filter.gte = startDate;
    }
    if (endDate) {
      filter.lte = endDate;
    }
    
    return { createdAt: filter };
  }
}

export const analyticsService = new AnalyticsService();
