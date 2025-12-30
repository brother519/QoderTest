/**
 * Application Configuration
 * 
 * Centralized configuration loaded from environment variables.
 * Provides defaults for development environment.
 */

require('dotenv').config();

module.exports = {
  // Server port (default: 3000)
  port: process.env.PORT || 3000,
  
  // Current environment name
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Environment type flags for conditional logic
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  
  // Bcrypt salt rounds for password hashing (higher = more secure but slower)
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,
  
  // Rate limiting configuration
  rateLimiting: {
    loginLimit: parseInt(process.env.LOGIN_RATE_LIMIT, 10) || 5,           // Max login attempts per 15 min
    passwordResetLimit: parseInt(process.env.PASSWORD_RESET_RATE_LIMIT, 10) || 3,  // Max reset attempts per hour
    generalLimit: 100  // Max general API requests per 15 min
  },
  
  // Logging level (error, warn, info, debug)
  logLevel: process.env.LOG_LEVEL || 'info'
};
