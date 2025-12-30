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

app.use(helmet());

app.use(cors({
  origin: appConfig.isProduction 
    ? process.env.ALLOWED_ORIGINS?.split(',') 
    : '*',
  credentials: true
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(mongoSanitize());

if (!appConfig.isProduction) {
  app.use(morgan('dev'));
}

app.use(generalLimiter);

app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/roles', roleRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
