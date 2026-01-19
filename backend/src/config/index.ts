import { config } from 'dotenv';
config();

export const env = {
  port: parseInt(process.env['PORT'] || '3001', 10),
  nodeEnv: process.env['NODE_ENV'] || 'development',
  databaseUrl: process.env['DATABASE_URL'] || '',
  redisUrl: process.env['REDIS_URL'] || 'redis://localhost:6379',
  shortUrlBase: process.env['SHORT_URL_BASE'] || 'http://localhost:3001',
  apiBaseUrl: process.env['API_BASE_URL'] || 'http://localhost:3001/v1',
  
  isDevelopment: process.env['NODE_ENV'] === 'development',
  isProduction: process.env['NODE_ENV'] === 'production',
};

export const RESERVED_CODES = [
  'api',
  'v1',
  'admin',
  'dashboard',
  'login',
  'signup',
  'logout',
  'docs',
  'health',
  'status',
  'analytics',
  'settings',
  'profile',
  'account',
];

export const SHORT_CODE_LENGTH = 6;
export const MAX_COLLISION_RETRIES = 3;
export const CACHE_TTL = 3600; // 1 hour in seconds
export const ANALYTICS_CACHE_TTL = 300; // 5 minutes
export const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
export const RATE_LIMIT_MAX = 100; // requests per window
