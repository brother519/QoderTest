import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import imageRoutes from './api/routes/image.routes';
import taskRoutes from './api/routes/task.routes';
import healthRoutes from './api/routes/health.routes';
import { errorHandler, notFoundHandler } from './api/middlewares/error-handler.middleware';
import { apiLimiter } from './api/middlewares/rate-limit.middleware';
import logger from './utils/logger';

/**
 * Create and configure Express application
 */
export function createApp(): Application {
  const app = express();

  // Security middlewares
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));
  app.use(cors());

  // Body parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Request logging
  app.use((req, _res, next) => {
    logger.debug('Incoming request', {
      method: req.method,
      path: req.path,
      query: req.query,
    });
    next();
  });

  // Rate limiting for API routes
  app.use('/api', apiLimiter);

  // API routes
  app.use('/api/v1/images', imageRoutes);
  app.use('/api/v1/tasks', taskRoutes);

  // Health check routes (no rate limiting)
  app.use('/health', healthRoutes);

  // Not found handler
  app.use(notFoundHandler);

  // Error handler
  app.use(errorHandler);

  return app;
}

export default createApp;
