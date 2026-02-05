import { Router } from 'express';
import authRoutes from './auth';
import linkRoutes from './links';
import analyticsRoutes from './analytics';
import domainRoutes from './domains';

const router = Router();

// API routes
router.use('/api/auth', authRoutes);
router.use('/api/links', linkRoutes);
router.use('/api/analytics', analyticsRoutes);
router.use('/api/domains', domainRoutes);

// Health check
router.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
