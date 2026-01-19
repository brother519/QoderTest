import { Response } from 'express';
import * as LinkModel from '../models/Link';
import * as ClickModel from '../models/Click';
import { AuthenticatedRequest } from '../types/express.d';
import { BadRequestError, NotFoundError, ForbiddenError } from '../middlewares/errorHandler';
import { query } from '../config/database';

export async function getLinkStats(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    throw new ForbiddenError('Authentication required');
  }

  const linkId = parseInt(req.params.id, 10);

  if (isNaN(linkId)) {
    throw new BadRequestError('Invalid link ID');
  }

  const link = await LinkModel.findLinkById(linkId);

  if (!link) {
    throw new NotFoundError('Link not found');
  }

  if (link.user_id !== req.user.userId) {
    throw new ForbiddenError('Access denied');
  }

  const days = parseInt(req.query.days as string, 10) || 30;

  const [
    totalClicks,
    uniqueVisitors,
    clicksByCountry,
    clicksByBrowser,
    clicksByOS,
    clicksByDevice,
    clicksByDate,
    topReferers,
  ] = await Promise.all([
    ClickModel.getClickCountByLinkId(linkId),
    ClickModel.getUniqueVisitors(linkId),
    ClickModel.getClicksByCountry(linkId),
    ClickModel.getClicksByBrowser(linkId),
    ClickModel.getClicksByOS(linkId),
    ClickModel.getClicksByDeviceType(linkId),
    ClickModel.getClicksByDate(linkId, days),
    ClickModel.getTopReferers(linkId),
  ]);

  res.json({
    success: true,
    data: {
      total_clicks: totalClicks,
      unique_visitors: uniqueVisitors,
      clicks_by_country: clicksByCountry,
      clicks_by_browser: clicksByBrowser,
      clicks_by_os: clicksByOS,
      clicks_by_device: clicksByDevice,
      clicks_by_date: clicksByDate,
      top_referers: topReferers,
    },
  });
}

export async function getLinkClicks(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    throw new ForbiddenError('Authentication required');
  }

  const linkId = parseInt(req.params.id, 10);

  if (isNaN(linkId)) {
    throw new BadRequestError('Invalid link ID');
  }

  const link = await LinkModel.findLinkById(linkId);

  if (!link) {
    throw new NotFoundError('Link not found');
  }

  if (link.user_id !== req.user.userId) {
    throw new ForbiddenError('Access denied');
  }

  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = Math.min(parseInt(req.query.limit as string, 10) || 50, 100);

  const { clicks, total } = await ClickModel.getClicksByLinkId(linkId, page, limit);

  res.json({
    success: true,
    data: {
      items: clicks,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    },
  });
}

export async function getGeoDistribution(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    throw new ForbiddenError('Authentication required');
  }

  const linkId = parseInt(req.params.id, 10);

  if (isNaN(linkId)) {
    throw new BadRequestError('Invalid link ID');
  }

  const link = await LinkModel.findLinkById(linkId);

  if (!link) {
    throw new NotFoundError('Link not found');
  }

  if (link.user_id !== req.user.userId) {
    throw new ForbiddenError('Access denied');
  }

  const clicksByCountry = await ClickModel.getClicksByCountry(linkId);

  // Get city-level data
  const cityResult = await query(
    `SELECT city, country, COUNT(*) as count, 
            AVG(latitude) as lat, AVG(longitude) as lng
     FROM clicks 
     WHERE link_id = $1 AND city IS NOT NULL
     GROUP BY city, country 
     ORDER BY count DESC 
     LIMIT 50`,
    [linkId]
  );

  res.json({
    success: true,
    data: {
      by_country: clicksByCountry,
      by_city: cityResult.rows.map(row => ({
        city: row.city,
        country: row.country,
        count: parseInt(row.count, 10),
        lat: parseFloat(row.lat),
        lng: parseFloat(row.lng),
      })),
    },
  });
}

export async function getDashboard(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    throw new ForbiddenError('Authentication required');
  }

  const userId = req.user.userId;

  // Get overall stats
  const [linksResult, clicksResult, topLinks] = await Promise.all([
    query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_active = true AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)) as active
       FROM links WHERE user_id = $1`,
      [userId]
    ),
    query(
      `SELECT SUM(click_count) as total FROM links WHERE user_id = $1`,
      [userId]
    ),
    LinkModel.getTopLinks(userId, 10),
  ]);

  // Get recent activity (clicks in last 7 days)
  const recentActivity = await query(
    `SELECT DATE(c.clicked_at) as date, COUNT(*) as clicks
     FROM clicks c
     JOIN links l ON c.link_id = l.id
     WHERE l.user_id = $1 AND c.clicked_at >= CURRENT_DATE - INTERVAL '7 days'
     GROUP BY DATE(c.clicked_at)
     ORDER BY date ASC`,
    [userId]
  );

  res.json({
    success: true,
    data: {
      total_links: parseInt(linksResult.rows[0].total, 10),
      active_links: parseInt(linksResult.rows[0].active, 10),
      total_clicks: parseInt(clicksResult.rows[0].total || 0, 10),
      top_links: topLinks,
      recent_activity: recentActivity.rows.map(row => ({
        date: row.date.toISOString().split('T')[0],
        clicks: parseInt(row.clicks, 10),
      })),
    },
  });
}

export async function getTopLinks(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    throw new ForbiddenError('Authentication required');
  }

  const limit = Math.min(parseInt(req.query.limit as string, 10) || 10, 50);
  const topLinks = await LinkModel.getTopLinks(req.user.userId, limit);

  res.json({
    success: true,
    data: topLinks,
  });
}
