const rateLimit = require('express-rate-limit');
const { TooManyRequestsError } = require('../utils/errors');

const createLimiter = (options) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    handler: (req, res, next) => {
      next(new TooManyRequestsError(options.message || 'Too many requests'));
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

const loginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts. Please try again after 15 minutes'
});

const registerLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many registration attempts. Please try again after an hour'
});

const passwordResetLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many password reset requests. Please try again after an hour'
});

const twoFactorLimiter = createLimiter({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: 'Too many 2FA attempts. Please try again after 5 minutes'
});

const generalLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 100,
  message: 'Too many requests. Please slow down'
});

module.exports = {
  loginLimiter,
  registerLimiter,
  passwordResetLimiter,
  twoFactorLimiter,
  generalLimiter
};
