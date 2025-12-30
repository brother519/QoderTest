const rateLimit = require('express-rate-limit');
const appConfig = require('../config/app');
const { ERROR_CODES } = require('../utils/constants');

const createRateLimiter = (maxRequests, windowMs, message) => {
  return rateLimit({
    windowMs,
    max: maxRequests,
    message: {
      success: false,
      error: {
        message,
        code: ERROR_CODES.RATE_LIMIT_EXCEEDED
      }
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      return req.ip || req.connection.remoteAddress;
    }
  });
};

const loginLimiter = createRateLimiter(
  appConfig.rateLimiting.loginLimit,
  15 * 60 * 1000,
  'Too many login attempts. Please try again after 15 minutes'
);

const registerLimiter = createRateLimiter(
  10,
  60 * 60 * 1000,
  'Too many registration attempts. Please try again after 1 hour'
);

const passwordResetLimiter = createRateLimiter(
  appConfig.rateLimiting.passwordResetLimit,
  60 * 60 * 1000,
  'Too many password reset attempts. Please try again after 1 hour'
);

const generalLimiter = createRateLimiter(
  appConfig.rateLimiting.generalLimit,
  15 * 60 * 1000,
  'Too many requests. Please try again later'
);

module.exports = {
  loginLimiter,
  registerLimiter,
  passwordResetLimiter,
  generalLimiter,
  createRateLimiter
};
