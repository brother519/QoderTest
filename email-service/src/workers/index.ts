import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { redis } from '../config/redis.js';
import { createLogger } from '../utils/logger.js';
import { failoverService } from '../services/failover.service.js';
import { emailSenderWorker } from './email-sender.worker.js';

const logger = createLogger('worker');

async function main(): Promise<void> {
  logger.info('Starting email workers...');
  
  try {
    // 连接数据库
    await connectDatabase();
    
    // 初始化提供商配置
    await failoverService.initializeProviders();
    
    // 启动健康检查
    failoverService.startHealthChecks();
    
    // 启动邮件发送 Worker
    await emailSenderWorker.start();
    
    logger.info('All workers started successfully');
    
    // 优雅关闭
    const shutdown = async (signal: string) => {
      logger.info({ signal }, 'Received shutdown signal');
      
      failoverService.stopHealthChecks();
      await emailSenderWorker.close();
      await disconnectDatabase();
      await redis.quit();
      
      logger.info('Workers shut down gracefully');
      process.exit(0);
    };
    
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    
  } catch (error) {
    logger.error({ error }, 'Failed to start workers');
    process.exit(1);
  }
}

main();
