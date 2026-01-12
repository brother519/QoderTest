import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import { config } from '../config';
import logger from '../utils/logger';
import { 
  TaskData, 
  TaskResult, 
  TaskStatus,
  JobOptions,
  TaskPriority,
} from '../types/queue.types';

// Priority mapping
const PRIORITY_MAP: Record<TaskPriority, number> = {
  critical: 1,
  high: 2,
  normal: 3,
  low: 4,
};

// Default job options
const DEFAULT_JOB_OPTIONS: JobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000,
  },
  priority: PRIORITY_MAP.normal,
  removeOnComplete: {
    age: 3600, // 1 hour
    count: 1000,
  },
  removeOnFail: {
    age: 86400, // 24 hours
  },
};

/**
 * Queue service for managing async image processing tasks
 */
export class QueueService {
  private readonly queues: Map<string, Queue> = new Map();
  private readonly workers: Map<string, Worker> = new Map();
  private readonly queueEvents: Map<string, QueueEvents> = new Map();
  private readonly connection: { host: string; port: number; password?: string };

  constructor() {
    this.connection = {
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
    };
  }

  /**
   * Initialize a queue
   */
  initQueue(queueName: string): Queue {
    if (this.queues.has(queueName)) {
      return this.queues.get(queueName)!;
    }

    const queue = new Queue(queueName, {
      connection: this.connection,
      defaultJobOptions: {
        attempts: DEFAULT_JOB_OPTIONS.attempts,
        backoff: DEFAULT_JOB_OPTIONS.backoff,
        removeOnComplete: DEFAULT_JOB_OPTIONS.removeOnComplete,
        removeOnFail: DEFAULT_JOB_OPTIONS.removeOnFail,
      },
    });

    this.queues.set(queueName, queue);

    // Initialize queue events
    const events = new QueueEvents(queueName, { connection: this.connection });
    this.queueEvents.set(queueName, events);

    logger.info('Queue initialized', { queueName });

    return queue;
  }

  /**
   * Add job to queue
   */
  async addJob(
    queueName: string,
    data: TaskData,
    options?: Partial<JobOptions>
  ): Promise<string> {
    const queue = this.initQueue(queueName);

    const jobOptions = {
      ...DEFAULT_JOB_OPTIONS,
      ...options,
      priority: PRIORITY_MAP[data.priority] || PRIORITY_MAP.normal,
    };

    const job = await queue.add(data.type, data, jobOptions);

    logger.debug('Job added to queue', {
      queueName,
      jobId: job.id,
      type: data.type,
      priority: data.priority,
    });

    return job.id || '';
  }

  /**
   * Get job by ID
   */
  async getJob(queueName: string, jobId: string): Promise<Job | null> {
    const queue = this.initQueue(queueName);
    return queue.getJob(jobId);
  }

  /**
   * Get job status
   */
  async getJobStatus(queueName: string, jobId: string): Promise<TaskResult | null> {
    const job = await this.getJob(queueName, jobId);

    if (!job) {
      return null;
    }

    const state = await job.getState();
    
    let status: TaskStatus;
    switch (state) {
      case 'completed':
        status = 'completed';
        break;
      case 'failed':
        status = 'failed';
        break;
      case 'active':
        status = 'processing';
        break;
      default:
        status = 'pending';
    }

    return {
      taskId: jobId,
      status,
      progress: job.progress as number || 0,
      results: job.returnvalue,
      error: job.failedReason,
      completedAt: job.finishedOn,
    };
  }

  /**
   * Create a worker for processing jobs
   */
  createWorker(
    queueName: string,
    processor: (job: Job<TaskData>) => Promise<unknown>,
    concurrency?: number
  ): Worker {
    if (this.workers.has(queueName)) {
      return this.workers.get(queueName)!;
    }

    const worker = new Worker(queueName, processor, {
      connection: this.connection,
      concurrency: concurrency || config.worker.concurrency,
    });

    // Worker event handlers
    worker.on('completed', (job) => {
      logger.debug('Job completed', { queueName, jobId: job.id });
    });

    worker.on('failed', (job, error) => {
      logger.error('Job failed', {
        queueName,
        jobId: job?.id,
        error: error.message,
      });
    });

    worker.on('error', (error) => {
      logger.error('Worker error', { queueName, error: error.message });
    });

    this.workers.set(queueName, worker);

    logger.info('Worker created', { queueName, concurrency: concurrency || config.worker.concurrency });

    return worker;
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(queueName: string): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    const queue = this.initQueue(queueName);

    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    return { waiting, active, completed, failed, delayed };
  }

  /**
   * Pause queue
   */
  async pauseQueue(queueName: string): Promise<void> {
    const queue = this.initQueue(queueName);
    await queue.pause();
    logger.info('Queue paused', { queueName });
  }

  /**
   * Resume queue
   */
  async resumeQueue(queueName: string): Promise<void> {
    const queue = this.initQueue(queueName);
    await queue.resume();
    logger.info('Queue resumed', { queueName });
  }

  /**
   * Clean old jobs
   */
  async cleanQueue(
    queueName: string,
    grace: number = 3600000, // 1 hour in ms
    limit: number = 1000
  ): Promise<void> {
    const queue = this.initQueue(queueName);

    await Promise.all([
      queue.clean(grace, limit, 'completed'),
      queue.clean(grace * 24, limit, 'failed'),
    ]);

    logger.info('Queue cleaned', { queueName });
  }

  /**
   * Close all connections
   */
  async close(): Promise<void> {
    // Close all workers
    for (const [name, worker] of this.workers) {
      await worker.close();
      logger.debug('Worker closed', { queueName: name });
    }

    // Close all queue events
    for (const [name, events] of this.queueEvents) {
      await events.close();
      logger.debug('Queue events closed', { queueName: name });
    }

    // Close all queues
    for (const [name, queue] of this.queues) {
      await queue.close();
      logger.debug('Queue closed', { queueName: name });
    }

    this.workers.clear();
    this.queueEvents.clear();
    this.queues.clear();

    logger.info('All queue connections closed');
  }
}

// Queue names
export const QUEUE_NAMES = {
  IMAGE_UPLOAD: 'image-upload',
  IMAGE_TRANSFORM: 'image-transform',
  THUMBNAIL_GENERATION: 'thumbnail-generation',
} as const;

// Export singleton instance
export const queueService = new QueueService();
