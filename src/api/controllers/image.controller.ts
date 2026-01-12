import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { imageProcessor } from '../../services/image-processor.service';
import { storage, StorageService } from '../../services/storage.service';
import { cache } from '../../services/cache.service';
import { queueService, QUEUE_NAMES } from '../../services/queue.service';
import { AppError, ErrorCode } from '../../utils/error-codes';
import { validateImageFile, getExtension } from '../../utils/file-validator';
import { config } from '../../config';
import logger from '../../utils/logger';
import { UploadTaskData } from '../../types/queue.types';

/**
 * Image upload controller
 */
export class ImageController {
  /**
   * Upload a new image
   * POST /api/v1/images
   */
  async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = req.file;

      if (!file) {
        throw new AppError(ErrorCode.BAD_REQUEST, 'No file uploaded');
      }

      // Validate file
      const validation = validateImageFile(
        file.originalname,
        file.mimetype,
        file.size,
        config.processing.maxFileSize
      );

      if (!validation.valid) {
        throw new AppError(ErrorCode.INVALID_PARAMS, validation.error);
      }

      // Generate unique image ID
      const imageId = uuidv4();
      const userId = (req.body.userId as string) || 'anonymous';
      const extension = path.extname(file.originalname) || getExtension(file.mimetype) || '.jpg';

      // Upload original image to storage
      const storageKey = StorageService.getOriginalKey(userId, imageId, extension);
      await storage.upload(storageKey, file.buffer, file.mimetype, {
        originalName: file.originalname,
        uploadedAt: new Date().toISOString(),
      });

      // Extract metadata
      const metadata = await imageProcessor.extractMetadata(file.buffer);

      // Cache metadata
      await cache.cacheMetadata(imageId, {
        ...metadata,
        originalName: file.originalname,
        storageKey,
        userId,
        uploadedAt: Date.now(),
      });

      // Add async processing task if thumbnails requested
      const generateThumbnails = req.body.generateThumbnails !== 'false';
      let taskId: string | undefined;

      if (generateThumbnails) {
        const taskData: UploadTaskData = {
          type: 'upload',
          imageId,
          userId,
          originalPath: storageKey,
          generateThumbnails: true,
          watermarkTemplate: req.body.watermarkTemplate,
          priority: 'normal',
          createdAt: Date.now(),
        };

        taskId = await queueService.addJob(QUEUE_NAMES.IMAGE_UPLOAD, taskData);
      }

      logger.info('Image uploaded', { imageId, userId, size: file.size });

      res.status(202).json({
        imageId,
        taskId,
        status: generateThumbnails ? 'processing' : 'completed',
        originalUrl: storage.getPublicUrl(storageKey),
        metadata: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          size: metadata.size,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get image metadata
   * GET /api/v1/images/:id/metadata
   */
  async getMetadata(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      // Try cache first
      const cachedMeta = await cache.getCachedMetadata(id);

      if (cachedMeta) {
        res.json({
          imageId: id,
          ...cachedMeta,
        });
        return;
      }

      // If not in cache, image doesn't exist or metadata was evicted
      throw new AppError(ErrorCode.IMAGE_NOT_FOUND, 'Image not found');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete an image
   * DELETE /api/v1/images/:id
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      // Get metadata to find storage keys
      const metadata = await cache.getCachedMetadata(id) as { storageKey?: string; userId?: string } | null;

      if (!metadata) {
        throw new AppError(ErrorCode.IMAGE_NOT_FOUND, 'Image not found');
      }

      // Delete original
      if (metadata.storageKey) {
        await storage.delete(metadata.storageKey);
      }

      // Delete processed variants
      const userId = metadata.userId || 'anonymous';
      const variants = await storage.list(`processed/${userId}/${id}/`);
      
      await Promise.all(variants.map((key) => storage.delete(key)));

      // Delete transformed images
      const transformed = await storage.list(`transformed/${userId}/${id}/`);
      
      await Promise.all(transformed.map((key) => storage.delete(key)));

      // Invalidate cache
      await cache.invalidateImage(id);
      await cache.delete(`image:meta:${id}`);

      logger.info('Image deleted', { imageId: id });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const imageController = new ImageController();
