import { Job } from 'bullmq';
import { queueService, QUEUE_NAMES } from '../services/queue.service';
import { imageProcessor } from '../services/image-processor.service';
import { storage, StorageService } from '../services/storage.service';
import { cache } from '../services/cache.service';
import { config } from '../config';
import logger from '../utils/logger';
import {
  TaskData,
  UploadTaskData,
  TransformTaskData,
  ThumbnailTaskData,
} from '../types/queue.types';

// Default thumbnail variants
const DEFAULT_THUMBNAILS = [
  { name: 'small', width: 150, height: 150, fit: 'cover' as const },
  { name: 'medium', width: 500, height: 500, fit: 'contain' as const },
  { name: 'large', width: 1200, height: 1200, fit: 'inside' as const },
];

/**
 * Process image upload task
 */
async function processUploadTask(job: Job<UploadTaskData>): Promise<unknown> {
  const { imageId, userId, originalPath, generateThumbnails } = job.data;

  logger.info('Processing upload task', { jobId: job.id, imageId });

  try {
    // Download original image
    const originalBuffer = await storage.download(originalPath);
    await job.updateProgress(10);

    const results: Array<{ variant: string; url: string; size: number }> = [];

    if (generateThumbnails) {
      // Generate thumbnails
      const thumbnails = await imageProcessor.generateThumbnails(
        originalBuffer,
        DEFAULT_THUMBNAILS
      );
      await job.updateProgress(70);

      // Upload each thumbnail
      for (const thumb of thumbnails) {
        const key = StorageService.getProcessedKey(
          userId || 'anonymous',
          imageId,
          thumb.name,
          thumb.info.format || 'jpeg'
        );

        const url = await storage.upload(
          key,
          thumb.buffer,
          `image/${thumb.info.format || 'jpeg'}`
        );

        results.push({
          variant: thumb.name,
          url,
          size: thumb.buffer.length,
        });
      }
      await job.updateProgress(90);
    }

    // Cache task result
    await cache.cacheTaskResult(job.id || '', {
      taskId: job.id,
      status: 'completed',
      progress: 100,
      results,
      completedAt: Date.now(),
    });

    await job.updateProgress(100);

    logger.info('Upload task completed', {
      jobId: job.id,
      imageId,
      thumbnailsCount: results.length,
    });

    return { results };
  } catch (error) {
    logger.error('Upload task failed', { jobId: job.id, imageId, error });
    throw error;
  }
}

/**
 * Process image transform task
 */
async function processTransformTask(job: Job<TransformTaskData>): Promise<unknown> {
  const { imageId, userId, sourcePath, params } = job.data;

  logger.info('Processing transform task', { jobId: job.id, imageId });

  try {
    // Download source image
    const sourceBuffer = await storage.download(sourcePath);
    await job.updateProgress(30);

    // Process image
    const processedBuffer = await imageProcessor.process(sourceBuffer, {
      width: params.width,
      height: params.height,
      fit: params.fit as 'cover' | 'contain' | 'fill' | 'inside' | 'outside',
      format: params.format as 'jpeg' | 'png' | 'webp' | 'avif',
      quality: params.quality,
      blur: params.blur,
      sharpen: params.sharpen,
      grayscale: params.grayscale,
    });
    await job.updateProgress(70);

    // Generate a simple hash from params
    const paramsString = JSON.stringify(params);
    const hash = require('crypto')
      .createHash('md5')
      .update(paramsString)
      .digest('hex')
      .substring(0, 8);

    // Upload processed image
    const format = params.format || 'jpeg';
    const key = StorageService.getTransformKey(
      userId || 'anonymous',
      imageId,
      hash,
      format
    );

    const url = await storage.upload(
      key,
      processedBuffer,
      `image/${format}`
    );
    await job.updateProgress(90);

    // Cache result
    await cache.cacheImageUrl(imageId, hash, url);
    await cache.cacheTaskResult(job.id || '', {
      taskId: job.id,
      status: 'completed',
      progress: 100,
      results: [{ variant: 'transformed', url, size: processedBuffer.length }],
      completedAt: Date.now(),
    });

    await job.updateProgress(100);

    logger.info('Transform task completed', { jobId: job.id, imageId });

    return { url, size: processedBuffer.length };
  } catch (error) {
    logger.error('Transform task failed', { jobId: job.id, imageId, error });
    throw error;
  }
}

/**
 * Process thumbnail generation task
 */
async function processThumbnailTask(job: Job<ThumbnailTaskData>): Promise<unknown> {
  const { imageId, userId, sourcePath, variants } = job.data;

  logger.info('Processing thumbnail task', {
    jobId: job.id,
    imageId,
    variantsCount: variants.length,
  });

  try {
    // Download source image
    const sourceBuffer = await storage.download(sourcePath);
    await job.updateProgress(20);

    // Generate thumbnails
    const thumbnails = await imageProcessor.generateThumbnails(
      sourceBuffer,
      variants.map((v) => ({
        name: v.name,
        width: v.width,
        height: v.height,
        fit: (v.fit || 'cover') as 'cover' | 'contain' | 'fill' | 'inside' | 'outside',
        format: v.format as 'jpeg' | 'png' | 'webp' | 'avif' | undefined,
        quality: v.quality,
      }))
    );
    await job.updateProgress(60);

    const results: Array<{ variant: string; url: string; size: number }> = [];

    // Upload each thumbnail
    const progressPerThumb = 30 / thumbnails.length;
    
    for (let i = 0; i < thumbnails.length; i++) {
      const thumb = thumbnails[i];
      const format = thumb.info.format || 'jpeg';
      
      const key = StorageService.getProcessedKey(
        userId || 'anonymous',
        imageId,
        thumb.name,
        format
      );

      const url = await storage.upload(
        key,
        thumb.buffer,
        `image/${format}`
      );

      results.push({
        variant: thumb.name,
        url,
        size: thumb.buffer.length,
      });

      await job.updateProgress(60 + (i + 1) * progressPerThumb);
    }

    // Cache task result
    await cache.cacheTaskResult(job.id || '', {
      taskId: job.id,
      status: 'completed',
      progress: 100,
      results,
      completedAt: Date.now(),
    });

    await job.updateProgress(100);

    logger.info('Thumbnail task completed', {
      jobId: job.id,
      imageId,
      resultsCount: results.length,
    });

    return { results };
  } catch (error) {
    logger.error('Thumbnail task failed', { jobId: job.id, imageId, error });
    throw error;
  }
}

/**
 * Main job processor
 */
async function processJob(job: Job<TaskData>): Promise<unknown> {
  const { type } = job.data;

  switch (type) {
    case 'upload':
      return processUploadTask(job as Job<UploadTaskData>);
    case 'transform':
      return processTransformTask(job as Job<TransformTaskData>);
    case 'thumbnail':
      return processThumbnailTask(job as Job<ThumbnailTaskData>);
    default:
      throw new Error(`Unknown task type: ${type}`);
  }
}

/**
 * Start the worker
 */
async function startWorker(): Promise<void> {
  logger.info('Starting image processing worker...', {
    concurrency: config.worker.concurrency,
  });

  // Create workers for each queue
  queueService.createWorker(
    QUEUE_NAMES.IMAGE_UPLOAD,
    processJob,
    config.worker.concurrency
  );

  queueService.createWorker(
    QUEUE_NAMES.IMAGE_TRANSFORM,
    processJob,
    config.worker.concurrency
  );

  queueService.createWorker(
    QUEUE_NAMES.THUMBNAIL_GENERATION,
    processJob,
    config.worker.concurrency
  );

  logger.info('Worker started successfully');
}

// Graceful shutdown
async function shutdown(signal: string): Promise<void> {
  logger.info(`Received ${signal}, shutting down worker...`);

  try {
    await queueService.close();
    await cache.close();
    logger.info('Worker shutdown complete');
    process.exit(0);
  } catch (error) {
    logger.error('Error during worker shutdown', { error });
    process.exit(1);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Start worker
startWorker().catch((error) => {
  logger.error('Failed to start worker', { error });
  process.exit(1);
});
