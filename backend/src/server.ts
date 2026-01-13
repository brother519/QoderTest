import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';

import routes from './routes';
import redirectRoutes from './routes/redirect';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { generalLimiter } from './middlewares/rateLimit';
import { appConfig } from './config/app';
import logger from './utils/logger';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

// Rate limiting
app.use(generalLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// API routes
app.use(routes);

// Redirect routes (must be last, as it catches /:shortCode)
app.use(redirectRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Start server
const PORT = appConfig.port;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${appConfig.nodeEnv}`);
  logger.info(`Base URL: ${appConfig.baseUrl}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app;
