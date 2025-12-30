/**
 * @file 认证验证模式
 * @description 定义认证相关请求的验证规则
 */
const { body } = require('express-validator');
const { PASSWORD_REGEX } = require('../utils/constants');

/** 用户注册验证规则 */
const registerSchema = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(PASSWORD_REGEX)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  
  body('securityQuestions')
    .optional()
    .isArray({ min: 2 })
    .withMessage('At least 2 security questions are required'),
  
  body('securityQuestions.*.question')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Security question cannot be empty'),
  
  body('securityQuestions.*.answer')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Security answer cannot be empty')
];

/** 用户登录验证规则 */
const loginSchema = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

/** 刷新令牌验证规则 */
const refreshTokenSchema = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
];

/** 登出验证规则 */
const logoutSchema = [
  body('refreshToken')
    .optional()
    .isString()
    .withMessage('Refresh token must be a string')
];

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema
};