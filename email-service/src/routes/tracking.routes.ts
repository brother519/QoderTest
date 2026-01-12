import { Router } from 'express';
import { trackingController, unsubscribeController } from '../controllers/index.js';

const router = Router();

// GET /api/v1/tracking/pixel/:trackingId - 追踪像素
router.get('/pixel/:trackingId', (req, res) => {
  trackingController.trackOpen(req, res);
});

// GET /api/v1/tracking/click/:trackingId - 点击追踪
router.get('/click/:trackingId', (req, res) => {
  trackingController.trackClick(req, res);
});

// GET /api/v1/tracking/:jobId/stats - 获取追踪统计
router.get('/:jobId/stats', (req, res) => {
  trackingController.getStats(req, res);
});

export default router;

// 退订路由
export const unsubscribeRouter = Router();

// GET /api/v1/unsubscribe/:token - 退订页面
unsubscribeRouter.get('/:token', (req, res) => {
  unsubscribeController.showUnsubscribePage(req, res);
});

// POST /api/v1/unsubscribe - 处理退订请求
unsubscribeRouter.post('/', (req, res) => {
  unsubscribeController.processUnsubscribe(req, res);
});

// GET /api/v1/unsubscribe/check/:email - 检查退订状态
unsubscribeRouter.get('/check/:email', (req, res) => {
  unsubscribeController.checkStatus(req, res);
});
