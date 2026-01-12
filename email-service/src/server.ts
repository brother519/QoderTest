import { createApp } from './app.js';
import { config } from './config/index.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { redis } from './config/redis.js';
import { failoverService, queueService } from './services/index.js';
import { createLogger } from './utils/logger.js';

const logger = createLogger('server');

async function main() {
  try {
    logger.info('Starting email service...');
    
    // 连接数据库
    await connectDatabase();
    
    // 初始化提供商配置
    await failoverService.initializeProviders();
    
    // 启动健康检查
    failoverService.startHealthChecks();
    
    // 创建应用
    const app = createApp();
    
    // 启动服务器
    const server = app.listen(config.port, () => {
      logger.info({ port: config.port }, 'Email service started');
    });
    
    // 优雅关闭
    const shutdown = async (signal: string) => {
      logger.info({ signal }, 'Received shutdown signal');
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        failoverService.stopHealthChecks();
        await queueService.close();
        await disconnectDatabase();
        await redis.quit();
        
        logger.info('Email service shut down gracefully');
        process.exit(0);
      });
      
      // 强制关闭超时
      setTimeout(() => {
        logger.error('Forced shutdown due to timeout');
        process.exit(1);
      }, 10000);
    };
    
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    
  } catch (error) {
    logger.error({ error }, 'Failed to start email service');
    process.exit(1);
  }
}

main();
