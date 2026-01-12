import { Router } from 'express';
import { analyticsController } from '../controllers/index.js';

const router = Router();

// GET /api/v1/analytics/overview - 总体统计
router.get('/overview', (req, res) => {
  analyticsController.getOverview(req, res);
});

// GET /api/v1/analytics/daily - 每日统计
router.get('/daily', (req, res) => {
  analyticsController.getDailyStats(req, res);
});

// GET /api/v1/analytics/template/:templateId - 模板统计
router.get('/template/:templateId', (req, res) => {
  analyticsController.getTemplateStats(req, res);
});

// GET /api/v1/analytics/bounces - 退信分析
router.get('/bounces', (req, res) => {
  analyticsController.getBounceAnalysis(req, res);
});

// GET /api/v1/analytics/providers - 提供商统计
router.get('/providers', (req, res) => {
  analyticsController.getProviderStats(req, res);
});

// GET /api/v1/analytics/queue - 队列统计
router.get('/queue', (req, res) => {
  analyticsController.getQueueStats(req, res);
});

export default router;
