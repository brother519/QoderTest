import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },

  // S3/MinIO
  s3: {
    endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
    region: process.env.S3_REGION || 'us-east-1',
    bucket: process.env.S3_BUCKET || 'images',
    accessKey: process.env.S3_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.S3_SECRET_KEY || 'minioadmin',
  },

  // CDN
  cdnBaseUrl: process.env.CDN_BASE_URL || '',

  // Processing limits
  processing: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '20971520', 10), // 20MB
    maxWidth: parseInt(process.env.MAX_WIDTH || '8192', 10),
    maxHeight: parseInt(process.env.MAX_HEIGHT || '8192', 10),
    defaultQuality: parseInt(process.env.DEFAULT_QUALITY || '80', 10),
  },

  // Worker
  worker: {
    concurrency: parseInt(process.env.WORKER_CONCURRENCY || '4', 10),
  },
};
