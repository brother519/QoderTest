/**
 * @file 服务器入口
 * @description 启动HTTP服务器并处理进程信号
 */
require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/database');
const appConfig = require('./config/app');

/**
 * 启动服务器
 * @async
 */
const startServer = async () => {
  try {
    await connectDB();
    
    const server = app.listen(appConfig.port, () => {
      console.log(`Server running in ${appConfig.nodeEnv} mode on port ${appConfig.port}`);
      console.log(`Health check: http://localhost:${appConfig.port}/health`);
    });
    
    /**
     * 优雅关闭处理
     * @param {string} signal - 信号名称
     */
    const gracefulShutdown = (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
      
      setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };
    
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    process.on('unhandledRejection', (err) => {
      console.error('Unhandled Rejection:', err);
      server.close(() => process.exit(1));
    });
    
    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err);
      process.exit(1);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();