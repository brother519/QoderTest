import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from 'dotenv';

// Load environment variables
config();

import { env } from './config/index.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { getRedis, disconnectRedis } from './config/redis.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import { globalRateLimiter } from './middleware/rateLimit.js';
import { bootstrapApiKey } from './services/apikey.service.js';

// Import routes
import urlsRoutes from './routes/urls.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import apiKeysRoutes from './routes/apikeys.routes.js';
import redirectRoutes from './routes/redirect.routes.js';

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS configuration
app.use(cors({
  origin: env.isDevelopment ? '*' : ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global rate limiting
app.use('/v1', globalRateLimiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes (v1)
app.use('/v1/urls', urlsRoutes);
app.use('/v1/analytics', analyticsRoutes);
app.use('/v1/api-keys', apiKeysRoutes);

// Redirect route (must be last to avoid catching API routes)
app.use('/', redirectRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown
async function shutdown() {
  console.log('Shutting down...');
  await disconnectDatabase();
  await disconnectRedis();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start server
async function start() {
  try {
    // Connect to database
    await connectDatabase();
    
    // Initialize Redis
    getRedis();
    
    // Bootstrap dev API key if needed
    if (env.isDevelopment) {
      const devKey = await bootstrapApiKey('dev-user');
      if (devKey) {
        console.log('========================================');
        console.log('Development API Key created:');
        console.log(devKey);
        console.log('Save this key - it will not be shown again!');
        console.log('========================================');
      }
    }
    
    app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
      console.log(`API base: ${env.apiBaseUrl}`);
      console.log(`Short URL base: ${env.shortUrlBase}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
