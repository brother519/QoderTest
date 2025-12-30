/**
 * @file 速率限制中间件
 * @description 防止API滥用的请求速率限制
 */
const rateLimit = require('express-rate-limit');
const appConfig = require('../config/app');
const { ERROR_CODES } = require('../utils/constants');

/**
 * 创建速率限制器
 * @param {number} maxRequests - 最大请求数
 * @param {number} windowMs - 时间窗口(毫秒)
 * @param {string} message - 超限提示消息
 * @returns {Function} Express中间件函数
 */
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

/** 登录接口速率限制器 */
const loginLimiter = createRateLimiter(
  appConfig.rateLimiting.loginLimit,
  15 * 60 * 1000,
  'Too many login attempts. Please try again after 15 minutes'
);

/** 注册接口速率限制器 */
const registerLimiter = createRateLimiter(
  10,
  60 * 60 * 1000,
  'Too many registration attempts. Please try again after 1 hour'
);

/** 密码重置接口速率限制器 */
const passwordResetLimiter = createRateLimiter(
  appConfig.rateLimiting.passwordResetLimit,
  60 * 60 * 1000,
  'Too many password reset attempts. Please try again after 1 hour'
);

/** 通用接口速率限制器 */
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