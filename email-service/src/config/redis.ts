import Redis from 'ioredis';
import { config } from './index.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('redis');

export const redis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

redis.on('connect', () => {
  logger.info('Redis connected');
});

redis.on('error', (error) => {
  logger.error({ error }, 'Redis connection error');
});

redis.on('close', () => {
  logger.warn('Redis connection closed');
});

export async function checkRedisConnection(): Promise<boolean> {
  try {
    await redis.ping();
    return true;
  } catch {
    return false;
  }
}
