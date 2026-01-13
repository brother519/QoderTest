import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { getUrlByShortCode } from '../services/url.service.js';
import { trackClick } from '../services/analytics.service.js';
import { AppError } from '../middleware/error.js';

const router = Router();

// Redirect short URL to long URL
router.get(
  '/:shortCode',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { shortCode } = req.params;
      
      if (!shortCode) {
        throw new AppError('Short code is required', 400);
      }
      
      const result = await getUrlByShortCode(shortCode);
      
      if (!result) {
        throw new AppError('URL not found or has expired', 404);
      }
      
      // Track click asynchronously (don't wait)
      const ip = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];
      const referrer = req.headers['referer'] || req.headers['referrer'];
      
      trackClick(
        result.urlId,
        ip,
        userAgent,
        referrer as string | undefined
      ).catch(err => {
        console.error('Failed to track click:', err.message);
      });
      
      // Redirect
      res.redirect(302, result.longUrl);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
