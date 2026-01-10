import { randomUUID } from 'crypto';
import { s3Service } from './s3.service';
import { cloudfrontService } from './cloudfront.service';
import { fileProcessorService } from './file-processor.service';
import { MultipartSessionModel } from '../models/multipart-session.model';
import { FileModel } from '../models/file.model';
import { s3Config, uploadConfig } from '../config';
import { logger } from '../utils/logger.util';

const MIN_CHUNK_SIZE = 5 * 1024 * 1024;
const MAX_PARTS = 10000;

class MultipartUploadService {
  calculateChunkSize(fileSize: number): number {
    const calculatedSize = Math.max(MIN_CHUNK_SIZE, Math.ceil(fileSize / MAX_PARTS));
    return Math.min(calculatedSize, uploadConfig.maxChunkSize);
  }

  async initSession(
    userId: string,
    fileInfo: {
      fileName: string;
      fileSize: number;
      mimeType: string;
      bucket?: string;
      isPublic?: boolean;
      expiresIn?: number;
    }
  ): Promise<{ uploadId: string; fileId: string; chunkSize: number; s3Key: string }> {
    try {
      const uploadId = randomUUID();
      const fileId = randomUUID();
      const bucket = fileInfo.bucket || (fileInfo.isPublic ? s3Config.buckets.public : s3Config.buckets.private);
      const s3Key = `uploads/${userId}/${fileId}/${fileInfo.fileName}`;
      const chunkSize = this.calculateChunkSize(fileInfo.fileSize);
      const totalParts = Math.ceil(fileInfo.fileSize / chunkSize);

      const s3Upload = await s3Service.createMultipartUpload(bucket, s3Key, {
        contentType: fileInfo.mimeType,
        metadata: {
          originalName: fileInfo.fileName,
          userId,
        },
      });

      const session = new MultipartSessionModel({
        uploadId,
        fileId,
        s3Key,
        s3Bucket: bucket,
        s3UploadId: s3Upload.uploadId,
        fileName: fileInfo.fileName,
        mimeType: fileInfo.mimeType,
        totalSize: fileInfo.fileSize,
        chunkSize,
        totalParts,
        uploadedParts: [],
        status: 'active',
        userId,
        isPublic: fileInfo.isPublic || false,
        expiresAt: fileInfo.expiresIn ? new Date(Date.now() + fileInfo.expiresIn * 1000) : undefined,
      });

      await session.save();

      logger.info(`Multipart session initialized: ${uploadId}`);
      return { uploadId, fileId, chunkSize, s3Key };
    } catch (error) {
      logger.error('Failed to initialize multipart session', error);
      throw error;
    }
  }

  async getPresignedUrlForPart(
    uploadId: string,
    partNumber: number
  ): Promise<{ presignedUrl: string; partNumber: number }> {
    try {
      const session = await MultipartSessionModel.findOne({ uploadId, status: 'active' });

      if (!session) {
        throw new Error('Session not found or not active');
      }

      const presignedUrl = await s3Service.generateUploadPresignedUrl(
        session.s3Bucket,
        session.s3Key,
        partNumber,
        session.s3UploadId
      );

      return { presignedUrl, partNumber };
    } catch (error) {
      logger.error('Failed to get presigned URL for part', error);
      throw error;
    }
  }

  async recordPartUpload(
    uploadId: string,
    partNumber: number,
    etag: string,
    size: number
  ): Promise<void> {
    try {
      const session = await MultipartSessionModel.findOne({ uploadId });

      if (!session) {
        throw new Error('Session not found');
      }

      const existingPart = session.uploadedParts.find(p => p.partNumber === partNumber);
      
      if (existingPart) {
        existingPart.etag = etag;
        existingPart.size = size;
        existingPart.uploadedAt = new Date();
      } else {
        session.uploadedParts.push({
          partNumber,
          etag,
          size,
          uploadedAt: new Date(),
        });
      }

      await session.save();
      logger.info(`Part recorded: ${uploadId} part ${partNumber}`);
    } catch (error) {
      logger.error('Failed to record part upload', error);
      throw error;
    }
  }

  async completeSession(
    uploadId: string,
    parts: Array<{ partNumber: number; etag: string }>
  ): Promise<{ fileId: string; url: string; thumbnailUrl?: string }> {
    try {
      const session = await MultipartSessionModel.findOne({ uploadId, status: 'active' });

      if (!session) {
        throw new Error('Session not found or not active');
      }

      const sortedParts = parts.sort((a, b) => a.partNumber - b.partNumber);

      const result = await s3Service.completeMultipartUpload(
        session.s3Bucket,
        session.s3Key,
        session.s3UploadId,
        sortedParts
      );

      const cdnUrl = session.isPublic
        ? cloudfrontService.getPublicUrl(session.s3Key)
        : cloudfrontService.getPublicUrl(session.s3Key);

      const file = new FileModel({
        fileId: session.fileId,
        fileName: session.fileName,
        originalName: session.fileName,
        mimeType: session.mimeType,
        size: session.totalSize,
        s3Key: session.s3Key,
        s3Bucket: session.s3Bucket,
        s3ETag: result.etag,
        cdnUrl,
        isPublic: session.isPublic,
        accessLevel: session.isPublic ? 'public' : 'private',
        expiresAt: session.expiresAt,
        userId: session.userId,
        permissions: {
          allowedUsers: [],
          allowedRoles: [],
        },
        metadata: {
          custom: {},
        },
        stats: {
          downloads: 0,
          views: 0,
        },
        processingStatus: 'pending',
      });

      await file.save();

      session.status = 'completed';
      await session.save();

      setImmediate(() => {
        fileProcessorService.processFileAsync(session.fileId).catch(err => {
          logger.error('Async file processing failed', err);
        });
      });

      logger.info(`Multipart upload completed: ${uploadId}`);
      return {
        fileId: session.fileId,
        url: cdnUrl,
      };
    } catch (error) {
      logger.error('Failed to complete multipart session', error);
      throw error;
    }
  }

  async abortSession(uploadId: string): Promise<void> {
    try {
      const session = await MultipartSessionModel.findOne({ uploadId });

      if (!session) {
        throw new Error('Session not found');
      }

      await s3Service.abortMultipartUpload(
        session.s3Bucket,
        session.s3Key,
        session.s3UploadId
      );

      session.status = 'aborted';
      await session.save();

      logger.info(`Multipart session aborted: ${uploadId}`);
    } catch (error) {
      logger.error('Failed to abort multipart session', error);
      throw error;
    }
  }

  async getSessionStatus(uploadId: string): Promise<{
    uploadId: string;
    uploadedParts: Array<{ partNumber: number; etag: string; size: number }>;
    totalParts: number;
    status: string;
  }> {
    try {
      const session = await MultipartSessionModel.findOne({ uploadId });

      if (!session) {
        throw new Error('Session not found');
      }

      return {
        uploadId: session.uploadId,
        uploadedParts: session.uploadedParts.map(p => ({
          partNumber: p.partNumber,
          etag: p.etag,
          size: p.size,
        })),
        totalParts: session.totalParts,
        status: session.status,
      };
    } catch (error) {
      logger.error('Failed to get session status', error);
      throw error;
    }
  }

  async cleanupExpiredSessions(): Promise<void> {
    try {
      const expiredSessions = await MultipartSessionModel.find({
        status: 'active',
        createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      });

      for (const session of expiredSessions) {
        try {
          await s3Service.abortMultipartUpload(
            session.s3Bucket,
            session.s3Key,
            session.s3UploadId
          );

          session.status = 'expired';
          await session.save();

          logger.info(`Expired session cleaned up: ${session.uploadId}`);
        } catch (error) {
          logger.error(`Failed to cleanup session: ${session.uploadId}`, error);
        }
      }

      logger.info(`Cleaned up ${expiredSessions.length} expired sessions`);
    } catch (error) {
      logger.error('Failed to cleanup expired sessions', error);
    }
  }
}

export const multipartUploadService = new MultipartUploadService();
