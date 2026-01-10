import { Request, Response } from 'express';
import * as analyticsService from '../services/analyticsService';
import * as urlService from '../services/urlService';
import { asyncHandler, AppError } from '../middlewares/errorHandler';

export const getAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const { shortCode } = req.params;
  const period = (req.query.period as string) || '7d';

  const url = await urlService.getUrlByShortCode(shortCode);

  if (!url) {
    throw new AppError('短链接不存在', 404);
  }

  const days = period === '1d' ? 1 : period === '7d' ? 7 : period === '30d' ? 30 : 365;
  const analytics = await analyticsService.getUrlAnalytics(url.id, days);

  res.json({
    success: true,
    data: analytics,
  });
});

export const getDashboardData = asyncHandler(async (req: Request, res: Response) => {
  const overview = await analyticsService.getDashboardOverview();

  res.json({
    success: true,
    data: overview,
  });
});
