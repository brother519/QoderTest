import app from './app';
import config from './config/env';
import pool from './config/database';
import redis from './config/redis';
import logger from './middlewares/logger';

const PORT = config.port;

async function startServer() {
  try {
    // 测试数据库连接
    await pool.query('SELECT NOW()');
    logger.info('PostgreSQL数据库连接成功');

    // 测试Redis连接
    await redis.ping();
    logger.info('Redis连接成功');

    // 启动HTTP服务器
    const server = app.listen(PORT, () => {
      logger.info(`短链接服务已启动，监听端口: ${PORT}`);
      logger.info(`环境: ${config.nodeEnv}`);
      logger.info(`基础URL: ${config.baseUrl}`);
      logger.info(`仪表板: ${config.baseUrl}/dashboard`);
    });

    // 优雅关闭
    const gracefulShutdown = async (signal: string) => {
      logger.info(`收到 ${signal} 信号，开始优雅关闭...`);

      server.close(async () => {
        logger.info('HTTP服务器已关闭');

        try {
          await pool.end();
          logger.info('数据库连接池已关闭');

          redis.disconnect();
          logger.info('Redis连接已关闭');

          process.exit(0);
        } catch (error) {
          logger.error('关闭过程中出错:', error);
          process.exit(1);
        }
      });

      // 强制关闭超时
      setTimeout(() => {
        logger.error('强制关闭超时，立即退出');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error('服务器启动失败:', error);
    process.exit(1);
  }
}

startServer();
