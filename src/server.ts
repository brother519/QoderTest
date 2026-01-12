import { createApp } from './app';
import { config } from './config';
import { queueService } from './services/queue.service';
import { cache } from './services/cache.service';
import logger from './utils/logger';

const app = createApp();

// Graceful shutdown handler
async function shutdown(signal: string): Promise<void> {
  logger.info(`Received ${signal}, starting graceful shutdown...`);

  try {
    // Close queue connections
    await queueService.close();
    logger.info('Queue connections closed');

    // Close cache connections
    await cache.close();
    logger.info('Cache connections closed');

    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', { error });
    process.exit(1);
  }
}

// Register shutdown handlers
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason });
});

// Start server
app.listen(config.port, () => {
  logger.info(`Server started on port ${config.port}`, {
    env: config.nodeEnv,
    port: config.port,
  });
});
