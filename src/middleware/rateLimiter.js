/**
 * Rate Limiter Middleware
 * 
 * Protects API endpoints from abuse by limiting request frequency.
 * Uses express-rate-limit with configurable windows and limits.
 */

const rateLimit = require('express-rate-limit');
const appConfig = require('../config/app');
const { ERROR_CODES } = require('../utils/constants');

/**
 * Create a rate limiter with custom configuration
 * 
 * @param {number} maxRequests - Maximum requests allowed in window
 * @param {number} windowMs - Time window in milliseconds
 * @param {string} message - Error message when limit exceeded
 * @returns {Function} - Express rate limiter middleware
 */
const createRateLimiter = (maxRequests, windowMs, message) => {
  return rateLimit({
    windowMs,                    // Time window for rate limiting
    max: maxRequests,            // Max requests per window per IP
    message: {                   // Response when limit exceeded
      success: false,
      error: {
        message,
        code: ERROR_CODES.RATE_LIMIT_EXCEEDED
      }
    },
    standardHeaders: true,       // Return rate limit info in headers
    legacyHeaders: false,        // Disable X-RateLimit-* headers
    keyGenerator: (req) => {     // Use IP address as identifier
      return req.ip || req.connection.remoteAddress;
    }
  });
};

/**
 * Login endpoint rate limiter
 * Strict limit to prevent brute force attacks
 * Default: 5 attempts per 15 minutes
 */
const loginLimiter = createRateLimiter(
  appConfig.rateLimiting.loginLimit,
  15 * 60 * 1000,  // 15 minutes
  'Too many login attempts. Please try again after 15 minutes'
);

/**
 * Registration endpoint rate limiter
 * Prevents mass account creation
 * Default: 10 registrations per hour
 */
const registerLimiter = createRateLimiter(
  10,
  60 * 60 * 1000,  // 1 hour
  'Too many registration attempts. Please try again after 1 hour'
);

/**
 * Password reset endpoint rate limiter
 * Prevents enumeration and abuse
 * Default: 3 attempts per hour
 */
const passwordResetLimiter = createRateLimiter(
  appConfig.rateLimiting.passwordResetLimit,
  60 * 60 * 1000,  // 1 hour
  'Too many password reset attempts. Please try again after 1 hour'
);

/**
 * General API rate limiter
 * Applied to all routes as baseline protection
 * Default: 100 requests per 15 minutes
 */
const generalLimiter = createRateLimiter(
  appConfig.rateLimiting.generalLimit,
  15 * 60 * 1000,  // 15 minutes
  'Too many requests. Please try again later'
);

module.exports = {
  loginLimiter,
  registerLimiter,
  passwordResetLimiter,
  generalLimiter,
  createRateLimiter
};
