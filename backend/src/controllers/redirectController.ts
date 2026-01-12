import { Request, Response } from 'express';
import * as LinkModel from '../models/Link';
import * as ClickModel from '../models/Click';
import { buildClickData } from '../services/trackingService';
import { NotFoundError } from '../middlewares/errorHandler';
import logger from '../utils/logger';

export async function redirect(req: Request, res: Response): Promise<void> {
  const { shortCode } = req.params;

  // Get the active link
  const link = await LinkModel.getActiveLink(shortCode);

  if (!link) {
    throw new NotFoundError('Link not found or expired');
  }

  // Track the click asynchronously (don't wait for it)
  trackClick(link.id, req).catch(err => {
    logger.error('Failed to track click', err);
  });

  // Perform redirect
  res.redirect(301, link.original_url);
}

async function trackClick(linkId: number, req: Request): Promise<void> {
  // Build click data
  const clickData = buildClickData(linkId, req);

  // Save click to database
  await ClickModel.createClick(clickData);

  // Increment click count
  await LinkModel.incrementClickCount(linkId);
}

/**
 * Preview endpoint - returns link info without redirecting
 */
export async function preview(req: Request, res: Response): Promise<void> {
  const { shortCode } = req.params;

  const link = await LinkModel.getActiveLink(shortCode);

  if (!link) {
    throw new NotFoundError('Link not found or expired');
  }

  res.json({
    success: true,
    data: {
      original_url: link.original_url,
      title: link.title,
      description: link.description,
      created_at: link.created_at,
      click_count: link.click_count,
    },
  });
}
