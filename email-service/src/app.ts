import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorMiddleware, notFoundMiddleware } from './middleware/index.js';
import routes from './routes/index.js';
import { createLogger } from './utils/logger.js';

const logger = createLogger('app');

export function createApp() {
  const app = express();
  
  // 安全中间件
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // 允许追踪像素跨域
  }));
  
  // CORS
  app.use(cors());
  
  // 请求体解析
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  
  // 限流
  const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 每分钟 100 请求
    message: { error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // 跳过追踪像素和点击追踪的限流
      return req.path.includes('/tracking/pixel') || req.path.includes('/tracking/click');
    },
  });
  
  app.use(limiter);
  
  // 请求日志
  app.use((req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info({
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration,
      }, 'Request completed');
    });
    
    next();
  });
  
  // API 路由
  app.use('/api/v1', routes);
  
  // 404 处理
  app.use(notFoundMiddleware);
  
  // 错误处理
  app.use(errorMiddleware);
  
  return app;
}
