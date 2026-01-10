import * as clickRepository from '../repositories/clickRepository';
import * as urlRepository from '../repositories/urlRepository';

export interface AnalyticsData {
  totalClicks: number;
  uniqueVisitors: number;
  clicksByDate: Array<{ date: string; clicks: number }>;
  topCountries: Array<{ country: string; clicks: number }>;
  topReferers: Array<{ referer: string; clicks: number }>;
  deviceBreakdown: Record<string, number>;
  browserBreakdown: Record<string, number>;
}

export async function getUrlAnalytics(
  urlId: number,
  days: number = 7
): Promise<AnalyticsData> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const clicks = await clickRepository.getClicksByUrlId(urlId, startDate);
  const clicksByDate = await clickRepository.getClicksByDate(urlId, days);
  const topCountries = await clickRepository.getTopCountries(urlId, 5);
  const topReferers = await clickRepository.getTopReferers(urlId, 5);
  const deviceBreakdown = await clickRepository.getDeviceBreakdown(urlId);
  const browserBreakdown = await clickRepository.getBrowserBreakdown(urlId);

  const uniqueIps = new Set(clicks.map((c) => c.ip_address).filter(Boolean));

  return {
    totalClicks: clicks.length,
    uniqueVisitors: uniqueIps.size,
    clicksByDate,
    topCountries,
    topReferers,
    deviceBreakdown,
    browserBreakdown,
  };
}

export async function getDashboardOverview() {
  const totalUrls = await urlRepository.getTotalCount();
  const activeUrls = await urlRepository.getActiveCount();
  const totalClicks = await clickRepository.getTotalClicks();
  const clicksToday = await clickRepository.getClicksToday();
  const topUrls = await urlRepository.getTopUrls(10, 7);

  // 获取最近30天的点击趋势
  const clickTrend: Array<{ date: string; clicks: number }> = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    clickTrend.push({
      date: dateStr,
      clicks: 0,
    });
  }

  return {
    totalUrls,
    activeUrls,
    totalClicks,
    clicksToday,
    clickTrend,
    topUrls: topUrls.map((url) => ({
      shortCode: url.short_code,
      originalUrl: url.original_url,
      clickCount: url.click_count,
    })),
  };
}
