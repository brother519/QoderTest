import { Request, Response } from 'express';
import * as urlService from '../services/urlService';
import { CreateUrlInput } from '../models';
import { asyncHandler, AppError } from '../middlewares/errorHandler';

export const createUrl = asyncHandler(async (req: Request, res: Response) => {
  const input: CreateUrlInput = {
    original_url: req.body.url,
    custom_code: req.body.customCode,
    custom_domain: req.body.customDomain,
    title: req.body.title,
    expires_in: req.body.expiresIn,
  };

  const result = await urlService.createShortUrl(input);

  res.status(201).json({
    success: true,
    data: {
      id: result.url.id,
      shortCode: result.url.short_code,
      shortUrl: result.shortUrl,
      originalUrl: result.url.original_url,
      qrCode: result.qrCode,
      createdAt: result.url.created_at,
      expiresAt: result.url.expires_at,
    },
  });
});

export const getUrl = asyncHandler(async (req: Request, res: Response) => {
  const { shortCode } = req.params;

  const url = await urlService.getUrlByShortCode(shortCode);

  if (!url) {
    throw new AppError('短链接不存在', 404);
  }

  res.json({
    success: true,
    data: {
      id: url.id,
      shortCode: url.short_code,
      originalUrl: url.original_url,
      title: url.title,
      clickCount: url.click_count,
      createdAt: url.created_at,
      expiresAt: url.expires_at,
      isActive: url.is_active,
      lastClickedAt: url.last_clicked_at,
    },
  });
});

export const updateUrl = asyncHandler(async (req: Request, res: Response) => {
  const { shortCode } = req.params;
  const updates = {
    is_active: req.body.isActive,
    expires_at: req.body.expiresAt ? new Date(req.body.expiresAt) : undefined,
  };

  const url = await urlService.updateUrl(shortCode, updates);

  if (!url) {
    throw new AppError('短链接不存在', 404);
  }

  res.json({
    success: true,
    data: {
      shortCode: url.short_code,
      isActive: url.is_active,
      expiresAt: url.expires_at,
    },
  });
});

export const deleteUrl = asyncHandler(async (req: Request, res: Response) => {
  const { shortCode } = req.params;

  const deleted = await urlService.deleteUrl(shortCode);

  if (!deleted) {
    throw new AppError('短链接不存在', 404);
  }

  res.json({
    success: true,
    message: '短链接已删除',
  });
});

export const getTopUrls = asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const period = (req.query.period as string) || '7d';

  const urls = await urlService.getTopUrls(limit, period);

  res.json({
    success: true,
    data: urls.map((url) => ({
      shortCode: url.short_code,
      originalUrl: url.original_url,
      title: url.title,
      clickCount: url.click_count,
      createdAt: url.created_at,
    })),
  });
});
