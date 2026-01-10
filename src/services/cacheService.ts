import redis from '../config/redis';
import config from '../config/env';
import { Url } from '../models';

const CACHE_KEY_PREFIX = {
  SHORT_URL: 'url:short:',
  CLICKS: 'url:clicks:',
  RANKING: 'ranking:top:',
  NOT_FOUND: 'url:notfound:',
};

/**
 * 获取短链接缓存
 */
export async function getShortUrl(shortCode: string): Promise<Url | null | 'NOT_FOUND'> {
  try {
    const key = CACHE_KEY_PREFIX.SHORT_URL + shortCode;
    const cached = await redis.get(key);
    
    if (!cached) {
      // 检查是否是标记为不存在的短代码
      const notFoundKey = CACHE_KEY_PREFIX.NOT_FOUND + shortCode;
      const notFound = await redis.get(notFoundKey);
      
      if (notFound) {
        return 'NOT_FOUND';
      }
      
      return null;
    }
    
    return JSON.parse(cached);
  } catch (error) {
    console.error('Redis获取短链接失败:', error);
    return null;
  }
}

/**
 * 设置短链接缓存
 */
export async function setShortUrl(shortCode: string, url: Url): Promise<void> {
  try {
    const key = CACHE_KEY_PREFIX.SHORT_URL + shortCode;
    const ttl = config.cache.ttlShortUrl;
    
    // 添加随机偏移，防止缓存雪崩
    const randomOffset = Math.floor(Math.random() * ttl * 0.2);
    const finalTtl = ttl + randomOffset;
    
    await redis.setex(key, finalTtl, JSON.stringify(url));
  } catch (error) {
    console.error('Redis设置短链接失败:', error);
  }
}

/**
 * 标记短代码不存在（缓存穿透防护）
 */
export async function markShortCodeNotFound(shortCode: string): Promise<void> {
  try {
    const key = CACHE_KEY_PREFIX.NOT_FOUND + shortCode;
    await redis.setex(key, 300, '1'); // 5分钟
  } catch (error) {
    console.error('Redis标记短代码不存在失败:', error);
  }
}

/**
 * 删除短链接缓存
 */
export async function deleteShortUrl(shortCode: string): Promise<void> {
  try {
    const key = CACHE_KEY_PREFIX.SHORT_URL + shortCode;
    await redis.del(key);
  } catch (error) {
    console.error('Redis删除短链接失败:', error);
  }
}

/**
 * 增加点击计数
 */
export async function incrementClickCount(urlId: number): Promise<void> {
  try {
    const key = CACHE_KEY_PREFIX.CLICKS + urlId;
    const now = new Date();
    const hour = now.getHours();
    
    await redis
      .multi()
      .hincrby(key, 'total', 1)
      .hincrby(key, 'today', 1)
      .hincrby(key, `hour_${hour}`, 1)
      .expire(key, 86400) // 24小时
      .exec();
  } catch (error) {
    console.error('Redis增加点击计数失败:', error);
  }
}

/**
 * 获取点击统计
 */
export async function getClickStats(urlId: number): Promise<Record<string, string> | null> {
  try {
    const key = CACHE_KEY_PREFIX.CLICKS + urlId;
    const stats = await redis.hgetall(key);
    
    if (Object.keys(stats).length === 0) {
      return null;
    }
    
    return stats;
  } catch (error) {
    console.error('Redis获取点击统计失败:', error);
    return null;
  }
}

/**
 * 更新热门链接排行榜
 */
export async function updateRanking(shortCode: string, score: number, period: string = '7d'): Promise<void> {
  try {
    const key = CACHE_KEY_PREFIX.RANKING + period;
    await redis.zincrby(key, score, shortCode);
    await redis.expire(key, config.cache.ttlRanking);
  } catch (error) {
    console.error('Redis更新排行榜失败:', error);
  }
}

/**
 * 获取热门链接排行榜
 */
export async function getTopUrls(limit: number = 10, period: string = '7d'): Promise<Array<{ shortCode: string; score: number }>> {
  try {
    const key = CACHE_KEY_PREFIX.RANKING + period;
    const results = await redis.zrevrange(key, 0, limit - 1, 'WITHSCORES');
    
    const urls: Array<{ shortCode: string; score: number }> = [];
    for (let i = 0; i < results.length; i += 2) {
      urls.push({
        shortCode: results[i],
        score: parseInt(results[i + 1], 10),
      });
    }
    
    return urls;
  } catch (error) {
    console.error('Redis获取排行榜失败:', error);
    return [];
  }
}

/**
 * 清除过期数据（定时任务调用）
 */
export async function cleanupExpiredData(): Promise<void> {
  try {
    // 清理今日计数（新的一天开始时）
    const pattern = CACHE_KEY_PREFIX.CLICKS + '*';
    const keys = await redis.keys(pattern);
    
    for (const key of keys) {
      await redis.hdel(key, 'today');
    }
    
    console.log(`清理了 ${keys.length} 个点击统计的今日计数`);
  } catch (error) {
    console.error('Redis清理过期数据失败:', error);
  }
}
