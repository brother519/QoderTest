require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const logger = require('./utils/logger');
const apiRoutes = require('./routes/api.routes');
const LogStreamService = require('./websocket/logStream.ws');

// 初始化邮件服务（启动Worker）
require('./services/email.service');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// API路由
app.use('/api/v1', apiRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 初始化WebSocket服务
new LogStreamService(io);

// 启动服务器
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  logger.info(`日志平台后端服务启动成功，端口: ${PORT}`);
  logger.info(`环境: ${process.env.NODE_ENV || 'development'}`);
});

// 错误处理
process.on('unhandledRejection', (err) => {
  logger.error('未处理的Promise拒绝:', err);
});

process.on('uncaughtException', (err) => {
  logger.error('未捕获的异常:', err);
  process.exit(1);
});
