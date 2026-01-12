import { Queue, QueueEvents } from 'bullmq';
import { EmailStatus, EmailType } from '@prisma/client';
import { prisma } from '../config/database.js';
import { redis } from '../config/redis.js';
import { config } from '../config/index.js';
import { createLogger } from '../utils/logger.js';
import { EmailJobData } from '../types/email.types.js';

const logger = createLogger('queue-service');

export interface QueueJobOptions {
  priority?: number;
  delay?: number;
  attempts?: number;
  backoff?: {
    type: 'exponential' | 'fixed';
    delay: number;
  };
}

export class QueueService {
  private emailQueue: Queue<EmailJobData>;
  private queueEvents: QueueEvents;
  
  constructor() {
    this.emailQueue = new Queue<EmailJobData>(config.queue.emailQueue, {
      connection: redis,
      defaultJobOptions: {
        attempts: config.queue.retryAttempts,
        backoff: {
          type: 'exponential',
          delay: config.queue.retryDelay[0],
        },
        removeOnComplete: {
          age: 86400, // 24 hours
          count: 1000,
        },
        removeOnFail: {
          age: 604800, // 7 days
        },
      },
    });
    
    this.queueEvents = new QueueEvents(config.queue.emailQueue, {
      connection: redis,
    });
    
    this.setupEventListeners();
  }
  
  private setupEventListeners(): void {
    this.queueEvents.on('completed', ({ jobId }) => {
      logger.debug({ jobId }, 'Job completed');
    });
    
    this.queueEvents.on('failed', ({ jobId, failedReason }) => {
      logger.error({ jobId, reason: failedReason }, 'Job failed');
    });
    
    this.queueEvents.on('stalled', ({ jobId }) => {
      logger.warn({ jobId }, 'Job stalled');
    });
  }
  
  /**
   * 添加邮件任务到队列
   */
  async addEmailJob(
    jobData: EmailJobData,
    options: QueueJobOptions = {}
  ): Promise<string> {
    // 根据优先级设置延迟策略
    const priority = options.priority ?? 3;
    
    const job = await this.emailQueue.add(
      'send-email',
      jobData,
      {
        priority,
        delay: options.delay,
        attempts: options.attempts || config.queue.retryAttempts,
        jobId: jobData.jobId,
        backoff: options.backoff || {
          type: 'exponential',
          delay: config.queue.retryDelay[0],
        },
      }
    );
    
    // 更新数据库状态
    await prisma.emailJob.update({
      where: { id: jobData.jobId },
      data: { status: EmailStatus.QUEUED },
    });
    
    // 记录事件
    await prisma.emailEvent.create({
      data: {
        emailJobId: jobData.jobId,
        eventType: 'QUEUED',
        eventData: { queueJobId: job.id },
      },
    });
    
    logger.info(
      { jobId: jobData.jobId, priority, emailType: jobData.emailType },
      'Email job added to queue'
    );
    
    return job.id || jobData.jobId;
  }
  
  /**
   * 批量添加邮件任务
   */
  async addBulkEmailJobs(
    jobs: Array<{ data: EmailJobData; options?: QueueJobOptions }>
  ): Promise<string[]> {
    const bulkJobs = jobs.map(({ data, options }) => ({
      name: 'send-email',
      data,
      opts: {
        priority: options?.priority ?? 3,
        delay: options?.delay,
        attempts: options?.attempts || config.queue.retryAttempts,
        jobId: data.jobId,
      },
    }));
    
    const addedJobs = await this.emailQueue.addBulk(bulkJobs);
    
    // 批量更新数据库状态
    const jobIds = jobs.map(j => j.data.jobId);
    await prisma.emailJob.updateMany({
      where: { id: { in: jobIds } },
      data: { status: EmailStatus.QUEUED },
    });
    
    // 批量创建事件
    await prisma.emailEvent.createMany({
      data: jobIds.map(jobId => ({
        emailJobId: jobId,
        eventType: 'QUEUED' as const,
        eventData: {},
      })),
    });
    
    logger.info({ count: jobs.length }, 'Bulk email jobs added to queue');
    
    return addedJobs.map(j => j.id || '');
  }
  
  /**
   * 重试失败的任务
   */
  async retryJob(jobId: string): Promise<boolean> {
    const job = await this.emailQueue.getJob(jobId);
    
    if (!job) {
      logger.warn({ jobId }, 'Job not found for retry');
      return false;
    }
    
    await job.retry();
    
    await prisma.emailJob.update({
      where: { id: jobId },
      data: { status: EmailStatus.QUEUED },
    });
    
    logger.info({ jobId }, 'Job retried');
    return true;
  }
  
  /**
   * 取消任务
   */
  async cancelJob(jobId: string): Promise<boolean> {
    const job = await this.emailQueue.getJob(jobId);
    
    if (!job) {
      // 任务可能还未入队，直接更新数据库
      await prisma.emailJob.update({
        where: { id: jobId },
        data: { status: EmailStatus.CANCELLED },
      });
      return true;
    }
    
    const state = await job.getState();
    
    // 只有等待中的任务可以取消
    if (state === 'waiting' || state === 'delayed') {
      await job.remove();
      
      await prisma.emailJob.update({
        where: { id: jobId },
        data: { status: EmailStatus.CANCELLED },
      });
      
      logger.info({ jobId }, 'Job cancelled');
      return true;
    }
    
    logger.warn({ jobId, state }, 'Cannot cancel job in current state');
    return false;
  }
  
  /**
   * 获取队列统计
   */
  async getQueueStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.emailQueue.getWaitingCount(),
      this.emailQueue.getActiveCount(),
      this.emailQueue.getCompletedCount(),
      this.emailQueue.getFailedCount(),
      this.emailQueue.getDelayedCount(),
    ]);
    
    return { waiting, active, completed, failed, delayed };
  }
  
  /**
   * 暂停队列
   */
  async pauseQueue(): Promise<void> {
    await this.emailQueue.pause();
    logger.info('Email queue paused');
  }
  
  /**
   * 恢复队列
   */
  async resumeQueue(): Promise<void> {
    await this.emailQueue.resume();
    logger.info('Email queue resumed');
  }
  
  /**
   * 清理队列
   */
  async cleanQueue(grace: number = 0): Promise<void> {
    await this.emailQueue.clean(grace, 1000, 'completed');
    await this.emailQueue.clean(grace, 1000, 'failed');
    logger.info('Email queue cleaned');
  }
  
  /**
   * 关闭队列
   */
  async close(): Promise<void> {
    await this.queueEvents.close();
    await this.emailQueue.close();
    logger.info('Queue service closed');
  }
  
  /**
   * 获取队列实例（供 Worker 使用）
   */
  getQueue(): Queue<EmailJobData> {
    return this.emailQueue;
  }
}

export const queueService = new QueueService();
