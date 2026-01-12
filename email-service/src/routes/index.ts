import { Router } from 'express';
import { authMiddleware, webhookAuthMiddleware } from '../middleware/index.js';
import emailRoutes from './email.routes.js';
import templateRoutes from './template.routes.js';
import trackingRoutes, { unsubscribeRouter } from './tracking.routes.js';
import webhookRoutes from './webhook.routes.js';
import analyticsRoutes from './analytics.routes.js';

const router = Router();

// 健康检查
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 需要认证的路由
router.use('/emails', authMiddleware, emailRoutes);
router.use('/templates', authMiddleware, templateRoutes);
router.use('/analytics', authMiddleware, analyticsRoutes);

// 追踪路由（像素和点击不需要认证）
router.use('/tracking', trackingRoutes);

// 退订路由（不需要认证）
router.use('/unsubscribe', unsubscribeRouter);

// Webhook 路由（使用特定的验证）
router.use('/webhooks', webhookAuthMiddleware, webhookRoutes);

export default router;
