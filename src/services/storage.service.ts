import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';
import { config } from '../config';
import logger from '../utils/logger';

/**
 * Storage service for S3/MinIO object storage
 */
export class StorageService {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly cdnBaseUrl: string;

  constructor() {
    this.client = new S3Client({
      endpoint: config.s3.endpoint,
      region: config.s3.region,
      credentials: {
        accessKeyId: config.s3.accessKey,
        secretAccessKey: config.s3.secretKey,
      },
      forcePathStyle: true, // Required for MinIO
    });

    this.bucket = config.s3.bucket;
    this.cdnBaseUrl = config.cdnBaseUrl;
  }

  /**
   * Upload file to storage
   */
  async upload(
    key: string,
    body: Buffer,
    contentType: string,
    metadata?: Record<string, string>
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        Metadata: metadata,
        CacheControl: 'public, max-age=31536000', // 1 year cache
      });

      await this.client.send(command);

      logger.debug('File uploaded to storage', { key, contentType, size: body.length });

      return this.getPublicUrl(key);
    } catch (error) {
      logger.error('Failed to upload file', { key, error });
      throw error;
    }
  }

  /**
   * Download file from storage
   */
  async download(key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.client.send(command);

      if (!response.Body) {
        throw new Error('Empty response body');
      }

      // Convert stream to buffer
      const stream = response.Body as Readable;
      const chunks: Buffer[] = [];

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    } catch (error) {
      logger.error('Failed to download file', { key, error });
      throw error;
    }
  }

  /**
   * Delete file from storage
   */
  async delete(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.client.send(command);

      logger.debug('File deleted from storage', { key });
    } catch (error) {
      logger.error('Failed to delete file', { key, error });
      throw error;
    }
  }

  /**
   * Check if file exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.client.send(command);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get file metadata
   */
  async getMetadata(key: string): Promise<{
    contentType?: string;
    contentLength?: number;
    lastModified?: Date;
    metadata?: Record<string, string>;
  }> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.client.send(command);

      return {
        contentType: response.ContentType,
        contentLength: response.ContentLength,
        lastModified: response.LastModified,
        metadata: response.Metadata,
      };
    } catch (error) {
      logger.error('Failed to get file metadata', { key, error });
      throw error;
    }
  }

  /**
   * List files with prefix
   */
  async list(prefix: string, maxKeys = 1000): Promise<string[]> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix,
        MaxKeys: maxKeys,
      });

      const response = await this.client.send(command);

      return (response.Contents || []).map((item) => item.Key || '');
    } catch (error) {
      logger.error('Failed to list files', { prefix, error });
      throw error;
    }
  }

  /**
   * Generate presigned URL for upload
   */
  async getUploadUrl(
    key: string,
    contentType: string,
    expiresIn = 3600
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    return getSignedUrl(this.client, command, { expiresIn });
  }

  /**
   * Generate presigned URL for download
   */
  async getDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, { expiresIn });
  }

  /**
   * Get public URL (via CDN if configured)
   */
  getPublicUrl(key: string): string {
    if (this.cdnBaseUrl) {
      return `${this.cdnBaseUrl}/${key}`;
    }
    return `${config.s3.endpoint}/${this.bucket}/${key}`;
  }

  /**
   * Generate storage key for original image
   */
  static getOriginalKey(userId: string, imageId: string, extension: string): string {
    return `originals/${userId}/${imageId}${extension}`;
  }

  /**
   * Generate storage key for processed image
   */
  static getProcessedKey(
    userId: string,
    imageId: string,
    variant: string,
    format: string
  ): string {
    return `processed/${userId}/${imageId}/${variant}.${format}`;
  }

  /**
   * Generate storage key for transformed image (with params hash)
   */
  static getTransformKey(
    userId: string,
    imageId: string,
    paramsHash: string,
    format: string
  ): string {
    return `transformed/${userId}/${imageId}/${paramsHash}.${format}`;
  }
}

// Export singleton instance
export const storage = new StorageService();
