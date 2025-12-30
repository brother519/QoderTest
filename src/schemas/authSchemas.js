/**
 * Authentication Validation Schemas
 * 
 * Express-validator schemas for validating authentication-related requests.
 * Used with the validate middleware.
 */

const { body } = require('express-validator');
const { PASSWORD_REGEX } = require('../utils/constants');

/**
 * Registration request validation schema
 * Validates: email, username, password, confirmPassword, securityQuestions
 */
const registerSchema = [
  // Email validation and normalization
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  // Username format and length validation
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  // Password strength validation
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(PASSWORD_REGEX)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  // Confirm password matches
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  
  // Optional security questions (minimum 2 if provided)
  body('securityQuestions')
    .optional()
    .isArray({ min: 2 })
    .withMessage('At least 2 security questions are required'),
  
  // Security question text validation
  body('securityQuestions.*.question')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Security question cannot be empty'),
  
  // Security answer validation
  body('securityQuestions.*.answer')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Security answer cannot be empty')
];

/**
 * Login request validation schema
 * Validates: email, password
 */
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

/**
 * Token refresh request validation schema
 * Validates: refreshToken
 */
const refreshTokenSchema = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
];

/**
 * Logout request validation schema
 * Validates: refreshToken (optional)
 */
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
