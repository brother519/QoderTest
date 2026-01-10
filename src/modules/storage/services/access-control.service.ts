import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { S3Service } from './s3.service';
import { Operation } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class AccessControlService {
  private readonly logger = new Logger(AccessControlService.name);

  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
  ) {}

  /**
   * 生成签名URL
   */
  async generateSignedUrl(
    fileId: string,
    userId: string,
    operation: Operation,
    expiresIn: number = 3600,
    maxUses?: number,
  ) {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file || file.deletedAt) {
      throw new NotFoundException('File not found');
    }

    if (file.ownerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // 生成安全随机令牌
    const token = crypto.randomBytes(32).toString('base64url');

    // 创建签名URL记录
    const signedUrl = await this.prisma.signedUrl.create({
      data: {
        fileId,
        token,
        operation,
        maxUses,
        expiresAt: new Date(Date.now() + expiresIn * 1000),
        createdBy: userId,
      },
    });

    const url = `${process.env.API_BASE_URL || 'http://localhost:3000'}/api/v1/signed/${token}`;

    this.logger.log(`Signed URL generated: ${signedUrl.id} for file ${fileId}`);

    return {
      signedUrl: url,
      token,
      expiresAt: signedUrl.expiresAt,
      maxUses,
    };
  }

  /**
   * 验证签名令牌
   */
  async validateSignedToken(token: string) {
    const signedUrl = await this.prisma.signedUrl.findUnique({
      where: { token },
      include: { file: true },
    });

    if (!signedUrl) {
      throw new NotFoundException('Invalid or expired signed URL');
    }

    // 检查过期时间
    if (signedUrl.expiresAt < new Date()) {
      throw new ForbiddenException('Signed URL has expired');
    }

    // 检查使用次数
    if (signedUrl.maxUses !== null && signedUrl.useCount >= signedUrl.maxUses) {
      throw new ForbiddenException('Signed URL has exceeded max uses');
    }

    // 检查文件状态
    if (signedUrl.file.deletedAt) {
      throw new NotFoundException('File has been deleted');
    }

    return signedUrl;
  }

  /**
   * 递增使用次数
   */
  async incrementUseCount(signedUrlId: string) {
    await this.prisma.signedUrl.update({
      where: { id: signedUrlId },
      data: {
        useCount: { increment: 1 },
      },
    });
  }

  /**
   * 获取签名URL的下载链接
   */
  async getSignedDownloadUrl(token: string) {
    const signedUrl = await this.validateSignedToken(token);

    if (signedUrl.operation !== Operation.download) {
      throw new ForbiddenException('This signed URL is not for download');
    }

    // 递增使用次数
    await this.incrementUseCount(signedUrl.id);

    // 生成S3预签名URL
    const downloadUrl = await this.s3Service.generatePresignedDownloadUrl(
      signedUrl.file.storageKey,
      3600,
    );

    // 更新带宽统计
    await this.updateBandwidthUsage(signedUrl.createdBy, signedUrl.file.fileSize);

    return {
      url: downloadUrl,
      filename: signedUrl.file.filename,
      mimeType: signedUrl.file.mimeType,
      fileSize: signedUrl.file.fileSize.toString(),
    };
  }

  /**
   * 更新带宽用量
   */
  private async updateBandwidthUsage(userId: string, bytes: bigint) {
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
        bandwidthDownload: { increment: bytes },
        apiRequests: { increment: 1 },
      },
      create: {
        userId,
        date: today,
        bandwidthDownload: bytes,
        apiRequests: 1,
      },
    });
  }
}
