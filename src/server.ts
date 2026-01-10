import 'reflect-metadata';
import app from './app';
import { config } from './config/environment';
import { logger } from './utils/logger';

// 启动服务器 // 收到修改
const startServer = async () => {
  try {
    const port = config.port;

    app.listen(port, () => {
      logger.info(`🚀 服务器启动成功！`);
      logger.info(`📍 环境: ${config.nodeEnv}`);
      logger.info(`🌐 地址: http://localhost:${port}`);
      logger.info(`📊 API: http://localhost:${port}${config.apiPrefix}`);
      logger.info(`🏥 健康检查: http://localhost:${port}/health`);
      
      if (config.swagger.enabled) {
        logger.info(`📚 API文档: http://localhost:${port}${config.swagger.path}`);
      }
    });

    // 优雅关闭
    const gracefulShutdown = (signal: string) => {
      logger.info(`收到 ${signal} 信号，正在优雅关闭服务器...`);
      process.exit(0);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();
