import rateLimit from 'express-rate-limit';
import { appConfig } from '../config/app';

// General rate limiter
export const generalLimiter = rateLimit({
  windowMs: appConfig.rateLimit.windowMs,
  max: appConfig.rateLimit.max,
  message: {
    success: false,
    error: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiter for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for link creation
export const createLinkLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 links per hour
  message: {
    success: false,
    error: 'Link creation limit reached, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Light rate limiter for redirects
export const redirectLimiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 100, // 100 requests per second per IP
  message: {
    success: false,
    error: 'Too many requests',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
