import { prisma } from '../config/database.js';
import { hashString } from '../utils/base62.js';
import UAParser from 'ua-parser-js';
import type { ClickData, AnalyticsResponse, DashboardAnalyticsResponse } from '../types/index.js';

function getDeviceType(userAgent: string): string {
  const parser = new UAParser(userAgent);
  const device = parser.getDevice();
  
  // Check for bots
  const botPatterns = [
    /bot/i, /crawler/i, /spider/i, /googlebot/i, /bingbot/i, 
    /slurp/i, /duckduckbot/i, /baiduspider/i, /yandexbot/i
  ];
  
  if (botPatterns.some(pattern => pattern.test(userAgent))) {
    return 'bot';
  }
  
  if (device.type === 'mobile') return 'mobile';
  if (device.type === 'tablet') return 'tablet';
  return 'desktop';
}

function parseUserAgent(userAgent: string): { browser: string; os: string } {
  const parser = new UAParser(userAgent);
  const browser = parser.getBrowser();
  const os = parser.getOS();
  
  return {
    browser: browser.name || 'Unknown',
    os: os.name || 'Unknown',
  };
}

export async function trackClick(
  urlId: string,
  ip: string | undefined,
  userAgent: string | undefined,
  referrer: string | undefined
): Promise<void> {
  const ipHash = ip ? hashString(ip) : undefined;
  const deviceType = userAgent ? getDeviceType(userAgent) : undefined;
  const parsed = userAgent ? parseUserAgent(userAgent) : { browser: undefined, os: undefined };
  
  // Simple geolocation placeholder - in production, use MaxMind or similar
  // For now, we'll leave country/city as undefined
  
  await prisma.click.create({
    data: {
      urlId,
      ipHash,
      userAgent,
      referrer: referrer || undefined,
      deviceType,
      browser: parsed.browser,
      os: parsed.os,
      // country and city would be populated by IP geolocation service
    },
  });
}

export async function getUrlAnalytics(
  urlId: string,
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<AnalyticsResponse | null> {
  // Verify ownership
  const url = await prisma.url.findFirst({
    where: { id: urlId, userId },
  });
  
  if (!url) return null;
  
  const dateFilter = {
    ...(startDate && { gte: startDate }),
    ...(endDate && { lte: endDate }),
  };
  
  const whereClause = {
    urlId,
    ...(startDate || endDate ? { clickedAt: dateFilter } : {}),
  };
  
  // Get total clicks
  const totalClicks = await prisma.click.count({ where: whereClause });
  
  // Get unique visitors (by IP hash)
  const uniqueVisitors = await prisma.click.groupBy({
    by: ['ipHash'],
    where: { ...whereClause, ipHash: { not: null } },
  });
  
  // Get time series (clicks per day)
  const clicksByDay = await prisma.$queryRaw<{ date: Date; count: bigint }[]>`
    SELECT DATE(clicked_at) as date, COUNT(*) as count
    FROM clicks
    WHERE url_id = ${urlId}
    ${startDate ? prisma.$queryRaw`AND clicked_at >= ${startDate}` : prisma.$queryRaw``}
    ${endDate ? prisma.$queryRaw`AND clicked_at <= ${endDate}` : prisma.$queryRaw``}
    GROUP BY DATE(clicked_at)
    ORDER BY date ASC
  `;
  
  // Get geography
  const geography = await prisma.click.groupBy({
    by: ['country', 'city'],
    where: { ...whereClause, country: { not: null } },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10,
  });
  
  // Get referrers
  const referrers = await prisma.click.groupBy({
    by: ['referrer'],
    where: { ...whereClause, referrer: { not: null } },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10,
  });
  
  // Get device breakdown
  const devices = await prisma.click.groupBy({
    by: ['deviceType'],
    where: whereClause,
    _count: { id: true },
  });
  
  const deviceMap = devices.reduce((acc, d) => {
    if (d.deviceType) {
      acc[d.deviceType as keyof typeof acc] = d._count.id;
    }
    return acc;
  }, { mobile: 0, desktop: 0, tablet: 0, bot: 0 });
  
  // Get browsers
  const browsers = await prisma.click.groupBy({
    by: ['browser'],
    where: { ...whereClause, browser: { not: null } },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10,
  });
  
  // Get operating systems
  const operatingSystems = await prisma.click.groupBy({
    by: ['os'],
    where: { ...whereClause, os: { not: null } },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10,
  });
  
  return {
    totalClicks,
    uniqueVisitors: uniqueVisitors.length,
    timeSeries: clicksByDay.map(d => ({
      date: d.date.toISOString().split('T')[0] ?? '',
      clicks: Number(d.count),
    })),
    geography: geography.map(g => ({
      country: g.country ?? 'Unknown',
      city: g.city ?? undefined,
      clicks: g._count.id,
    })),
    referrers: referrers.map(r => ({
      referrer: r.referrer ?? 'Direct',
      clicks: r._count.id,
    })),
    devices: deviceMap,
    browsers: browsers.map(b => ({
      name: b.browser ?? 'Unknown',
      clicks: b._count.id,
    })),
    operatingSystems: operatingSystems.map(o => ({
      name: o.os ?? 'Unknown',
      clicks: o._count.id,
    })),
  };
}

export async function getDashboardAnalytics(
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<DashboardAnalyticsResponse> {
  const dateFilter = {
    ...(startDate && { gte: startDate }),
    ...(endDate && { lte: endDate }),
  };
  
  // Get total URLs
  const totalUrls = await prisma.url.count({
    where: { userId, isActive: true },
  });
  
  // Get user's URL IDs
  const userUrls = await prisma.url.findMany({
    where: { userId, isActive: true },
    select: { id: true, shortCode: true, longUrl: true },
  });
  
  const urlIds = userUrls.map(u => u.id);
  
  if (urlIds.length === 0) {
    return {
      totalClicks: 0,
      totalUrls: 0,
      uniqueVisitors: 0,
      topLinks: [],
      timeSeries: [],
      devices: { mobile: 0, desktop: 0, tablet: 0, bot: 0 },
    };
  }
  
  const whereClause = {
    urlId: { in: urlIds },
    ...(startDate || endDate ? { clickedAt: dateFilter } : {}),
  };
  
  // Get total clicks
  const totalClicks = await prisma.click.count({ where: whereClause });
  
  // Get unique visitors
  const uniqueVisitors = await prisma.click.groupBy({
    by: ['ipHash'],
    where: { ...whereClause, ipHash: { not: null } },
  });
  
  // Get top links
  const topLinksData = await prisma.click.groupBy({
    by: ['urlId'],
    where: whereClause,
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10,
  });
  
  const urlMap = new Map(userUrls.map(u => [u.id, u]));
  const topLinks = topLinksData.map(t => {
    const url = urlMap.get(t.urlId);
    return {
      id: t.urlId,
      shortCode: url?.shortCode ?? '',
      longUrl: url?.longUrl ?? '',
      clicks: t._count.id,
    };
  });
  
  // Get time series
  const clicksByDay = await prisma.$queryRaw<{ date: Date; count: bigint }[]>`
    SELECT DATE(clicked_at) as date, COUNT(*) as count
    FROM clicks
    WHERE url_id = ANY(${urlIds})
    ${startDate ? prisma.$queryRaw`AND clicked_at >= ${startDate}` : prisma.$queryRaw``}
    ${endDate ? prisma.$queryRaw`AND clicked_at <= ${endDate}` : prisma.$queryRaw``}
    GROUP BY DATE(clicked_at)
    ORDER BY date ASC
  `;
  
  // Get device breakdown
  const devices = await prisma.click.groupBy({
    by: ['deviceType'],
    where: whereClause,
    _count: { id: true },
  });
  
  const deviceMap = devices.reduce((acc, d) => {
    if (d.deviceType) {
      acc[d.deviceType as keyof typeof acc] = d._count.id;
    }
    return acc;
  }, { mobile: 0, desktop: 0, tablet: 0, bot: 0 });
  
  return {
    totalClicks,
    totalUrls,
    uniqueVisitors: uniqueVisitors.length,
    topLinks,
    timeSeries: clicksByDay.map(d => ({
      date: d.date.toISOString().split('T')[0] ?? '',
      clicks: Number(d.count),
    })),
    devices: deviceMap,
  };
}
