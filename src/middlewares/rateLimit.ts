import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redis from '../config/redis';
import config from '../config/env';

export const createUrlLimiter = rateLimit({
  store: new RedisStore({
    client: redis as any,
    prefix: 'ratelimit:create:',
  }),
  windowMs: 60 * 1000,
  max: config.rateLimit.create,
  message: {
    success: false,
    error: {
      message: '请求过于频繁，请稍后再试',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const queryLimiter = rateLimit({
  store: new RedisStore({
    client: redis as any,
    prefix: 'ratelimit:query:',
  }),
  windowMs: 60 * 1000,
  max: config.rateLimit.query,
  message: {
    success: false,
    error: {
      message: '请求过于频繁，请稍后再试',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const redirectLimiter = rateLimit({
  store: new RedisStore({
    client: redis as any,
    prefix: 'ratelimit:redirect:',
  }),
  windowMs: 60 * 1000,
  max: config.rateLimit.redirect,
  message: '请求过于频繁',
  standardHeaders: true,
  legacyHeaders: false,
});
