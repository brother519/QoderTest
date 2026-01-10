import {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListPartsCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';
import { awsConfig } from '../config';
import { logger } from '../utils/logger.util';

class S3Service {
  private client: S3Client;

  constructor() {
    this.client = new S3Client({
      region: awsConfig.region,
      credentials: awsConfig.credentials,
      maxAttempts: 3,
    });
  }

  async createMultipartUpload(
    bucket: string,
    key: string,
    options?: {
      contentType?: string;
      metadata?: Record<string, string>;
      acl?: string;
    }
  ): Promise<{ uploadId: string; key: string }> {
    try {
      const command = new CreateMultipartUploadCommand({
        Bucket: bucket,
        Key: key,
        ContentType: options?.contentType,
        Metadata: options?.metadata,
        ACL: options?.acl,
      });

      const response = await this.client.send(command);

      if (!response.UploadId) {
        throw new Error('Failed to create multipart upload: no UploadId returned');
      }

      logger.info(`Multipart upload created: ${response.UploadId}`);
      return { uploadId: response.UploadId, key: response.Key || key };
    } catch (error) {
      logger.error('Failed to create multipart upload', error);
      throw error;
    }
  }

  async generateUploadPresignedUrl(
    bucket: string,
    key: string,
    partNumber: number,
    uploadId: string,
    expiresIn: number = 900
  ): Promise<string> {
    try {
      const command = new UploadPartCommand({
        Bucket: bucket,
        Key: key,
        PartNumber: partNumber,
        UploadId: uploadId,
      });

      const url = await getSignedUrl(this.client, command, { expiresIn });
      return url;
    } catch (error) {
      logger.error('Failed to generate upload presigned URL', error);
      throw error;
    }
  }

  async listParts(
    bucket: string,
    key: string,
    uploadId: string
  ): Promise<Array<{ partNumber: number; etag: string; size: number }>> {
    try {
      const command = new ListPartsCommand({
        Bucket: bucket,
        Key: key,
        UploadId: uploadId,
      });

      const response = await this.client.send(command);
      
      return (response.Parts || []).map(part => ({
        partNumber: part.PartNumber!,
        etag: part.ETag!,
        size: part.Size!,
      }));
    } catch (error) {
      logger.error('Failed to list parts', error);
      throw error;
    }
  }

  async completeMultipartUpload(
    bucket: string,
    key: string,
    uploadId: string,
    parts: Array<{ partNumber: number; etag: string }>
  ): Promise<{ etag: string; location: string }> {
    try {
      const command = new CompleteMultipartUploadCommand({
        Bucket: bucket,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: parts.map(part => ({
            PartNumber: part.partNumber,
            ETag: part.etag,
          })),
        },
      });

      const response = await this.client.send(command);

      if (!response.ETag) {
        throw new Error('Failed to complete multipart upload: no ETag returned');
      }

      logger.info(`Multipart upload completed: ${key}`);
      return {
        etag: response.ETag,
        location: response.Location || `https://${bucket}.s3.amazonaws.com/${key}`,
      };
    } catch (error) {
      logger.error('Failed to complete multipart upload', error);
      throw error;
    }
  }

  async abortMultipartUpload(
    bucket: string,
    key: string,
    uploadId: string
  ): Promise<void> {
    try {
      const command = new AbortMultipartUploadCommand({
        Bucket: bucket,
        Key: key,
        UploadId: uploadId,
      });

      await this.client.send(command);
      logger.info(`Multipart upload aborted: ${uploadId}`);
    } catch (error) {
      logger.error('Failed to abort multipart upload', error);
      throw error;
    }
  }

  async uploadFile(
    bucket: string,
    key: string,
    buffer: Buffer,
    options?: {
      contentType?: string;
      metadata?: Record<string, string>;
      acl?: string;
    }
  ): Promise<{ etag: string; key: string }> {
    try {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: options?.contentType,
        Metadata: options?.metadata,
        ACL: options?.acl,
      });

      const response = await this.client.send(command);

      logger.info(`File uploaded: ${key}`);
      return {
        etag: response.ETag || '',
        key,
      };
    } catch (error) {
      logger.error('Failed to upload file', error);
      throw error;
    }
  }

  async generateDownloadPresignedUrl(
    bucket: string,
    key: string,
    expiresIn: number = 3600,
    responseContentDisposition?: string
  ): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
        ResponseContentDisposition: responseContentDisposition,
      });

      const url = await getSignedUrl(this.client, command, { expiresIn });
      return url;
    } catch (error) {
      logger.error('Failed to generate download presigned URL', error);
      throw error;
    }
  }

  async deleteObject(bucket: string, key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      await this.client.send(command);
      logger.info(`File deleted: ${key}`);
    } catch (error) {
      logger.error('Failed to delete file', error);
      throw error;
    }
  }

  async getObjectMetadata(
    bucket: string,
    key: string
  ): Promise<{ size: number; etag: string; contentType: string }> {
    try {
      const command = new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const response = await this.client.send(command);

      return {
        size: response.ContentLength || 0,
        etag: response.ETag || '',
        contentType: response.ContentType || 'application/octet-stream',
      };
    } catch (error) {
      logger.error('Failed to get object metadata', error);
      throw error;
    }
  }

  async downloadFile(bucket: string, key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const response = await this.client.send(command);
      
      if (!response.Body) {
        throw new Error('No body in response');
      }

      const chunks: Uint8Array[] = [];
      for await (const chunk of response.Body as any) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    } catch (error) {
      logger.error('Failed to download file', error);
      throw error;
    }
  }
}

export const s3Service = new S3Service();
