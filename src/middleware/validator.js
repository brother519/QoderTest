/**
 * @file 请求验证中间件
 * @description 使用express-validator进行请求数据验证
 */
const { validationResult } = require('express-validator');
const { ERROR_CODES } = require('../utils/constants');

/**
 * 创建验证中间件
 * @param {Array} validations - express-validator验证规则数组
 * @returns {Function} Express中间件函数
 */
const validate = (validations) => {
  return async (req, res, next) => {
    for (const validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }
    
    const errors = validationResult(req);
    
    if (errors.isEmpty()) {
      return next();
    }
    
    const formattedErrors = errors.array().reduce((acc, error) => {
      acc[error.path] = error.msg;
      return acc;
    }, {});
    
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: ERROR_CODES.VALIDATION_ERROR,
        details: formattedErrors
      }
    });
  };
};

module.exports = { validate };