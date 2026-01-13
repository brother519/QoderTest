import rateLimit from 'express-rate-limit';
import { RATE_LIMIT_WINDOW, RATE_LIMIT_MAX } from '../config/index.js';

export const globalRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW,
  max: RATE_LIMIT_MAX,
  message: {
    error: 'TooManyRequests',
    message: 'Too many requests, please try again later',
    statusCode: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const createUrlRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW,
  max: 10, // 10 URL creations per minute
  message: {
    error: 'TooManyRequests',
    message: 'Too many URL creation requests, please try again later',
    statusCode: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
});
