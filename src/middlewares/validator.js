const { body, validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');

const validateRegistration = [
  body('email')
    .trim()
    .isEmail().withMessage('Invalid email format')
    .isLength({ max: 255 }).withMessage('Email must not exceed 255 characters')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8, max: 128 }).withMessage('Password must be between 8 and 128 characters')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),
  
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 }).withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Username can only contain letters, numbers, underscores and hyphens')
];

const validateLogin = [
  body('email')
    .trim()
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
];

const validate2FAToken = [
  body('token')
    .trim()
    .isLength({ min: 6, max: 6 }).withMessage('Token must be 6 digits')
    .matches(/^[0-9]{6}$/).withMessage('Token must contain only digits')
];

const validatePasswordChange = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 8, max: 128 }).withMessage('New password must be between 8 and 128 characters')
    .matches(/[a-z]/).withMessage('New password must contain at least one lowercase letter')
    .matches(/[A-Z]/).withMessage('New password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('New password must contain at least one number')
];

const validateProfileUpdate = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 }).withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Username can only contain letters, numbers, underscores and hyphens')
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const details = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg
    }));
    
    throw new ValidationError('Validation failed', details);
  }
  
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validate2FAToken,
  validatePasswordChange,
  validateProfileUpdate,
  handleValidationErrors
};
