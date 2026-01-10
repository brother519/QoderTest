import { Request, Response } from 'express';
import * as urlService from '../services/urlService';
import * as clickRepository from '../repositories/clickRepository';
import * as urlRepository from '../repositories/urlRepository';
import * as cacheService from '../services/cacheService';
import { getLocationFromIP } from '../services/geoService';
import { parseUserAgent } from '../services/userAgentService';
import { asyncHandler, AppError } from '../middlewares/errorHandler';
import { ClickInput } from '../models';

export const redirect = asyncHandler(async (req: Request, res: Response) => {
  const { shortCode } = req.params;

  const url = await urlService.getUrlByShortCode(shortCode);

  if (!url) {
    return res.status(404).send('短链接不存在或已过期');
  }

  // 检查是否过期
  if (url.expires_at && new Date(url.expires_at) < new Date()) {
    return res.status(410).send('短链接已过期');
  }

  // 检查是否启用
  if (!url.is_active) {
    return res.status(403).send('短链接已禁用');
  }

  // 异步记录点击事件（不阻塞重定向）
  recordClickAsync(req, url.id).catch((err) => {
    console.error('记录点击事件失败:', err);
  });

  // 立即重定向
  res.redirect(302, url.original_url);
});

async function recordClickAsync(req: Request, urlId: number): Promise<void> {
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || '';
  const userAgent = req.headers['user-agent'] || '';
  const referer = req.headers['referer'] || req.headers['referrer'] || '';

  // 解析地理位置
  const geo = getLocationFromIP(ip);

  // 解析User-Agent
  const uaInfo = parseUserAgent(userAgent);

  // 构建点击数据
  const clickData: ClickInput = {
    url_id: urlId,
    ip_address: ip,
    user_agent: userAgent,
    referer,
    country: geo.country,
    city: geo.city,
    device_type: uaInfo.deviceType,
    browser: uaInfo.browser,
    os: uaInfo.os,
  };

  // 记录点击
  await clickRepository.recordClick(clickData);

  // 更新数据库点击计数（每10次更新一次，减少数据库压力）
  const random = Math.random();
  if (random < 0.1) {
    await urlRepository.updateClickCount(urlId);
  }

  // 更新Redis缓存
  await cacheService.incrementClickCount(urlId);
}
