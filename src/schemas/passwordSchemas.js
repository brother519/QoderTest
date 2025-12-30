/**
 * Password Validation Schemas
 * 
 * Express-validator schemas for validating password-related requests.
 */

const { body } = require('express-validator');
const { PASSWORD_REGEX } = require('../utils/constants');

/**
 * Set security questions validation schema
 * Requires minimum 2 questions with answers
 */
const setSecurityQuestionsSchema = [
  // Questions array with minimum 2 items
  body('questions')
    .isArray({ min: 2 })
    .withMessage('At least 2 security questions are required'),
  
  // Each question must have text
  body('questions.*.question')
    .trim()
    .notEmpty()
    .withMessage('Security question cannot be empty'),
  
  // Each answer must have text
  body('questions.*.answer')
    .trim()
    .notEmpty()
    .withMessage('Security answer cannot be empty')
];

/**
 * Verify security questions validation schema
 * Used for password reset flow
 */
const verifySecurityQuestionsSchema = [
  // User's email address
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  // Array of question/answer pairs
  body('answers')
    .isArray({ min: 1 })
    .withMessage('At least 1 answer is required'),
  
  // Question text for matching
  body('answers.*.question')
    .trim()
    .notEmpty()
    .withMessage('Question cannot be empty'),
  
  // Answer text for verification
  body('answers.*.answer')
    .trim()
    .notEmpty()
    .withMessage('Answer cannot be empty')
];

/**
 * Reset password validation schema
 * Used after security questions are verified
 */
const resetPasswordSchema = [
  // Reset token from verify step
  body('resetToken')
    .notEmpty()
    .withMessage('Reset token is required'),
  
  // New password with strength requirements
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(PASSWORD_REGEX)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  // Confirm password matches
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

/**
 * Change password validation schema
 * For authenticated users changing their password
 */
const changePasswordSchema = [
  // Current password for verification
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  // New password with strength requirements
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(PASSWORD_REGEX)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  // Confirm password matches
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
