import Redis from 'ioredis';
import { config } from '../config';
import logger from '../utils/logger';

/**
 * Cache service using Redis
 */
export class CacheService {
  private readonly client: Redis;
  private readonly defaultTTL: number;

  constructor() {
    this.client = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    this.defaultTTL = 86400; // 24 hours

    this.client.on('error', (error) => {
      logger.error('Redis connection error', { error });
    });

    this.client.on('connect', () => {
      logger.info('Connected to Redis');
    });
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      
      if (!value) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      logger.error('Cache get error', { key, error });
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      const expiration = ttl || this.defaultTTL;

      await this.client.setex(key, expiration, serialized);
    } catch (error) {
      logger.error('Cache set error', { key, error });
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error('Cache delete error', { key, error });
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  async deleteByPattern(pattern: string): Promise<number> {
    try {
      const keys = await this.client.keys(pattern);
      
      if (keys.length === 0) {
        return 0;
      }

      return await this.client.del(...keys);
    } catch (error) {
      logger.error('Cache delete by pattern error', { pattern, error });
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists error', { key, error });
      return false;
    }
  }

  /**
   * Get remaining TTL for key
   */
  async getTTL(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      logger.error('Cache getTTL error', { key, error });
      return -1;
    }
  }

  /**
   * Extend TTL for key
   */
  async extendTTL(key: string, ttl: number): Promise<void> {
    try {
      await this.client.expire(key, ttl);
    } catch (error) {
      logger.error('Cache extendTTL error', { key, error });
    }
  }

  /**
   * Store image URL in cache
   */
  async cacheImageUrl(
    imageId: string,
    paramsHash: string,
    url: string,
    ttl?: number
  ): Promise<void> {
    const key = `image:url:${imageId}:${paramsHash}`;
    await this.set(key, { url, cachedAt: Date.now() }, ttl);
  }

  /**
   * Get cached image URL
   */
  async getCachedImageUrl(
    imageId: string,
    paramsHash: string
  ): Promise<string | null> {
    const key = `image:url:${imageId}:${paramsHash}`;
    const cached = await this.get<{ url: string; cachedAt: number }>(key);
    
    return cached?.url || null;
  }

  /**
   * Store image metadata in cache
   */
  async cacheMetadata(
    imageId: string,
    metadata: Record<string, unknown>,
    ttl = 604800 // 7 days
  ): Promise<void> {
    const key = `image:meta:${imageId}`;
    await this.set(key, metadata, ttl);
  }

  /**
   * Get cached image metadata
   */
  async getCachedMetadata(imageId: string): Promise<Record<string, unknown> | null> {
    const key = `image:meta:${imageId}`;
    return this.get<Record<string, unknown>>(key);
  }

  /**
   * Store task result in cache
   */
  async cacheTaskResult(
    taskId: string,
    result: Record<string, unknown>,
    ttl = 3600 // 1 hour
  ): Promise<void> {
    const key = `task:result:${taskId}`;
    await this.set(key, result, ttl);
  }

  /**
   * Get cached task result
   */
  async getCachedTaskResult(taskId: string): Promise<Record<string, unknown> | null> {
    const key = `task:result:${taskId}`;
    return this.get<Record<string, unknown>>(key);
  }

  /**
   * Invalidate all cache entries for an image
   */
  async invalidateImage(imageId: string): Promise<number> {
    const pattern = `image:*:${imageId}:*`;
    return this.deleteByPattern(pattern);
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    connected: boolean;
    keyCount: number;
    memoryUsage: string;
  }> {
    try {
      const info = await this.client.info('memory');
      const keyCount = await this.client.dbsize();
      
      // Parse memory usage from info
      const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
      const memoryUsage = memoryMatch ? memoryMatch[1] : 'unknown';

      return {
        connected: true,
        keyCount,
        memoryUsage,
      };
    } catch (error) {
      return {
        connected: false,
        keyCount: 0,
        memoryUsage: 'unknown',
      };
    }
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    await this.client.quit();
  }

  /**
   * Get underlying Redis client (for advanced operations)
   */
  getClient(): Redis {
    return this.client;
  }
}

// Export singleton instance
export const cache = new CacheService();
