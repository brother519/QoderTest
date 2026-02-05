import { Router } from 'express';
import searchRoutes from './search.routes';

const router = Router();

router.use('/api', searchRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
