import { Request, Response, NextFunction } from 'express';
import { imageProcessor } from '../../services/image-processor.service';
import { storage, StorageService } from '../../services/storage.service';
import { cache } from '../../services/cache.service';
import { queueService, QUEUE_NAMES } from '../../services/queue.service';
import { AppError, ErrorCode } from '../../utils/error-codes';
import { parseTransformParams, generateParamsHash, getBestFormat } from '../../utils/url-parser';
import logger from '../../utils/logger';
import { TransformTaskData, ThumbnailTaskData } from '../../types/queue.types';
import { TransformParams, OutputFormat } from '../../types/image.types';

/**
 * Transform controller for real-time image transformation
 */
export class TransformController {
  /**
   * Transform image with URL parameters
   * GET /api/v1/images/:id/transform
   */
  async transform(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      // Parse transform parameters
      const params = parseTransformParams(req.query as Record<string, unknown>);

      // Auto-detect best format based on Accept header
      if (!params.format) {
        const bestFormat = getBestFormat(req.headers.accept);
        if (bestFormat) {
          params.format = bestFormat;
        }
      }

      // Generate params hash for cache key
      const paramsHash = generateParamsHash(params);

      // Check cache first
      const cachedUrl = await cache.getCachedImageUrl(id, paramsHash);

      if (cachedUrl) {
        // Redirect to cached URL
        res.redirect(302, cachedUrl);
        return;
      }

      // Get image metadata to find storage key
      const metadata = await cache.getCachedMetadata(id) as { 
        storageKey?: string; 
        userId?: string;
        format?: string;
      } | null;

      if (!metadata || !metadata.storageKey) {
        throw new AppError(ErrorCode.IMAGE_NOT_FOUND, 'Image not found');
      }

      // Download original image
      const originalBuffer = await storage.download(metadata.storageKey);

      // Process image
      const processedBuffer = await imageProcessor.process(originalBuffer, {
        width: params.width,
        height: params.height,
        fit: params.fit || 'cover',
        format: params.format || 'jpeg',
        quality: params.quality || 80,
        blur: params.blur,
        sharpen: params.sharpen,
        grayscale: params.grayscale,
      });

      // Upload processed image
      const userId = metadata.userId || 'anonymous';
      const format = params.format || 'jpeg';
      const storageKey = StorageService.getTransformKey(userId, id, paramsHash, format);
      
      const url = await storage.upload(
        storageKey,
        processedBuffer,
        `image/${format}`,
        { paramsHash }
      );

      // Cache the URL
      await cache.cacheImageUrl(id, paramsHash, url);

      logger.debug('Image transformed', {
        imageId: id,
        params,
        size: processedBuffer.length,
      });

      // Return the image directly or redirect to CDN
      if (process.env.DIRECT_RESPONSE === 'true') {
        res.set('Content-Type', `image/${format}`);
        res.set('Cache-Control', 'public, max-age=31536000');
        res.send(processedBuffer);
      } else {
        res.redirect(302, url);
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate multiple thumbnail variants
   * POST /api/v1/images/:id/thumbnails
   */
  async generateThumbnails(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { variants } = req.body;

      // Get image metadata
      const metadata = await cache.getCachedMetadata(id) as { 
        storageKey?: string; 
        userId?: string;
      } | null;

      if (!metadata || !metadata.storageKey) {
        throw new AppError(ErrorCode.IMAGE_NOT_FOUND, 'Image not found');
      }

      // Add task to queue
      const taskData: ThumbnailTaskData = {
        type: 'thumbnail',
        imageId: id,
        userId: metadata.userId,
        sourcePath: metadata.storageKey,
        variants,
        priority: 'normal',
        createdAt: Date.now(),
      };

      const taskId = await queueService.addJob(QUEUE_NAMES.THUMBNAIL_GENERATION, taskData);

      logger.info('Thumbnail generation queued', {
        imageId: id,
        taskId,
        variantsCount: variants.length,
      });

      res.status(202).json({
        taskId,
        status: 'queued',
        imageId: id,
        variantsCount: variants.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get task status
   * GET /api/v1/tasks/:id
   */
  async getTaskStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      // Try to find task in different queues
      const queues = [
        QUEUE_NAMES.IMAGE_UPLOAD,
        QUEUE_NAMES.IMAGE_TRANSFORM,
        QUEUE_NAMES.THUMBNAIL_GENERATION,
      ];

      for (const queueName of queues) {
        const status = await queueService.getJobStatus(queueName, id);
        
        if (status) {
          res.json(status);
          return;
        }
      }

      // Check cached result
      const cachedResult = await cache.getCachedTaskResult(id);
      
      if (cachedResult) {
        res.json(cachedResult);
        return;
      }

      throw new AppError(ErrorCode.TASK_NOT_FOUND, 'Task not found');
    } catch (error) {
      next(error);
    }
  }
}

export const transformController = new TransformController();
