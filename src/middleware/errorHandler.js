/**
 * @file 错误处理中间件
 * @description 统一处理应用程序错误
 */
const { ERROR_CODES } = require('../utils/constants');
const appConfig = require('../config/app');

/**
 * 全局错误处理中间件
 * @param {Error} err - 错误对象
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - 下一个中间件函数
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.status || err.statusCode || 500;
  let errorCode = err.code || ERROR_CODES.INTERNAL_ERROR;
  let message = err.message || 'Internal server error';
  let details = null;
  
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = ERROR_CODES.VALIDATION_ERROR;
    message = 'Validation failed';
    details = Object.keys(err.errors).reduce((acc, key) => {
      acc[key] = err.errors[key].message;
      return acc;
    }, {});
  }
  
  if (err.name === 'CastError') {
    statusCode = 400;
    errorCode = ERROR_CODES.VALIDATION_ERROR;
    message = `Invalid ${err.path}: ${err.value}`;
  }
  
  if (err.code === 11000) {
    statusCode = 400;
    errorCode = ERROR_CODES.DUPLICATE_ERROR;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }
  
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorCode = ERROR_CODES.TOKEN_INVALID;
    message = 'Invalid token';
  }
  
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorCode = ERROR_CODES.TOKEN_EXPIRED;
    message = 'Token expired';
  }
  
  const response = {
    success: false,
    error: {
      message,
      code: errorCode
    }
  };
  
  if (details) {
    response.error.details = details;
  }
  
  if (!appConfig.isProduction) {
    response.error.stack = err.stack;
  }
  
  console.error(`[Error] ${statusCode} - ${message}`, {
    code: errorCode,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  res.status(statusCode).json(response);
};

/**
 * 404路由未找到处理中间件
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.path} not found`,
      code: ERROR_CODES.NOT_FOUND
    }
  });
};

module.exports = { errorHandler, notFoundHandler };