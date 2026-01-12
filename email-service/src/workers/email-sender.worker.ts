import { Worker, Job } from 'bullmq';
import { EmailStatus, EmailEventType } from '@prisma/client';
import { redis } from '../config/redis.js';
import { prisma } from '../config/database.js';
import { config } from '../config/index.js';
import { createLogger } from '../utils/logger.js';
import { failoverService } from '../services/failover.service.js';
import { EmailJobData, SendResult } from '../types/email.types.js';

const logger = createLogger('email-sender-worker');

export class EmailSenderWorker {
  private worker: Worker<EmailJobData>;
  
  constructor() {
    this.worker = new Worker<EmailJobData>(
      config.queue.emailQueue,
      async (job) => this.processJob(job),
      {
        connection: redis,
        concurrency: config.queue.defaultConcurrency,
        limiter: {
          max: 100,
          duration: 1000, // 每秒最多 100 个任务
        },
      }
    );
    
    this.setupEventListeners();
  }
  
  private setupEventListeners(): void {
    this.worker.on('completed', (job) => {
      logger.info({ jobId: job.id }, 'Email job completed');
    });
    
    this.worker.on('failed', (job, error) => {
      logger.error({ jobId: job?.id, error: error.message }, 'Email job failed');
    });
    
    this.worker.on('error', (error) => {
      logger.error({ error }, 'Worker error');
    });
  }
  
  private async processJob(job: Job<EmailJobData>): Promise<void> {
    const { jobId, to, toName, from, fromName, subject, html, text, trackingId, attempt } = job.data;
    
    logger.info({ jobId, to, attempt: job.attemptsMade }, 'Processing email job');
    
    try {
      // 更新状态为发送中
      await prisma.emailJob.update({
        where: { id: jobId },
        data: {
          status: EmailStatus.SENDING,
          attempts: job.attemptsMade + 1,
        },
      });
      
      // 选择提供商
      const { provider, providerConfig } = await failoverService.selectProvider();
      
      logger.debug(
        { jobId, provider: providerConfig.name },
        'Using email provider'
      );
      
      // 发送邮件
      const result: SendResult = await provider.send({
        to,
        toName,
        from,
        fromName,
        subject,
        html,
        text,
      });
      
      if (result.success) {
        // 记录成功
        await failoverService.recordSuccess(providerConfig.type);
        
        // 更新数据库
        await prisma.emailJob.update({
          where: { id: jobId },
          data: {
            status: EmailStatus.SENT,
            providerUsed: providerConfig.type,
            messageId: result.messageId,
            sentAt: new Date(),
            lastError: null,
          },
        });
        
        // 记录事件
        await prisma.emailEvent.create({
          data: {
            emailJobId: jobId,
            eventType: EmailEventType.SENT,
            provider: providerConfig.type,
            eventData: { messageId: result.messageId },
          },
        });
        
        logger.info(
          { jobId, messageId: result.messageId, provider: providerConfig.name },
          'Email sent successfully'
        );
      } else {
        // 发送失败
        await this.handleSendFailure(job, result, providerConfig.type);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error({ jobId, error: errorMessage }, 'Error processing email job');
      
      // 更新错误信息
      await prisma.emailJob.update({
        where: { id: jobId },
        data: {
          lastError: errorMessage,
        },
      });
      
      throw error; // 让 BullMQ 处理重试
    }
  }
  
  private async handleSendFailure(
    job: Job<EmailJobData>,
    result: SendResult,
    providerType: string
  ): Promise<void> {
    const { jobId } = job.data;
    
    // 记录失败
    await failoverService.recordFailure(
      result.provider,
      result.error || 'Unknown error',
      result.isRetryable || false
    );
    
    // 更新数据库
    await prisma.emailJob.update({
      where: { id: jobId },
      data: {
        lastError: result.error,
        providerUsed: result.provider,
      },
    });
    
    // 检查是否应该重试
    if (result.isRetryable && job.attemptsMade < (job.opts.attempts || config.queue.retryAttempts)) {
      logger.warn(
        { jobId, error: result.error, attempt: job.attemptsMade },
        'Email send failed, will retry'
      );
      throw new Error(result.error || 'Send failed'); // 抛出错误触发重试
    }
    
    // 标记为最终失败
    await prisma.emailJob.update({
      where: { id: jobId },
      data: {
        status: EmailStatus.FAILED,
      },
    });
    
    // 记录失败事件
    await prisma.emailEvent.create({
      data: {
        emailJobId: jobId,
        eventType: EmailEventType.FAILED,
        provider: result.provider,
        eventData: { error: result.error, errorCode: result.errorCode },
      },
    });
    
    logger.error(
      { jobId, error: result.error },
      'Email send permanently failed'
    );
  }
  
  /**
   * 启动 Worker
   */
  async start(): Promise<void> {
    logger.info('Email sender worker started');
  }
  
  /**
   * 关闭 Worker
   */
  async close(): Promise<void> {
    await this.worker.close();
    logger.info('Email sender worker closed');
  }
}

export const emailSenderWorker = new EmailSenderWorker();
