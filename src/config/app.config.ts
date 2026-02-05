import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: process.env.JWT_SECRET || 'change-this-secret',
  jwtExpiration: process.env.JWT_EXPIRATION || '7d',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10737418240', 10),
  chunkSize: parseInt(process.env.CHUNK_SIZE || '5242880', 10),
  allowedMimeTypes: (process.env.ALLOWED_MIME_TYPES || '').split(','),
}));
