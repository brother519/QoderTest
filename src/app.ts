import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { morganMiddleware } from './middlewares/logger';
import { errorHandler } from './middlewares/errorHandler';
import apiRoutes from './routes/api';
import redirectRoutes from './routes/redirect';
import path from 'path';

const app = express();

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: false, // 允许仪表板加载外部资源
}));

// CORS配置
app.use(cors());

// 请求解析
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP日志
app.use(morganMiddleware);

// 静态文件（仪表板）
app.use('/dashboard', express.static(path.join(__dirname, '../public')));

// 健康检查端点
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API路由
app.use('/api', apiRoutes);

// 重定向路由（需要放在最后，避免与API路由冲突）
app.use('/', redirectRoutes);

// 404处理
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      message: '路由不存在',
    },
  });
});

// 错误处理中间件
app.use(errorHandler);

export default app;
