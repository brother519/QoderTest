import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly cloudfrontDomain: string;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get('aws.region'),
      credentials: {
        accessKeyId: this.configService.get('aws.accessKeyId'),
        secretAccessKey: this.configService.get('aws.secretAccessKey'),
      },
      endpoint: this.configService.get('aws.s3Endpoint'),
    });

    this.bucket = this.configService.get('aws.s3Bucket');
    this.cloudfrontDomain = this.configService.get('aws.cloudfrontDomain');
  }

  /**
   * 初始化分片上传
   */
  async createMultipartUpload(key: string, mimeType: string): Promise<string> {
    try {
      const command = new CreateMultipartUploadCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: mimeType,
      });

      const response = await this.s3Client.send(command);
      this.logger.log(`Multipart upload initiated for ${key}, UploadId: ${response.UploadId}`);
      return response.UploadId;
    } catch (error) {
      this.logger.error(`Failed to create multipart upload for ${key}`, error);
      throw error;
    }
  }

  /**
   * 上传单个分片
   */
  async uploadPart(
    key: string,
    uploadId: string,
    partNumber: number,
    body: Buffer | Readable,
  ): Promise<string> {
    try {
      const command = new UploadPartCommand({
        Bucket: this.bucket,
        Key: key,
        UploadId: uploadId,
        PartNumber: partNumber,
        Body: body,
      });

      const response = await this.s3Client.send(command);
      this.logger.log(`Part ${partNumber} uploaded for ${key}`);
      return response.ETag;
    } catch (error) {
      this.logger.error(`Failed to upload part ${partNumber} for ${key}`, error);
      throw error;
    }
  }

  /**
   * 完成分片上传
   */
  async completeMultipartUpload(
    key: string,
    uploadId: string,
    parts: Array<{ PartNumber: number; ETag: string }>,
  ): Promise<string> {
    try {
      const command = new CompleteMultipartUploadCommand({
        Bucket: this.bucket,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: parts,
        },
      });

      const response = await this.s3Client.send(command);
      this.logger.log(`Multipart upload completed for ${key}`);
      return response.Location;
    } catch (error) {
      this.logger.error(`Failed to complete multipart upload for ${key}`, error);
      throw error;
    }
  }

  /**
   * 取消分片上传
   */
  async abortMultipartUpload(key: string, uploadId: string): Promise<void> {
    try {
      const command = new AbortMultipartUploadCommand({
        Bucket: this.bucket,
        Key: key,
        UploadId: uploadId,
      });

      await this.s3Client.send(command);
      this.logger.log(`Multipart upload aborted for ${key}`);
    } catch (error) {
      this.logger.error(`Failed to abort multipart upload for ${key}`, error);
      throw error;
    }
  }

  /**
   * 上传单个文件（小文件）
   */
  async uploadFile(key: string, body: Buffer, mimeType: string): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: mimeType,
      });

      await this.s3Client.send(command);
      this.logger.log(`File uploaded: ${key}`);
      return this.getPublicUrl(key);
    } catch (error) {
      this.logger.error(`Failed to upload file ${key}`, error);
      throw error;
    }
  }

  /**
   * 生成预签名URL（上传）
   */
  async generatePresignedUploadUrl(
    key: string,
    mimeType: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: mimeType,
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn });
      this.logger.log(`Presigned upload URL generated for ${key}`);
      return url;
    } catch (error) {
      this.logger.error(`Failed to generate presigned upload URL for ${key}`, error);
      throw error;
    }
  }

  /**
   * 生成预签名URL（下载）
   */
  async generatePresignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn });
      this.logger.log(`Presigned download URL generated for ${key}`);
      return url;
    } catch (error) {
      this.logger.error(`Failed to generate presigned download URL for ${key}`, error);
      throw error;
    }
  }

  /**
   * 获取文件流
   */
  async getObjectStream(key: string): Promise<Readable> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      return response.Body as Readable;
    } catch (error) {
      this.logger.error(`Failed to get object stream for ${key}`, error);
      throw error;
    }
  }

  /**
   * 删除文件
   */
  async deleteObject(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`File deleted: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file ${key}`, error);
      throw error;
    }
  }

  /**
   * 检查文件是否存在
   */
  async objectExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  /**
   * 获取公开访问URL（如果配置了CloudFront）
   */
  getPublicUrl(key: string): string {
    if (this.cloudfrontDomain) {
      return `https://${this.cloudfrontDomain}/${key}`;
    }
    return `https://${this.bucket}.s3.${this.configService.get('aws.region')}.amazonaws.com/${key}`;
  }
}
