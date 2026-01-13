import Redis from 'ioredis';
import { env, CACHE_TTL } from './index.js';

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(env.redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redis.on('connect', () => {
      console.log('Redis connected successfully');
    });

    redis.on('error', (err) => {
      console.error('Redis connection error:', err.message);
    });
  }

  return redis;
}

export async function disconnectRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
    console.log('Redis disconnected');
  }
}

// Cache helpers
export async function getCached<T>(key: string): Promise<T | null> {
  const client = getRedis();
  const data = await client.get(key);
  
  if (!data) return null;
  
  try {
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
}

export async function setCache<T>(key: string, value: T, ttl: number = CACHE_TTL): Promise<void> {
  const client = getRedis();
  await client.setex(key, ttl, JSON.stringify(value));
}

export async function deleteCache(key: string): Promise<void> {
  const client = getRedis();
  await client.del(key);
}

export async function incrementCounter(key: string, ttl: number): Promise<number> {
  const client = getRedis();
  const count = await client.incr(key);
  
  if (count === 1) {
    await client.expire(key, ttl);
  }
  
  return count;
}

export async function getCounter(key: string): Promise<number> {
  const client = getRedis();
  const count = await client.get(key);
  return count ? parseInt(count, 10) : 0;
}
