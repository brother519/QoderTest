import { cleanEnv, str, num, url } from 'envalid';
import dotenv from 'dotenv';

// 根据 NODE_ENV 加载对应的 .env 文件
const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
dotenv.config({ path: envFile });

export const config = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'test', 'production'], default: 'development' }),
  PORT: num({ default: 3000 }),
  HOST: str({ default: '0.0.0.0' }),
  LOG_LEVEL: str({ default: 'info' }),
  
  MONGODB_URI: url(),
  MONGODB_DB_NAME: str(),
  
  AWS_REGION: str(),
  AWS_ACCESS_KEY_ID: str(),
  AWS_SECRET_ACCESS_KEY: str(),
  
  S3_BUCKET_PUBLIC: str(),
  S3_BUCKET_PRIVATE: str(),
  S3_BUCKET_TEMP: str(),
  
  CLOUDFRONT_DOMAIN: str(),
  CLOUDFRONT_KEY_PAIR_ID: str(),
  CLOUDFRONT_PRIVATE_KEY_PATH: str(),
  
  MAX_FILE_SIZE: num(),
  MAX_CHUNK_SIZE: num(),
  ALLOWED_MIME_TYPES: str(),
  
  JWT_SECRET: str(),
  JWT_EXPIRES_IN: str({ default: '7d' }),
  
  TEMP_FILE_EXPIRY: num({ default: 86400 }),
  
  THUMBNAIL_SIZES: str({ default: '150,300,600' }),
  THUMBNAIL_FORMAT: str({ default: 'webp' }),
  THUMBNAIL_QUALITY: num({ default: 80 }),
  
  RATE_LIMIT_MAX: num({ default: 100 }),
  RATE_LIMIT_WINDOW: num({ default: 60000 }),
  
  CORS_ORIGIN: str(),
});

// 导出便捷访问的配置对象
export const appConfig = {
  env: config.NODE_ENV,
  port: config.PORT,
  host: config.HOST,
  logLevel: config.LOG_LEVEL,
};

export const dbConfig = {
  uri: config.MONGODB_URI,
  dbName: config.MONGODB_DB_NAME,
};

export const awsConfig = {
  region: config.AWS_REGION,
  credentials: {
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  },
};

export const s3Config = {
  buckets: {
    public: config.S3_BUCKET_PUBLIC,
    private: config.S3_BUCKET_PRIVATE,
    temp: config.S3_BUCKET_TEMP,
  },
};

export const cloudfrontConfig = {
  domain: config.CLOUDFRONT_DOMAIN,
  keyPairId: config.CLOUDFRONT_KEY_PAIR_ID,
  privateKeyPath: config.CLOUDFRONT_PRIVATE_KEY_PATH,
};

export const uploadConfig = {
  maxFileSize: config.MAX_FILE_SIZE,
  maxChunkSize: config.MAX_CHUNK_SIZE,
  allowedMimeTypes: config.ALLOWED_MIME_TYPES.split(',').map(t => t.trim()),
};

export const jwtConfig = {
  secret: config.JWT_SECRET,
  expiresIn: config.JWT_EXPIRES_IN,
};

export const thumbnailConfig = {
  sizes: config.THUMBNAIL_SIZES.split(',').map(s => parseInt(s.trim())),
  format: config.THUMBNAIL_FORMAT,
  quality: config.THUMBNAIL_QUALITY,
};

export const rateLimitConfig = {
  max: config.RATE_LIMIT_MAX,
  timeWindow: config.RATE_LIMIT_WINDOW,
};

export const corsConfig = {
  origin: config.CORS_ORIGIN.split(',').map(o => o.trim()),
};
