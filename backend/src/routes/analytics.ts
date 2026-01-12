import { Router } from 'express';
import * as analyticsController from '../controllers/analyticsController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// All analytics routes require authentication
router.use(authMiddleware);

router.get('/dashboard', analyticsController.getDashboard);
router.get('/top-links', analyticsController.getTopLinks);
router.get('/links/:id/stats', analyticsController.getLinkStats);
router.get('/links/:id/clicks', analyticsController.getLinkClicks);
router.get('/links/:id/geo', analyticsController.getGeoDistribution);

export default router;
