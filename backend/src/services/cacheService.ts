import { getRedisClient, CacheKeys, CacheTTL } from '../config/redis';
import logger from '../utils/logger';

interface CachedLink {
  original_url: string;
  expires_at: string | null;
  is_active: boolean;
}

/**
 * Get cached link data
 */
export async function getCachedLink(shortCode: string): Promise<CachedLink | null> {
  try {
    const client = await getRedisClient();
    const data = await client.get(CacheKeys.link(shortCode));
    
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    logger.error('Redis get error:', error);
    return null;
  }
}

/**
 * Cache link data
 */
export async function cacheLink(shortCode: string, link: CachedLink): Promise<void> {
  try {
    const client = await getRedisClient();
    await client.setEx(
      CacheKeys.link(shortCode),
      CacheTTL.link,
      JSON.stringify(link)
    );
  } catch (error) {
    logger.error('Redis set error:', error);
  }
}

/**
 * Invalidate cached link
 */
export async function invalidateLinkCache(shortCode: string): Promise<void> {
  try {
    const client = await getRedisClient();
    await client.del(CacheKeys.link(shortCode));
  } catch (error) {
    logger.error('Redis delete error:', error);
  }
}

/**
 * Increment click count in Redis
 */
export async function incrementClickCount(linkId: number): Promise<number> {
  try {
    const client = await getRedisClient();
    return await client.incr(CacheKeys.clickCount(linkId));
  } catch (error) {
    logger.error('Redis incr error:', error);
    return 0;
  }
}

/**
 * Get click count from Redis
 */
export async function getClickCount(linkId: number): Promise<number> {
  try {
    const client = await getRedisClient();
    const count = await client.get(CacheKeys.clickCount(linkId));
    return count ? parseInt(count, 10) : 0;
  } catch (error) {
    logger.error('Redis get count error:', error);
    return 0;
  }
}

/**
 * Set rate limit
 */
export async function checkRateLimit(
  userId: number,
  action: string,
  limit: number
): Promise<boolean> {
  try {
    const client = await getRedisClient();
    const key = CacheKeys.rateLimit(userId, action);
    
    const current = await client.incr(key);
    
    if (current === 1) {
      await client.expire(key, CacheTTL.rateLimit);
    }
    
    return current <= limit;
  } catch (error) {
    logger.error('Redis rate limit error:', error);
    return true; // Allow on error
  }
}

/**
 * Add to hot links sorted set
 */
export async function addToHotLinks(
  period: string,
  linkId: number,
  clicks: number
): Promise<void> {
  try {
    const client = await getRedisClient();
    await client.zAdd(CacheKeys.hotLinks(period), {
      score: clicks,
      value: linkId.toString(),
    });
    await client.expire(CacheKeys.hotLinks(period), CacheTTL.hotLinks);
  } catch (error) {
    logger.error('Redis zadd error:', error);
  }
}

/**
 * Get hot links from sorted set
 */
export async function getHotLinks(
  period: string,
  limit: number = 10
): Promise<string[]> {
  try {
    const client = await getRedisClient();
    return await client.zRange(CacheKeys.hotLinks(period), 0, limit - 1, {
      REV: true,
    });
  } catch (error) {
    logger.error('Redis zrange error:', error);
    return [];
  }
}
