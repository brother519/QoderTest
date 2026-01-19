import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { getDashboardAnalytics } from '../services/analytics.service.js';
import { authenticateApiKey, requireScope } from '../middleware/auth.js';

const router = Router();

router.use(authenticateApiKey);

// Get dashboard analytics
router.get(
  '/dashboard',
  requireScope('analytics:read'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.auth!.userId;
      const startDate = req.query['start_date'] 
        ? new Date(req.query['start_date'] as string) 
        : undefined;
      const endDate = req.query['end_date'] 
        ? new Date(req.query['end_date'] as string) 
        : undefined;
      
      const analytics = await getDashboardAnalytics(userId, startDate, endDate);
      res.json(analytics);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
