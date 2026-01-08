const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const appConfig = require('./config/app.config');
const { generalLimiter } = require('./middleware/rate-limiter');
const errorHandler = require('./middleware/error-handler');
const levelRoutes = require('./routes/level.routes');
const gameRoutes = require('./routes/game.routes');

const app = express();

// 中间件
app.use(helmet());
app.use(cors(appConfig.cors));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 速率限制
app.use('/api/', generalLimiter);

// 路由
app.use('/api/levels', levelRoutes);
app.use('/api/game', gameRoutes);

// 健康检查
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// 错误处理
app.use(errorHandler);

module.exports = app;
