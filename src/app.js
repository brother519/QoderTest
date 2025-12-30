/**
 * @file Express应用配置
 * @description 配置Express应用程序、中间件和路由
 */
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const passwordRoutes = require('./routes/password');
const roleRoutes = require('./routes/roles');

const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');
const appConfig = require('./config/app');

const app = express();

/** 安全头部配置 */
app.use(helmet());

/** 跨域配置 */
app.use(cors({
  origin: appConfig.isProduction 
    ? process.env.ALLOWED_ORIGINS?.split(',') 
    : '*',
  credentials: true
}));

/** 请求体解析 */
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

/** 防止NoSQL注入 */
app.use(mongoSanitize());

/** 开发环境日志 */
if (!appConfig.isProduction) {
  app.use(morgan('dev'));
}

/** 通用速率限制 */
app.use(generalLimiter);

/** 健康检查端点 */
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

/** API路由 */
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/roles', roleRoutes);

/** 错误处理 */
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;