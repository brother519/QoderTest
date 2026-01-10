import { FastifyRequest, FastifyReply } from 'fastify';
import { multipartUploadService } from '../services/multipart-upload.service';
import { validateMimeType, validateExtension } from '../utils/file-validator.util';
import { logger } from '../utils/logger.util';

export const uploadController = {
  async initMultipart(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as {
        fileName: string;
        fileSize: number;
        mimeType: string;
        bucket?: string;
        isPublic?: boolean;
        expiresIn?: number;
      };

      if (!validateMimeType(body.mimeType)) {
        return reply.status(400).send({
          error: 'Invalid file type',
          message: 'This file type is not allowed',
        });
      }

      if (!validateExtension(body.fileName)) {
        return reply.status(400).send({
          error: 'Invalid file extension',
          message: 'Executable files are not allowed',
        });
      }

      const userId = (request.user as any)?.userId || 'anonymous';

      const result = await multipartUploadService.initSession(userId, body);

      return reply.send({
        uploadId: result.uploadId,
        fileId: result.fileId,
        chunkSize: result.chunkSize,
        s3Key: result.s3Key,
      });
    } catch (error) {
      logger.error('Init multipart upload failed', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  async getPresignedUrl(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as {
        uploadId: string;
        partNumber: number;
      };

      const result = await multipartUploadService.getPresignedUrlForPart(
        body.uploadId,
        body.partNumber
      );

      return reply.send(result);
    } catch (error) {
      logger.error('Get presigned URL failed', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  async recordPart(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as {
        uploadId: string;
        partNumber: number;
        etag: string;
        size: number;
      };

      await multipartUploadService.recordPartUpload(
        body.uploadId,
        body.partNumber,
        body.etag,
        body.size
      );

      return reply.send({ success: true });
    } catch (error) {
      logger.error('Record part failed', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  async completeMultipart(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as {
        uploadId: string;
        parts: Array<{ partNumber: number; etag: string }>;
      };

      const result = await multipartUploadService.completeSession(
        body.uploadId,
        body.parts
      );

      return reply.send(result);
    } catch (error) {
      logger.error('Complete multipart upload failed', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  async abortMultipart(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = request.body as {
        uploadId: string;
      };

      await multipartUploadService.abortSession(body.uploadId);

      return reply.send({ success: true });
    } catch (error) {
      logger.error('Abort multipart upload failed', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  async getUploadStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const params = request.params as { uploadId: string };

      const result = await multipartUploadService.getSessionStatus(params.uploadId);

      return reply.send(result);
    } catch (error) {
      logger.error('Get upload status failed', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },
};
