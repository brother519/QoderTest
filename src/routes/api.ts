import { Router } from 'express';
import * as urlController from '../controllers/urlController';
import * as analyticsController from '../controllers/analyticsController';
import { validateCreateUrl, validateUpdateUrl } from '../middlewares/validator';
import { createUrlLimiter, queryLimiter } from '../middlewares/rateLimit';

const router = Router();

// URL管理路由
router.post('/urls', createUrlLimiter, validateCreateUrl, urlController.createUrl);
router.get('/urls/top', queryLimiter, urlController.getTopUrls);
router.get('/urls/:shortCode', queryLimiter, urlController.getUrl);
router.patch('/urls/:shortCode', validateUpdateUrl, urlController.updateUrl);
router.delete('/urls/:shortCode', urlController.deleteUrl);

// 分析路由
router.get('/urls/:shortCode/analytics', queryLimiter, analyticsController.getAnalytics);
router.get('/dashboard/overview', queryLimiter, analyticsController.getDashboardData);

export default router;
