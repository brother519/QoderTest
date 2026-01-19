import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { 
  createUrl, 
  getUrlById, 
  listUrls, 
  updateUrl, 
  deleteUrl 
} from '../services/url.service.js';
import { getQrCodePath, generateQrCodeBuffer } from '../services/qrcode.service.js';
import { getUrlAnalytics } from '../services/analytics.service.js';
import { authenticateApiKey, requireScope } from '../middleware/auth.js';
import { createUrlRateLimiter } from '../middleware/rateLimit.js';
import { AppError } from '../middleware/error.js';
import { env } from '../config/index.js';
import type { CreateUrlRequest, UpdateUrlRequest } from '../types/index.js';

const router = Router();

// All routes require authentication
router.use(authenticateApiKey);

// Create URL
router.post(
  '/',
  createUrlRateLimiter,
  requireScope('url:create'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: CreateUrlRequest = req.body;
      const userId = req.auth!.userId;
      
      const url = await createUrl(data, userId);
      res.status(201).json(url);
    } catch (error) {
      next(error);
    }
  }
);

// List URLs
router.get(
  '/',
  requireScope('url:read'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.auth!.userId;
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = Math.min(parseInt(req.query['limit'] as string) || 20, 100);
      const search = req.query['search'] as string | undefined;
      
      const result = await listUrls(userId, page, limit, search);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// Get URL by ID
router.get(
  '/:id',
  requireScope('url:read'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.auth!.userId;
      const { id } = req.params;
      
      const url = await getUrlById(id!, userId);
      
      if (!url) {
        throw new AppError('URL not found', 404);
      }
      
      res.json(url);
    } catch (error) {
      next(error);
    }
  }
);

// Update URL
router.patch(
  '/:id',
  requireScope('url:update'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.auth!.userId;
      const { id } = req.params;
      const data: UpdateUrlRequest = req.body;
      
      const url = await updateUrl(id!, userId, data);
      
      if (!url) {
        throw new AppError('URL not found', 404);
      }
      
      res.json(url);
    } catch (error) {
      next(error);
    }
  }
);

// Delete URL
router.delete(
  '/:id',
  requireScope('url:delete'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.auth!.userId;
      const { id } = req.params;
      
      const deleted = await deleteUrl(id!, userId);
      
      if (!deleted) {
        throw new AppError('URL not found', 404);
      }
      
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
);

// Get QR code
router.get(
  '/:id/qr',
  requireScope('url:read'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.auth!.userId;
      const { id } = req.params;
      const size = parseInt(req.query['size'] as string) || 300;
      const format = (req.query['format'] as string) === 'svg' ? 'svg' : 'png';
      
      const url = await getUrlById(id!, userId);
      
      if (!url) {
        throw new AppError('URL not found', 404);
      }
      
      const qrData = await generateQrCodeBuffer(url.shortUrl, size, format);
      
      if (format === 'svg') {
        res.setHeader('Content-Type', 'image/svg+xml');
        res.send(qrData);
      } else {
        res.setHeader('Content-Type', 'image/png');
        res.send(qrData);
      }
    } catch (error) {
      next(error);
    }
  }
);

// Get URL analytics
router.get(
  '/:id/analytics',
  requireScope('analytics:read'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.auth!.userId;
      const { id } = req.params;
      const startDate = req.query['start_date'] 
        ? new Date(req.query['start_date'] as string) 
        : undefined;
      const endDate = req.query['end_date'] 
        ? new Date(req.query['end_date'] as string) 
        : undefined;
      
      const analytics = await getUrlAnalytics(id!, userId, startDate, endDate);
      
      if (!analytics) {
        throw new AppError('URL not found', 404);
      }
      
      res.json(analytics);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
