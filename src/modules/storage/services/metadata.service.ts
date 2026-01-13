import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { S3Service } from './s3.service';
import { AccessLevel, FileStatus } from '@prisma/client';

@Injectable()
export class MetadataService {
  private readonly logger = new Logger(MetadataService.name);

  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
  ) {}

  /**
   * 根据ID查询文件
   */
  async getFileById(fileId: string, userId?: string) {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file || file.deletedAt) {
      throw new NotFoundException('File not found');
    }

    // 检查访问权限
    if (file.accessLevel === AccessLevel.private && file.ownerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return {
      id: file.id,
      filename: file.filename,
      fileSize: file.fileSize.toString(),
      mimeType: file.mimeType,
      accessLevel: file.accessLevel,
      status: file.status,
      thumbnails: file.thumbnails,
      createdAt: file.createdAt,
      url: file.status === FileStatus.completed ? this.s3Service.getPublicUrl(file.storageKey) : null,
    };
  }

  /**
   * 获取用户文件列表
   */
  async listUserFiles(
    userId: string,
    page: number = 1,
    limit: number = 20,
    sortBy: string = 'createdAt',
    order: 'asc' | 'desc' = 'desc',
  ) {
    const skip = (page - 1) * limit;

    const [files, total] = await Promise.all([
      this.prisma.file.findMany({
        where: {
          ownerId: userId,
          deletedAt: null,
          status: FileStatus.completed,
        },
        orderBy: { [sortBy]: order },
        skip,
        take: limit,
      }),
      this.prisma.file.count({
        where: {
          ownerId: userId,
          deletedAt: null,
          status: FileStatus.completed,
        },
      }),
    ]);

    return {
      files: files.map((file) => ({
        id: file.id,
        filename: file.filename,
        fileSize: file.fileSize.toString(),
        mimeType: file.mimeType,
        accessLevel: file.accessLevel,
        thumbnails: file.thumbnails,
        createdAt: file.createdAt,
        url: this.s3Service.getPublicUrl(file.storageKey),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 删除文件
   */
  async deleteFile(fileId: string, userId: string) {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file || file.deletedAt) {
      throw new NotFoundException('File not found');
    }

    if (file.ownerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // 删除S3对象
    await this.s3Service.deleteObject(file.storageKey);

    // 删除缩略图
    if (file.thumbnails) {
      const thumbnails = file.thumbnails as any;
      for (const size in thumbnails) {
        try {
          await this.s3Service.deleteObject(thumbnails[size]);
        } catch (error) {
          this.logger.warn(`Failed to delete thumbnail: ${thumbnails[size]}`);
        }
      }
    }

    // 软删除文件记录
    await this.prisma.file.update({
      where: { id: fileId },
      data: {
        status: FileStatus.deleted,
        deletedAt: new Date(),
      },
    });

    // 更新用量统计
    await this.updateStorageUsage(userId, -file.fileSize);

    this.logger.log(`File deleted: ${fileId}`);

    return { success: true };
  }

  /**
   * 修改访问级别
   */
  async updateAccessLevel(fileId: string, userId: string, accessLevel: AccessLevel) {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file || file.deletedAt) {
      throw new NotFoundException('File not found');
    }

    if (file.ownerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    await this.prisma.file.update({
      where: { id: fileId },
      data: { accessLevel },
    });

    this.logger.log(`File access level updated: ${fileId} -> ${accessLevel}`);

    return {
      fileId,
      accessLevel,
    };
  }

  /**
   * 生成下载URL
   */
  async getDownloadUrl(fileId: string, userId?: string) {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file || file.deletedAt || file.status !== FileStatus.completed) {
      throw new NotFoundException('File not found');
    }

    // 检查访问权限
    if (file.accessLevel === AccessLevel.private && file.ownerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (file.accessLevel === AccessLevel.signed) {
      throw new ForbiddenException('This file requires a signed URL');
    }

    // 记录下载带宽
    if (userId) {
      await this.updateBandwidthUsage(userId, file.fileSize);
    }

    // 对于私密文件生成预签名URL
    if (file.accessLevel === AccessLevel.private) {
      const url = await this.s3Service.generatePresignedDownloadUrl(file.storageKey, 3600);
      return { url, expiresIn: 3600 };
    }

    // 公开文件返回CDN URL
    return {
      url: this.s3Service.getPublicUrl(file.storageKey),
      expiresIn: null,
    };
  }

  /**
   * 更新存储用量
   */
  private async updateStorageUsage(userId: string, delta: bigint) {
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
        storageUsed: { increment: delta },
        fileCount: { decrement: delta < 0 ? 1 : 0 },
      },
      create: {
        userId,
        date: today,
        storageUsed: delta > 0 ? delta : BigInt(0),
        fileCount: delta > 0 ? 1 : 0,
      },
    });
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
      },
      create: {
        userId,
        date: today,
        bandwidthDownload: bytes,
      },
    });
  }
}
