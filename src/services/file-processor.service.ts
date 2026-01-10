import sharp from 'sharp';
import { thumbnailConfig } from '../config';
import { s3Service } from './s3.service';
import { logger } from '../utils/logger.util';

class FileProcessorService {
  async validateFileType(
    buffer: Buffer,
    declaredMimeType: string
  ): Promise<{ valid: boolean; detectedType?: string }> {
    try {
      const { detectFileType } = await import('../utils/file-validator.util');
      const detected = await detectFileType(buffer.slice(0, 4100));

      if (!detected) {
        return { valid: true };
      }

      const declaredBase = declaredMimeType.split('/')[0];
      const detectedBase = detected.mime.split('/')[0];

      if (declaredBase !== detectedBase) {
        logger.warn(`File type mismatch: declared=${declaredMimeType}, detected=${detected.mime}`);
        return { valid: false, detectedType: detected.mime };
      }

      return { valid: true, detectedType: detected.mime };
    } catch (error) {
      logger.error('File type validation failed', error);
      return { valid: false };
    }
  }

  async generateThumbnails(
    imageBuffer: Buffer,
    fileId: string,
    bucket: string
  ): Promise<string[]> {
    try {
      const thumbnailUrls: string[] = [];

      for (const size of thumbnailConfig.sizes) {
        const thumbnailBuffer = await sharp(imageBuffer)
          .resize(size, size, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .toFormat(thumbnailConfig.format as any, {
            quality: thumbnailConfig.quality,
          })
          .toBuffer();

        const key = `thumbnails/${fileId}/thumb_${size}.${thumbnailConfig.format}`;
        
        await s3Service.uploadFile(bucket, key, thumbnailBuffer, {
          contentType: `image/${thumbnailConfig.format}`,
        });

        thumbnailUrls.push(key);
        logger.info(`Thumbnail generated: ${key}`);
      }

      return thumbnailUrls;
    } catch (error) {
      logger.error('Failed to generate thumbnails', error);
      throw error;
    }
  }

  async extractMetadata(
    buffer: Buffer,
    mimeType: string
  ): Promise<{ width?: number; height?: number; duration?: number }> {
    try {
      if (mimeType.startsWith('image/')) {
        const metadata = await sharp(buffer).metadata();
        return {
          width: metadata.width,
          height: metadata.height,
        };
      }

      return {};
    } catch (error) {
      logger.error('Failed to extract metadata', error);
      return {};
    }
  }

  async processFileAsync(fileId: string): Promise<void> {
    try {
      const { FileModel } = await import('../models/file.model');
      const file = await FileModel.findOne({ fileId });

      if (!file) {
        throw new Error(`File not found: ${fileId}`);
      }

      await FileModel.updateOne(
        { fileId },
        { processingStatus: 'processing' }
      );

      if (file.mimeType.startsWith('image/')) {
        const buffer = await s3Service.downloadFile(file.s3Bucket, file.s3Key);
        
        const metadata = await this.extractMetadata(buffer, file.mimeType);
        const thumbnailKeys = await this.generateThumbnails(buffer, fileId, file.s3Bucket);

        const { cloudfrontService } = await import('./cloudfront.service');
        const thumbnailUrl = cloudfrontService.getPublicUrl(thumbnailKeys[1] || thumbnailKeys[0]);

        await FileModel.updateOne(
          { fileId },
          {
            'metadata.width': metadata.width,
            'metadata.height': metadata.height,
            thumbnailUrl,
            processingStatus: 'completed',
          }
        );
      } else {
        await FileModel.updateOne(
          { fileId },
          { processingStatus: 'completed' }
        );
      }

      logger.info(`File processing completed: ${fileId}`);
    } catch (error) {
      logger.error(`File processing failed: ${fileId}`, error);
      
      const { FileModel } = await import('../models/file.model');
      await FileModel.updateOne(
        { fileId },
        {
          processingStatus: 'failed',
          processingError: error instanceof Error ? error.message : 'Unknown error',
        }
      );
    }
  }
}

export const fileProcessorService = new FileProcessorService();
