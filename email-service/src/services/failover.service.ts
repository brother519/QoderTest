import { ProviderType, EmailProvider } from '@prisma/client';
import { prisma } from '../config/database.js';
import { redis } from '../config/redis.js';
import { getProvider, BaseEmailProvider } from '../providers/index.js';
import { config } from '../config/index.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('failover-service');

const HEALTH_KEY_PREFIX = 'provider:health:';
const FAILURE_COUNT_PREFIX = 'provider:failures:';

interface ProviderHealth {
  isHealthy: boolean;
  lastCheck: Date;
  consecutiveFailures: number;
}

export class FailoverService {
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private recoveryCheckInterval: NodeJS.Timeout | null = null;
  
  /**
   * 启动健康检查
   */
  startHealthChecks(): void {
    // 定期健康检查
    this.healthCheckInterval = setInterval(
      () => this.checkAllProviders(),
      config.failover.healthCheckInterval
    );
    
    // 定期恢复检查
    this.recoveryCheckInterval = setInterval(
      () => this.attemptRecovery(),
      config.failover.recoveryCheckInterval
    );
    
    // 立即执行一次
    this.checkAllProviders();
    
    logger.info('Failover service health checks started');
  }
  
  /**
   * 停止健康检查
   */
  stopHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    if (this.recoveryCheckInterval) {
      clearInterval(this.recoveryCheckInterval);
      this.recoveryCheckInterval = null;
    }
    logger.info('Failover service health checks stopped');
  }
  
  /**
   * 选择可用的提供商
   */
  async selectProvider(): Promise<{ provider: BaseEmailProvider; providerConfig: EmailProvider }> {
    // 获取所有活跃的提供商配置
    const providers = await prisma.emailProvider.findMany({
      where: { isActive: true },
      orderBy: [{ isPrimary: 'desc' }, { priority: 'asc' }],
    });
    
    if (providers.length === 0) {
      throw new Error('No active email providers configured');
    }
    
    // 遍历提供商，选择第一个健康的
    for (const providerConfig of providers) {
      const health = await this.getProviderHealth(providerConfig.type);
      
      if (health.isHealthy) {
        // 检查是否达到每日限额
        const withinQuota = await this.checkQuota(providerConfig);
        if (withinQuota) {
          const provider = getProvider(providerConfig.type);
          return { provider, providerConfig };
        }
        logger.warn(
          { provider: providerConfig.name },
          'Provider quota exceeded, trying next'
        );
      }
    }
    
    // 如果没有健康的提供商，尝试使用主提供商
    const primary = providers.find(p => p.isPrimary) || providers[0];
    logger.warn(
      { provider: primary.name },
      'No healthy providers available, using primary as fallback'
    );
    
    return {
      provider: getProvider(primary.type),
      providerConfig: primary,
    };
  }
  
  /**
   * 记录发送失败
   */
  async recordFailure(
    providerType: ProviderType,
    error: string,
    isRetryable: boolean
  ): Promise<void> {
    const key = `${FAILURE_COUNT_PREFIX}${providerType}`;
    const failures = await redis.incr(key);
    await redis.expire(key, 300); // 5分钟过期
    
    logger.warn(
      { provider: providerType, failures, error, isRetryable },
      'Provider failure recorded'
    );
    
    // 检查是否需要标记为不健康
    if (failures >= config.failover.maxConsecutiveFailures) {
      await this.markUnhealthy(providerType);
    }
  }
  
  /**
   * 记录发送成功
   */
  async recordSuccess(providerType: ProviderType): Promise<void> {
    // 重置失败计数
    await redis.del(`${FAILURE_COUNT_PREFIX}${providerType}`);
    
    // 更新每日计数
    await prisma.emailProvider.updateMany({
      where: { type: providerType },
      data: { currentDailyCount: { increment: 1 } },
    });
  }
  
  /**
   * 标记提供商为不健康
   */
  async markUnhealthy(providerType: ProviderType): Promise<void> {
    const healthData: ProviderHealth = {
      isHealthy: false,
      lastCheck: new Date(),
      consecutiveFailures: config.failover.maxConsecutiveFailures,
    };
    
    await redis.setex(
      `${HEALTH_KEY_PREFIX}${providerType}`,
      config.failover.recoveryCheckInterval / 1000,
      JSON.stringify(healthData)
    );
    
    await prisma.emailProvider.updateMany({
      where: { type: providerType },
      data: {
        isHealthy: false,
        lastHealthCheck: new Date(),
        consecutiveFailures: config.failover.maxConsecutiveFailures,
      },
    });
    
    logger.error({ provider: providerType }, 'Provider marked as unhealthy');
  }
  
  /**
   * 标记提供商为健康
   */
  async markHealthy(providerType: ProviderType): Promise<void> {
    const healthData: ProviderHealth = {
      isHealthy: true,
      lastCheck: new Date(),
      consecutiveFailures: 0,
    };
    
    await redis.setex(
      `${HEALTH_KEY_PREFIX}${providerType}`,
      config.failover.healthCheckInterval / 1000 * 2,
      JSON.stringify(healthData)
    );
    
    await redis.del(`${FAILURE_COUNT_PREFIX}${providerType}`);
    
    await prisma.emailProvider.updateMany({
      where: { type: providerType },
      data: {
        isHealthy: true,
        lastHealthCheck: new Date(),
        consecutiveFailures: 0,
      },
    });
    
    logger.info({ provider: providerType }, 'Provider marked as healthy');
  }
  
  /**
   * 获取提供商健康状态
   */
  async getProviderHealth(providerType: ProviderType): Promise<ProviderHealth> {
    const cached = await redis.get(`${HEALTH_KEY_PREFIX}${providerType}`);
    
    if (cached) {
      return JSON.parse(cached) as ProviderHealth;
    }
    
    // 从数据库获取
    const providerConfig = await prisma.emailProvider.findFirst({
      where: { type: providerType, isActive: true },
    });
    
    if (!providerConfig) {
      return {
        isHealthy: false,
        lastCheck: new Date(),
        consecutiveFailures: 0,
      };
    }
    
    return {
      isHealthy: providerConfig.isHealthy,
      lastCheck: providerConfig.lastHealthCheck || new Date(),
      consecutiveFailures: providerConfig.consecutiveFailures,
    };
  }
  
  /**
   * 检查配额
   */
  private async checkQuota(providerConfig: EmailProvider): Promise<boolean> {
    if (!providerConfig.dailyLimit) {
      return true;
    }
    
    // 检查是否需要重置每日计数
    const lastReset = providerConfig.lastResetAt;
    const now = new Date();
    const isNewDay = lastReset.toDateString() !== now.toDateString();
    
    if (isNewDay) {
      await prisma.emailProvider.update({
        where: { id: providerConfig.id },
        data: {
          currentDailyCount: 0,
          lastResetAt: now,
        },
      });
      return true;
    }
    
    // 使用 95% 阈值
    const threshold = providerConfig.dailyLimit * 0.95;
    return providerConfig.currentDailyCount < threshold;
  }
  
  /**
   * 检查所有提供商
   */
  private async checkAllProviders(): Promise<void> {
    const providers = await prisma.emailProvider.findMany({
      where: { isActive: true },
    });
    
    for (const providerConfig of providers) {
      try {
        const provider = getProvider(providerConfig.type);
        const isHealthy = await provider.healthCheck();
        
        if (isHealthy) {
          await this.markHealthy(providerConfig.type);
        } else {
          await this.markUnhealthy(providerConfig.type);
        }
      } catch (error) {
        logger.error(
          { provider: providerConfig.name, error },
          'Health check failed'
        );
        await this.markUnhealthy(providerConfig.type);
      }
    }
  }
  
  /**
   * 尝试恢复不健康的提供商
   */
  private async attemptRecovery(): Promise<void> {
    const unhealthyProviders = await prisma.emailProvider.findMany({
      where: { isActive: true, isHealthy: false },
    });
    
    for (const providerConfig of unhealthyProviders) {
      try {
        const provider = getProvider(providerConfig.type);
        const isHealthy = await provider.healthCheck();
        
        if (isHealthy) {
          await this.markHealthy(providerConfig.type);
          logger.info(
            { provider: providerConfig.name },
            'Provider recovered'
          );
        }
      } catch (error) {
        logger.debug(
          { provider: providerConfig.name, error },
          'Recovery check failed'
        );
      }
    }
  }
  
  /**
   * 初始化提供商配置
   */
  async initializeProviders(): Promise<void> {
    // 确保 SendGrid 配置存在
    await prisma.emailProvider.upsert({
      where: { name: 'sendgrid' },
      update: {},
      create: {
        name: 'sendgrid',
        type: ProviderType.SENDGRID,
        isPrimary: true,
        priority: 1,
        isActive: true,
      },
    });
    
    // 确保 AWS SES 配置存在
    await prisma.emailProvider.upsert({
      where: { name: 'aws-ses' },
      update: {},
      create: {
        name: 'aws-ses',
        type: ProviderType.AWS_SES,
        isPrimary: false,
        priority: 2,
        isActive: true,
      },
    });
    
    logger.info('Email providers initialized');
  }
}

export const failoverService = new FailoverService();
