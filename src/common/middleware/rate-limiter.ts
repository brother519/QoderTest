import rateLimit from 'express-rate-limit';
import { config } from '../../config';

export const globalRateLimiter = rateLimit({
  windowMs: config.security.rateLimitWindowMs,
  max: config.security.rateLimitMaxRequests,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT',
      message: 'Too many authentication attempts, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    error: {
      code: 'REGISTER_RATE_LIMIT',
      message: 'Too many registration attempts, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const twoFactorRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: {
      code: '2FA_RATE_LIMIT',
      message: 'Too many 2FA attempts, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
