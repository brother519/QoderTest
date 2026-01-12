import { Request, Response, NextFunction } from 'express';
import { imageProcessor } from '../../services/image-processor.service';
import { storage } from '../../services/storage.service';
import { cache } from '../../services/cache.service';
import { AppError, ErrorCode } from '../../utils/error-codes';
import logger from '../../utils/logger';

/**
 * Metadata controller for EXIF data extraction
 */
export class MetadataController {
  /**
   * Get full image metadata including EXIF
   * GET /api/v1/images/:id/metadata
   */
  async getMetadata(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const includeExif = req.query.exif !== 'false';

      // Try cache first
      const cachedMeta = await cache.getCachedMetadata(id) as {
        storageKey?: string;
        width?: number;
        height?: number;
        format?: string;
        size?: number;
        hasAlpha?: boolean;
        exif?: Record<string, unknown>;
        originalName?: string;
        uploadedAt?: number;
      } | null;

      if (!cachedMeta) {
        throw new AppError(ErrorCode.IMAGE_NOT_FOUND, 'Image not found');
      }

      // Return cached metadata
      const response: Record<string, unknown> = {
        imageId: id,
        originalName: cachedMeta.originalName,
        dimensions: {
          width: cachedMeta.width,
          height: cachedMeta.height,
        },
        format: cachedMeta.format,
        fileSize: cachedMeta.size,
        hasAlpha: cachedMeta.hasAlpha,
        uploadedAt: cachedMeta.uploadedAt
          ? new Date(cachedMeta.uploadedAt).toISOString()
          : undefined,
      };

      // Include EXIF if requested and available
      if (includeExif && cachedMeta.exif) {
        response.exif = cachedMeta.exif;
      }

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Re-extract metadata from image
   * POST /api/v1/images/:id/metadata/refresh
   */
  async refreshMetadata(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      // Get current metadata for storage key
      const currentMeta = await cache.getCachedMetadata(id) as {
        storageKey?: string;
        userId?: string;
        originalName?: string;
      } | null;

      if (!currentMeta || !currentMeta.storageKey) {
        throw new AppError(ErrorCode.IMAGE_NOT_FOUND, 'Image not found');
      }

      // Download image
      const buffer = await storage.download(currentMeta.storageKey);

      // Re-extract metadata
      const metadata = await imageProcessor.extractMetadata(buffer);

      // Update cache
      await cache.cacheMetadata(id, {
        ...metadata,
        storageKey: currentMeta.storageKey,
        userId: currentMeta.userId,
        originalName: currentMeta.originalName,
        uploadedAt: Date.now(),
      });

      logger.info('Metadata refreshed', { imageId: id });

      res.json({
        imageId: id,
        dimensions: {
          width: metadata.width,
          height: metadata.height,
        },
        format: metadata.format,
        fileSize: metadata.size,
        hasAlpha: metadata.hasAlpha,
        exif: metadata.exif,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const metadataController = new MetadataController();
