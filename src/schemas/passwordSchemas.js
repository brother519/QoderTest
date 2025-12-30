/**
 * @file 密码验证模式
 * @description 定义密码相关请求的验证规则
 */
const { body } = require('express-validator');
const { PASSWORD_REGEX } = require('../utils/constants');

/** 设置安全问题验证规则 */
const setSecurityQuestionsSchema = [
  body('questions')
    .isArray({ min: 2 })
    .withMessage('At least 2 security questions are required'),
  
  body('questions.*.question')
    .trim()
    .notEmpty()
    .withMessage('Security question cannot be empty'),
  
  body('questions.*.answer')
    .trim()
    .notEmpty()
    .withMessage('Security answer cannot be empty')
];

/** 验证安全问题答案验证规则 */
const verifySecurityQuestionsSchema = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('answers')
    .isArray({ min: 1 })
    .withMessage('At least 1 answer is required'),
  
  body('answers.*.question')
    .trim()
    .notEmpty()
    .withMessage('Question cannot be empty'),
  
  body('answers.*.answer')
    .trim()
    .notEmpty()
    .withMessage('Answer cannot be empty')
];

/** 重置密码验证规则 */
const resetPasswordSchema = [
  body('resetToken')
    .notEmpty()
    .withMessage('Reset token is required'),
  
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(PASSWORD_REGEX)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

/** 修改密码验证规则 */
const changePasswordSchema = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(PASSWORD_REGEX)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

module.exports = {
  setSecurityQuestionsSchema,
  verifySecurityQuestionsSchema,
  resetPasswordSchema,
  changePasswordSchema
};