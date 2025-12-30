/**
 * User Validation Schemas
 * 
 * Express-validator schemas for validating user-related requests.
 */

const { body, param, query } = require('express-validator');

/**
 * Update user profile validation schema
 * All fields optional - only validates if provided
 */
const updateUserSchema = [
  // Optional email update with validation
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  // Optional username update with format validation
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores')
];

/**
 * User ID parameter validation schema
 * Validates MongoDB ObjectId format
 */
const userIdSchema = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID')
];

/**
 * User list query parameters validation schema
 * Validates pagination and search parameters
 */
const userListSchema = [
  // Page number (default: 1)
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  
  // Items per page (1-100)
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
  
  // Search term for filtering
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
