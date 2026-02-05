import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import { appConfig, jwtConfig, rateLimitConfig, corsConfig, uploadConfig } from './config';
import { logger } from './utils/logger.util';
import { registerRoutes } from './routes';
import { errorHandler } from './middleware/error-handler.middleware';

export async function buildApp() {
  const app = Fastify({
    logger: logger as any,
    bodyLimit: uploadConfig.maxFileSize,
  });

  await app.register(cors, {
    origin: corsConfig.origin,
    credentials: true,
  });

  await app.register(jwt, {
    secret: jwtConfig.secret,
  });

  await app.register(rateLimit, {
    max: rateLimitConfig.max,
    timeWindow: rateLimitConfig.timeWindow,
  });

  await app.register(multipart, {
    limits: {
      fileSize: uploadConfig.maxFileSize,
      files: 1,
    },
  });

  await registerRoutes(app);

  app.setErrorHandler(errorHandler);

  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }));

  return app;
}
