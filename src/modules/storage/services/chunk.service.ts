import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { S3Service } from './s3.service';
import { FileStatus, SessionStatus, AccessLevel } from '@prisma/client';
import { InitiateUploadDto } from '../dto/initiate-upload.dto';
import { CompleteUploadDto } from '../dto/complete-upload.dto';
import * as crypto from 'crypto';

@Injectable()
export class ChunkService {
  private readonly logger = new Logger(ChunkService.name);

  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
  ) {}

  /**
   * 初始化分片上传
   */
  async initiateUpload(userId: string, dto: InitiateUploadDto) {
    const { filename, fileSize, mimeType, chunkSize = 5242880, accessLevel = AccessLevel.private, expiresIn } = dto;

    // 生成存储键
    const storageKey = this.generateStorageKey(userId, filename);
    
    // 计算总分片数
    const totalChunks = Math.ceil(fileSize / chunkSize);

    // 初始化S3分片上传
    const uploadId = await this.s3Service.createMultipartUpload(storageKey, mimeType);

    // 创建文件记录
    const file = await this.prisma.file.create({
      data: {
        filename,
        storageKey,
        fileSize: BigInt(fileSize),
        mimeType,
        hash: '', // 将在合并时计算
        ownerId: userId,
        accessLevel,
        status: FileStatus.uploading,
        expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : null,
      },
    });

    // 创建上传会话
    const session = await this.prisma.uploadSession.create({
      data: {
        fileId: file.id,
        uploadId,
        totalChunks,
        chunkSize: BigInt(chunkSize),
        uploadedChunks: [],
        status: SessionStatus.active,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24小时后过期
      },
    });

    this.logger.log(`Upload session initiated: ${session.id} for file ${file.id}`);

    return {
      uploadSessionId: session.id,
      fileId: file.id,
      uploadId,
      totalChunks,
      chunkSize,
      storageKey,
    };
  }

  /**
   * 处理分片上传
   */
  async handleChunkUpload(
    sessionId: string,
    partNumber: number,
    buffer: Buffer,
  ): Promise<{ partNumber: number; etag: string; uploaded: boolean }> {
    // 查询上传会话
    const session = await this.prisma.uploadSession.findUnique({
      where: { id: sessionId },
      include: { file: true },
    });

    if (!session) {
      throw new NotFoundException('Upload session not found');
    }

    if (session.status !== SessionStatus.active) {
      throw new BadRequestException(`Upload session status is ${session.status}`);
    }

    if (partNumber < 1 || partNumber > session.totalChunks) {
      throw new BadRequestException(`Invalid part number: ${partNumber}`);
    }

    // 上传分片到S3
    const etag = await this.s3Service.uploadPart(
      session.file.storageKey,
      session.uploadId,
      partNumber,
      buffer,
    );

    // 更新已上传分片列表
    const uploadedChunks = session.uploadedChunks as any[];
    const existingIndex = uploadedChunks.findIndex((c: any) => c.part_number === partNumber);
    
    const chunkInfo = {
      part_number: partNumber,
      etag,
      uploaded_at: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      uploadedChunks[existingIndex] = chunkInfo;
    } else {
      uploadedChunks.push(chunkInfo);
    }

    await this.prisma.uploadSession.update({
      where: { id: sessionId },
      data: { uploadedChunks },
    });

    this.logger.log(`Chunk ${partNumber} uploaded for session ${sessionId}`);

    return {
      partNumber,
      etag,
      uploaded: true,
    };
  }

  /**
   * 完成上传
   */
  async completeUpload(sessionId: string, dto: CompleteUploadDto) {
    // 查询上传会话
    const session = await this.prisma.uploadSession.findUnique({
      where: { id: sessionId },
      include: { file: true },
    });

    if (!session) {
      throw new NotFoundException('Upload session not found');
    }

    if (session.status !== SessionStatus.active) {
      throw new BadRequestException(`Upload session status is ${session.status}`);
    }

    // 验证分片完整性
    if (dto.parts.length !== session.totalChunks) {
      throw new BadRequestException(
        `Expected ${session.totalChunks} parts, received ${dto.parts.length}`,
      );
    }

    // 完成S3分片上传
    await this.s3Service.completeMultipartUpload(
      session.file.storageKey,
      session.uploadId,
      dto.parts,
    );

    // 计算文件哈希（使用storageKey作为临时哈希）
    const hash = crypto.createHash('sha256').update(session.file.storageKey).digest('hex');

    // 更新文件状态
    await this.prisma.file.update({
      where: { id: session.fileId },
      data: {
        status: FileStatus.completed,
        hash,
      },
    });

    // 更新会话状态
    await this.prisma.uploadSession.update({
      where: { id: sessionId },
      data: { status: SessionStatus.completed },
    });

    // 更新用量统计
    await this.updateUsageStats(session.file.ownerId, session.file.fileSize);

    this.logger.log(`Upload completed for session ${sessionId}`);

    const url = this.s3Service.getPublicUrl(session.file.storageKey);

    return {
      fileId: session.fileId,
      storageKey: session.file.storageKey,
      url,
      status: FileStatus.completed,
    };
  }

  /**
   * 查询上传进度
   */
  async getUploadProgress(sessionId: string) {
    const session = await this.prisma.uploadSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Upload session not found');
    }

    const uploadedChunks = session.uploadedChunks as any[];
    const progress = (uploadedChunks.length / session.totalChunks) * 100;

    return {
      sessionId: session.id,
      uploadedChunks: uploadedChunks.length,
      totalChunks: session.totalChunks,
      progress: Math.round(progress * 100) / 100,
      status: session.status,
      expiresAt: session.expiresAt,
    };
  }

  /**
   * 取消上传
   */
  async cancelUpload(sessionId: string, userId: string) {
    const session = await this.prisma.uploadSession.findUnique({
      where: { id: sessionId },
      include: { file: true },
    });

    if (!session) {
      throw new NotFoundException('Upload session not found');
    }

    if (session.file.ownerId !== userId) {
      throw new BadRequestException('Unauthorized to cancel this upload');
    }

    // 取消S3分片上传
    await this.s3Service.abortMultipartUpload(session.file.storageKey, session.uploadId);

    // 更新会话状态
    await this.prisma.uploadSession.update({
      where: { id: sessionId },
      data: { status: SessionStatus.aborted },
    });

    // 软删除文件记录
    await this.prisma.file.update({
      where: { id: session.fileId },
      data: { 
        status: FileStatus.deleted,
        deletedAt: new Date(),
      },
    });

    this.logger.log(`Upload cancelled for session ${sessionId}`);

    return { success: true };
  }

  /**
   * 生成存储键
   */
  private generateStorageKey(userId: string, filename: string): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    const extension = filename.split('.').pop();
    return `uploads/${userId}/${timestamp}-${random}.${extension}`;
  }

  /**
   * 更新用量统计
   */
  private async updateUsageStats(userId: string, fileSize: bigint) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await this.prisma.usageStat.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      update: {
        storageUsed: { increment: fileSize },
        bandwidthUpload: { increment: fileSize },
        fileCount: { increment: 1 },
        apiRequests: { increment: 1 },
      },
      create: {
        userId,
        date: today,
        storageUsed: fileSize,
        bandwidthUpload: fileSize,
        fileCount: 1,
        apiRequests: 1,
      },
    });
  }
}
