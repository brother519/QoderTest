/**
 * @file 用户验证模式
 * @description 定义用户相关请求的验证规则
 */
const { body, param, query } = require('express-validator');

/** 更新用户信息验证规则 */
const updateUserSchema = [
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores')
];

/** 用户ID参数验证规则 */
const userIdSchema = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID')
];

/** 用户列表查询参数验证规则 */
const userListSchema = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
  
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query cannot exceed 100 characters')
];

module.exports = {
  updateUserSchema,
  userIdSchema,
  userListSchema
};