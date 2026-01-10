import { buildApp } from './app';
import { connectDatabase } from './database/connection';
import { appConfig } from './config';
import { startCronJobs } from './jobs';
import { logger } from './utils/logger.util';

async function start() {
  try {
    await connectDatabase();

    const app = await buildApp();

    startCronJobs();

    await app.listen({ 
      port: appConfig.port, 
      host: appConfig.host 
    });

    logger.info(`Server listening on ${appConfig.host}:${appConfig.port}`);
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

start();
