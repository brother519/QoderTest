import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;

export async function getRedisClient(): Promise<RedisClientType> {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  });

  redisClient.on('error', (err) => {
    console.error('Redis Client Error', err);
  });

  redisClient.on('connect', () => {
    console.log('Connected to Redis');
  });

  await redisClient.connect();
  return redisClient;
}

export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

// Cache key patterns
export const CacheKeys = {
  link: (shortCode: string) => `link:${shortCode}`,
  clickCount: (linkId: number) => `clicks:count:${linkId}`,
  rateLimit: (userId: number, action: string) => `ratelimit:${userId}:${action}`,
  hotLinks: (period: string) => `hot:links:${period}`,
  stats: (linkId: number, date: string) => `stats:${linkId}:${date}`,
  session: (token: string) => `session:${token}`,
};

// Cache TTL in seconds
export const CacheTTL = {
  link: 86400,        // 24 hours
  hotLinks: 300,      // 5 minutes
  stats: 3600,        // 1 hour
  rateLimit: 3600,    // 1 hour
};
