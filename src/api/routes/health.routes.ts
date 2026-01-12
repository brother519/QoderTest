import { Router, Request, Response } from 'express';
import { cache } from '../../services/cache.service';
import { queueService, QUEUE_NAMES } from '../../services/queue.service';

const router = Router();

// Basic health check
router.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Readiness check (all dependencies ready)
router.get('/ready', async (_req: Request, res: Response) => {
  try {
    // Check Redis
    const cacheStats = await cache.getStats();

    if (!cacheStats.connected) {
      res.status(503).json({
        status: 'not_ready',
        reason: 'Redis not connected',
      });
      return;
    }

    res.json({
      status: 'ready',
      dependencies: {
        redis: 'connected',
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      reason: 'Dependency check failed',
    });
  }
});

// Liveness check (basic ping)
router.get('/live', (_req: Request, res: Response) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
});

// Detailed status with metrics
router.get('/status', async (_req: Request, res: Response) => {
  try {
    // Get cache stats
    const cacheStats = await cache.getStats();

    // Get queue stats
    const uploadQueueStats = await queueService.getQueueStats(QUEUE_NAMES.IMAGE_UPLOAD);
    const transformQueueStats = await queueService.getQueueStats(QUEUE_NAMES.IMAGE_TRANSFORM);
    const thumbnailQueueStats = await queueService.getQueueStats(QUEUE_NAMES.THUMBNAIL_GENERATION);

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + 'MB',
      },
      cache: cacheStats,
      queues: {
        upload: uploadQueueStats,
        transform: transformQueueStats,
        thumbnail: thumbnailQueueStats,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to collect status',
    });
  }
});

export default router;
