import { FastifyRequest, FastifyReply } from 'fastify';
import { FileModel } from '../models/file.model';
import { s3Service } from '../services/s3.service';
import { cloudfrontService } from '../services/cloudfront.service';
import { logger } from '../utils/logger.util';

export const fileController = {
  async listFiles(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = request.query as {
        page?: string;
        limit?: string;
        bucket?: string;
        mimeType?: string;
        sortBy?: string;
      };

      const page = parseInt(query.page || '1');
      const limit = parseInt(query.limit || '20');
      const skip = (page - 1) * limit;

      const filter: any = {};
      if (query.bucket) filter.s3Bucket = query.bucket;
      if (query.mimeType) filter.mimeType = new RegExp(query.mimeType);

      const userId = (request.user as any)?.userId;
      if (userId) filter.userId = userId;

      const sort: any = {};
      if (query.sortBy === 'size') sort.size = -1;
      else if (query.sortBy === 'name') sort.fileName = 1;
      else sort.createdAt = -1;

      const [files, total] = await Promise.all([
        FileModel.find(filter).sort(sort).skip(skip).limit(limit),
        FileModel.countDocuments(filter),
      ]);

      return reply.send({
        files,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      logger.error('List files failed', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  async getFile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const params = request.params as { fileId: string };

      const file = await FileModel.findOne({ fileId: params.fileId });

      if (!file) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'File not found',
        });
      }

      return reply.send(file);
    } catch (error) {
      logger.error('Get file failed', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  async downloadFile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const params = request.params as { fileId: string };
      const query = request.query as { download?: string };

      const file = await FileModel.findOne({ fileId: params.fileId });

      if (!file) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'File not found',
        });
      }

      const userId = (request.user as any)?.userId;
      if (!file.isPublic && file.userId !== userId) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'Access denied',
        });
      }

      file.stats.downloads += 1;
      file.stats.lastAccessedAt = new Date();
      await file.save();

      let url: string;
      if (file.accessLevel === 'public') {
        url = file.cdnUrl;
      } else {
        const disposition = query.download === 'true' 
          ? `attachment; filename="${file.fileName}"`
          : undefined;
        url = await s3Service.generateDownloadPresignedUrl(
          file.s3Bucket,
          file.s3Key,
          3600,
          disposition
        );
      }

      return reply.send({ url });
    } catch (error) {
      logger.error('Download file failed', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  async deleteFile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const params = request.params as { fileId: string };

      const file = await FileModel.findOne({ fileId: params.fileId });

      if (!file) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'File not found',
        });
      }

      const userId = (request.user as any)?.userId;
      if (file.userId !== userId) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'Access denied',
        });
      }

      await s3Service.deleteObject(file.s3Bucket, file.s3Key);
      
      if (file.thumbnailUrl) {
        const thumbnailKey = file.thumbnailUrl.split('.net/')[1] || file.thumbnailUrl;
        try {
          await s3Service.deleteObject(file.s3Bucket, thumbnailKey);
        } catch (err) {
          logger.warn('Failed to delete thumbnail', err);
        }
      }

      await FileModel.deleteOne({ fileId: params.fileId });

      return reply.send({ success: true });
    } catch (error) {
      logger.error('Delete file failed', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  async updateFile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const params = request.params as { fileId: string };
      const body = request.body as {
        fileName?: string;
        isPublic?: boolean;
        expiresIn?: number;
      };

      const file = await FileModel.findOne({ fileId: params.fileId });

      if (!file) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'File not found',
        });
      }

      const userId = (request.user as any)?.userId;
      if (file.userId !== userId) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'Access denied',
        });
      }

      if (body.fileName) file.fileName = body.fileName;
      if (body.isPublic !== undefined) {
        file.isPublic = body.isPublic;
        file.accessLevel = body.isPublic ? 'public' : 'private';
      }
      if (body.expiresIn) {
        file.expiresAt = new Date(Date.now() + body.expiresIn * 1000);
      }

      await file.save();

      return reply.send(file);
    } catch (error) {
      logger.error('Update file failed', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  async getAccessUrl(request: FastifyRequest, reply: FastifyReply) {
    try {
      const params = request.params as { fileId: string };
      const body = request.body as { expiresIn?: number };

      const file = await FileModel.findOne({ fileId: params.fileId });

      if (!file) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'File not found',
        });
      }

      const userId = (request.user as any)?.userId;
      if (!file.isPublic && file.userId !== userId) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'Access denied',
        });
      }

      const expiresIn = body.expiresIn || 3600;
      const signedUrl = cloudfrontService.generateSignedUrl(file.s3Key, expiresIn);
      const expiresAt = new Date(Date.now() + expiresIn * 1000);

      return reply.send({
        signedUrl,
        expiresAt,
      });
    } catch (error) {
      logger.error('Get access URL failed', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },
};
