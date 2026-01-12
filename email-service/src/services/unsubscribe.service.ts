import jwt from 'jsonwebtoken';
import { UnsubscribeSource } from '@prisma/client';
import { prisma } from '../config/database.js';
import { config } from '../config/index.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('unsubscribe-service');

interface UnsubscribeTokenPayload {
  email: string;
  timestamp: number;
}

export class UnsubscribeService {
  /**
   * 生成退订 Token
   */
  generateToken(email: string): string {
    const payload: UnsubscribeTokenPayload = {
      email,
      timestamp: Date.now(),
    };
    
    return jwt.sign(payload, config.unsubscribe.secret, {
      expiresIn: config.unsubscribe.tokenExpiry,
    });
  }
  
  /**
   * 验证退订 Token
   */
  verifyToken(token: string): UnsubscribeTokenPayload | null {
    try {
      const payload = jwt.verify(token, config.unsubscribe.secret) as UnsubscribeTokenPayload;
      return payload;
    } catch (error) {
      logger.warn({ error }, 'Invalid unsubscribe token');
      return null;
    }
  }
  
  /**
   * 添加到退订列表
   */
  async addToUnsubscribeList(
    email: string,
    reason?: string,
    source: UnsubscribeSource = UnsubscribeSource.LINK
  ): Promise<void> {
    await prisma.unsubscribeList.upsert({
      where: { email },
      update: {
        reason,
        source,
        isActive: true,
        unsubscribedAt: new Date(),
        resubscribedAt: null,
      },
      create: {
        email,
        reason,
        source,
        isActive: true,
      },
    });
    
    logger.info({ email, source }, 'Email added to unsubscribe list');
  }
  
  /**
   * 从退订列表移除（重新订阅）
   */
  async removeFromUnsubscribeList(email: string): Promise<void> {
    await prisma.unsubscribeList.update({
      where: { email },
      data: {
        isActive: false,
        resubscribedAt: new Date(),
      },
    });
    
    logger.info({ email }, 'Email removed from unsubscribe list');
  }
  
  /**
   * 检查是否已退订
   */
  async isUnsubscribed(email: string): Promise<boolean> {
    const record = await prisma.unsubscribeList.findUnique({
      where: { email },
    });
    
    return record?.isActive === true;
  }
  
  /**
   * 批量检查退订状态
   */
  async getUnsubscribedEmails(emails: string[]): Promise<string[]> {
    const records = await prisma.unsubscribeList.findMany({
      where: {
        email: { in: emails },
        isActive: true,
      },
      select: { email: true },
    });
    
    return records.map(r => r.email);
  }
  
  /**
   * 处理退订请求（通过 Token）
   */
  async processUnsubscribe(
    token: string,
    reason?: string
  ): Promise<{ success: boolean; email?: string; error?: string }> {
    const payload = this.verifyToken(token);
    
    if (!payload) {
      return { success: false, error: 'Invalid or expired token' };
    }
    
    await this.addToUnsubscribeList(payload.email, reason, UnsubscribeSource.LINK);
    
    return { success: true, email: payload.email };
  }
  
  /**
   * 获取退订统计
   */
  async getUnsubscribeStats(): Promise<{
    total: number;
    bySource: Record<string, number>;
    recent: number;
  }> {
    const [total, bySource, recent] = await Promise.all([
      prisma.unsubscribeList.count({ where: { isActive: true } }),
      prisma.unsubscribeList.groupBy({
        by: ['source'],
        where: { isActive: true },
        _count: true,
      }),
      prisma.unsubscribeList.count({
        where: {
          isActive: true,
          unsubscribedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days
          },
        },
      }),
    ]);
    
    const bySourceMap: Record<string, number> = {};
    for (const item of bySource) {
      bySourceMap[item.source] = item._count;
    }
    
    return {
      total,
      bySource: bySourceMap,
      recent,
    };
  }
}

export const unsubscribeService = new UnsubscribeService();
