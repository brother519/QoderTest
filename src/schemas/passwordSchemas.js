const { body } = require('express-validator');
const { PASSWORD_REGEX } = require('../utils/constants');

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
