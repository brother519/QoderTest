/**
 * Express Application Configuration
 * 
 * Main Express app setup with security middleware, routes, and error handling.
 * This file configures the application but does not start the server.
 */

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const passwordRoutes = require('./routes/password');
const roleRoutes = require('./routes/roles');

// Middleware imports
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');
const appConfig = require('./config/app');

// Initialize Express application
const app = express();

// ============================================
// Security Middleware
// ============================================

// Set security HTTP headers (XSS, clickjacking, etc.)
app.use(helmet());

// Configure CORS for cross-origin requests
app.use(cors({
  origin: appConfig.isProduction 
    ? process.env.ALLOWED_ORIGINS?.split(',')  // Whitelist in production
    : '*',  // Allow all in development
  credentials: true  // Allow cookies
}));

// ============================================
// Body Parsing Middleware
// ============================================

// Parse JSON bodies with size limit for security
app.use(express.json({ limit: '10kb' }));
// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ============================================
// Data Sanitization
// ============================================

// Prevent NoSQL injection attacks
app.use(mongoSanitize());

// ============================================
// Logging
// ============================================

// HTTP request logging (development only)
if (!appConfig.isProduction) {
  app.use(morgan('dev'));
}

// ============================================
// Rate Limiting
// ============================================

// Apply general rate limiting to all routes
app.use(generalLimiter);

// ============================================
// Health Check Endpoint
// ============================================

/**
 * Health check endpoint for load balancers and monitoring
 * GET /health
 */
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// API Routes
// ============================================

app.use('/api/auth', authRoutes);       // Authentication routes
app.use('/api/users', userRoutes);      // User management routes
app.use('/api/password', passwordRoutes); // Password management routes
app.use('/api/roles', roleRoutes);      // Role and permission routes

// ============================================
// Error Handling
// ============================================

// Handle 404 - Route not found
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

module.exports = app;
