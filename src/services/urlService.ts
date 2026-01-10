import * as urlRepository from '../repositories/urlRepository';
import * as cacheService from './cacheService';
import { generateQRCode } from './qrcodeService';
import { CreateUrlInput, Url } from '../models';
import { isValidUrl, normalizeUrl, isBlacklistedUrl } from '../utils/urlValidator';
import { encodeId, isValidShortCode, generateRandomShortCode } from '../utils/shortCodeGenerator';
import config from '../config/env';

/**
 * 创建短链接
 */
export async function createShortUrl(input: CreateUrlInput): Promise<{
  url: Url;
  shortUrl: string;
  qrCode: string;
}> {
  // 验证URL
  const normalizedUrl = normalizeUrl(input.original_url);
  
  if (!isValidUrl(normalizedUrl)) {
    throw new Error('无效的URL格式');
  }
  
  if (isBlacklistedUrl(normalizedUrl)) {
    throw new Error('该URL在黑名单中，无法创建短链接');
  }
  
  // 检查是否已存在（可选去重）
  const existing = await urlRepository.findByOriginalUrl(normalizedUrl);
  if (existing && !input.custom_code) {
    // 如果已存在且未要求自定义，返回已有短链接
    const shortUrl = `${config.baseUrl}/${existing.short_code}`;
    const qrCode = await generateQRCode(shortUrl);
    
    return {
      url: existing,
      shortUrl,
      qrCode,
    };
  }
  
  // 生成或使用自定义短代码
  let shortCode: string;
  
  if (input.custom_code) {
    // 验证自定义短代码
    if (!isValidShortCode(input.custom_code)) {
      throw new Error('自定义短代码格式无效');
    }
    
    // 检查是否已被使用
    const existingCode = await urlRepository.findByShortCode(input.custom_code);
    if (existingCode) {
      throw new Error('该短代码已被使用');
    }
    
    shortCode = input.custom_code;
  } else {
    // 自动生成短代码（使用随机方式，避免依赖ID）
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      shortCode = generateRandomShortCode(config.shortCode.length);
      const existing = await urlRepository.findByShortCode(shortCode);
      
      if (!existing) {
        break;
      }
      
      attempts++;
    }
    
    if (attempts >= maxAttempts) {
      throw new Error('生成短代码失败，请稍后重试');
    }
  }
  
  // 创建短链接记录
  input.original_url = normalizedUrl;
  const url = await urlRepository.createUrl(input, shortCode);
  
  // 写入缓存
  await cacheService.setShortUrl(shortCode, url);
  
  // 生成完整短链接和二维码
  const shortUrl = `${config.baseUrl}/${shortCode}`;
  const qrCode = await generateQRCode(shortUrl);
  
  return {
    url,
    shortUrl,
    qrCode,
  };
}

/**
 * 根据短代码获取URL信息
 */
export async function getUrlByShortCode(shortCode: string): Promise<Url | null> {
  // 验证短代码格式
  if (!isValidShortCode(shortCode)) {
    return null;
  }
  
  // 先查缓存
  const cached = await cacheService.getShortUrl(shortCode);
  
  if (cached === 'NOT_FOUND') {
    return null;
  }
  
  if (cached) {
    return cached;
  }
  
  // 缓存未命中，查数据库
  const url = await urlRepository.findByShortCode(shortCode);
  
  if (!url) {
    // 标记为不存在，防止缓存穿透
    await cacheService.markShortCodeNotFound(shortCode);
    return null;
  }
  
  // 写入缓存
  await cacheService.setShortUrl(shortCode, url);
  
  return url;
}

/**
 * 更新短链接
 */
export async function updateUrl(
  shortCode: string,
  updates: { is_active?: boolean; expires_at?: Date }
): Promise<Url | null> {
  const url = await urlRepository.updateUrl(shortCode, updates);
  
  if (url) {
    // 更新缓存
    await cacheService.setShortUrl(shortCode, url);
  }
  
  return url;
}

/**
 * 删除短链接
 */
export async function deleteUrl(shortCode: string): Promise<boolean> {
  const deleted = await urlRepository.softDelete(shortCode);
  
  if (deleted) {
    // 清除缓存
    await cacheService.deleteShortUrl(shortCode);
  }
  
  return deleted;
}

/**
 * 获取热门短链接
 */
export async function getTopUrls(limit: number = 10, period: string = '7d'): Promise<Url[]> {
  // 先尝试从缓存获取
  const cachedRanking = await cacheService.getTopUrls(limit, period);
  
  if (cachedRanking.length > 0) {
    // 从数据库获取完整信息
    const urls: Url[] = [];
    for (const item of cachedRanking) {
      const url = await getUrlByShortCode(item.shortCode);
      if (url) {
        urls.push(url);
      }
    }
    return urls;
  }
  
  // 缓存未命中，从数据库查询
  const days = period === '1d' ? 1 : period === '7d' ? 7 : period === '30d' ? 30 : 7;
  const urls = await urlRepository.getTopUrls(limit, days);
  
  // 更新缓存排行榜
  for (const url of urls) {
    await cacheService.updateRanking(url.short_code, url.click_count, period);
  }
  
  return urls;
}
