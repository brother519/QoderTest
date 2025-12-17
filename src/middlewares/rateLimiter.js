const rateLimit = require('express-rate-limit');
const securityConfig = require('../config/security');

const generalLimiter = rateLimit({
  windowMs: securityConfig.rateLimit.windowMs,
  max: securityConfig.rateLimit.maxRequests,
  message: {
    error: {
      message: 'Too many requests, please try again later',
      code: 'RATE_LIMIT_EXCEEDED'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

const loginLimiter = rateLimit({
  windowMs: securityConfig.rateLimit.loginWindowMs,
  max: securityConfig.rateLimit.loginMaxAttempts,
  message: {
    error: {
      message: 'Too many login attempts, please try again after 5 minutes',
      code: 'LOGIN_RATE_LIMIT_EXCEEDED'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false
});

const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    error: {
      message: 'Too many registration attempts, please try again after 1 hour',
      code: 'REGISTRATION_RATE_LIMIT_EXCEEDED'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  generalLimiter,
  loginLimiter,
  registrationLimiter
};
