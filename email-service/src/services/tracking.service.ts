import { EmailEventType } from '@prisma/client';
import { prisma } from '../config/database.js';
import { redis } from '../config/redis.js';
import { config } from '../config/index.js';
import { createLogger } from '../utils/logger.js';
import { TrackingEvent } from '../types/email.types.js';

const logger = createLogger('tracking-service');

const DEDUP_PREFIX = 'tracking:dedup:';

export class TrackingService {
  /**
   * 记录打开事件
   */
  async recordOpen(trackingId: string, metadata: {
    userAgent?: string;
    ipAddress?: string;
  }): Promise<boolean> {
    // 检查追踪记录是否存在
    const tracking = await prisma.emailTracking.findUnique({
      where: { trackingId },
    });
    
    if (!tracking) {
      logger.warn({ trackingId }, 'Tracking record not found');
      return false;
    }
    
    // 去重检查
    const dedupKey = `${DEDUP_PREFIX}open:${trackingId}:${metadata.ipAddress || 'unknown'}`;
    const isDuplicate = await this.checkAndSetDedup(dedupKey);
    
    if (isDuplicate) {
      logger.debug({ trackingId }, 'Duplicate open event ignored');
      return false;
    }
    
    // 更新追踪记录
    await prisma.emailTracking.update({
      where: { trackingId },
      data: {
        opened: true,
        openedAt: tracking.openedAt || new Date(),
        openCount: { increment: 1 },
        lastUserAgent: metadata.userAgent,
        lastIpAddress: metadata.ipAddress,
      },
    });
    
    // 记录事件
    await prisma.emailEvent.create({
      data: {
        emailJobId: tracking.emailJobId,
        eventType: EmailEventType.OPENED,
        eventData: metadata,
      },
    });
    
    logger.info({ trackingId, emailJobId: tracking.emailJobId }, 'Open event recorded');
    return true;
  }
  
  /**
   * 记录点击事件
   */
  async recordClick(trackingId: string, url: string, metadata: {
    userAgent?: string;
    ipAddress?: string;
  }): Promise<boolean> {
    // 检查追踪记录是否存在
    const tracking = await prisma.emailTracking.findUnique({
      where: { trackingId },
    });
    
    if (!tracking) {
      logger.warn({ trackingId }, 'Tracking record not found');
      return false;
    }
    
    // 去重检查（同一URL同一IP）
    const dedupKey = `${DEDUP_PREFIX}click:${trackingId}:${metadata.ipAddress || 'unknown'}:${url}`;
    const isDuplicate = await this.checkAndSetDedup(dedupKey);
    
    // 即使是重复，也更新点击次数
    await prisma.emailTracking.update({
      where: { trackingId },
      data: {
        clicked: true,
        clickedAt: tracking.clickedAt || new Date(),
        clickCount: { increment: 1 },
        lastUserAgent: metadata.userAgent,
        lastIpAddress: metadata.ipAddress,
      },
    });
    
    if (!isDuplicate) {
      // 记录事件
      await prisma.emailEvent.create({
        data: {
          emailJobId: tracking.emailJobId,
          eventType: EmailEventType.CLICKED,
          eventData: { ...metadata, url },
        },
      });
      
      logger.info(
        { trackingId, emailJobId: tracking.emailJobId, url },
        'Click event recorded'
      );
    }
    
    return true;
  }
  
  /**
   * 获取追踪统计
   */
  async getTrackingStats(emailJobId: string): Promise<{
    opened: boolean;
    openCount: number;
    openedAt: Date | null;
    clicked: boolean;
    clickCount: number;
    clickedAt: Date | null;
    events: Array<{
      eventType: EmailEventType;
      timestamp: Date;
      data: unknown;
    }>;
  } | null> {
    const tracking = await prisma.emailTracking.findUnique({
      where: { emailJobId },
    });
    
    if (!tracking) {
      return null;
    }
    
    const events = await prisma.emailEvent.findMany({
      where: {
        emailJobId,
        eventType: { in: [EmailEventType.OPENED, EmailEventType.CLICKED] },
      },
      orderBy: { timestamp: 'desc' },
      take: 50,
    });
    
    return {
      opened: tracking.opened,
      openCount: tracking.openCount,
      openedAt: tracking.openedAt,
      clicked: tracking.clicked,
      clickCount: tracking.clickCount,
      clickedAt: tracking.clickedAt,
      events: events.map(e => ({
        eventType: e.eventType,
        timestamp: e.timestamp,
        data: e.eventData,
      })),
    };
  }
  
  /**
   * 获取批量追踪统计
   */
  async getBatchTrackingStats(batchId: string): Promise<{
    totalSent: number;
    uniqueOpens: number;
    totalOpens: number;
    uniqueClicks: number;
    totalClicks: number;
    openRate: number;
    clickRate: number;
  }> {
    const jobs = await prisma.emailJob.findMany({
      where: { batchId, status: 'SENT' },
      include: { tracking: true },
    });
    
    let uniqueOpens = 0;
    let totalOpens = 0;
    let uniqueClicks = 0;
    let totalClicks = 0;
    
    for (const job of jobs) {
      if (job.tracking) {
        if (job.tracking.opened) uniqueOpens++;
        totalOpens += job.tracking.openCount;
        if (job.tracking.clicked) uniqueClicks++;
        totalClicks += job.tracking.clickCount;
      }
    }
    
    const totalSent = jobs.length;
    
    return {
      totalSent,
      uniqueOpens,
      totalOpens,
      uniqueClicks,
      totalClicks,
      openRate: totalSent > 0 ? (uniqueOpens / totalSent) * 100 : 0,
      clickRate: uniqueOpens > 0 ? (uniqueClicks / uniqueOpens) * 100 : 0,
    };
  }
  
  /**
   * 去重检查
   */
  private async checkAndSetDedup(key: string): Promise<boolean> {
    const result = await redis.set(
      key,
      '1',
      'EX',
      config.tracking.deduplicationTTL,
      'NX'
    );
    
    // 如果返回 null，说明 key 已存在，是重复
    return result === null;
  }
  
  /**
   * 返回1x1透明像素
   */
  getTrackingPixel(): Buffer {
    // 1x1 透明 GIF
    return Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );
  }
}

export const trackingService = new TrackingService();
