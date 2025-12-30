/**
 * Validation Middleware
 * 
 * Express middleware for running express-validator validation chains.
 * Returns 400 Bad Request with detailed errors if validation fails.
 */

const { validationResult } = require('express-validator');
const { ERROR_CODES } = require('../utils/constants');

/**
 * Create validation middleware from an array of validation chains
 * 
 * @param {Array} validations - Array of express-validator validation chains
 * @returns {Function} - Express middleware function
 * 
 * @example
 * router.post('/register', validate(registerSchema), controller.register);
 */
const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    for (const validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;  // Stop on first error
    }
    
    // Check for validation errors
    const errors = validationResult(req);
    
    if (errors.isEmpty()) {
      return next();
    }
    
    // Format errors as { field: message } object
    const formattedErrors = errors.array().reduce((acc, error) => {
      acc[error.path] = error.msg;
      return acc;
    }, {});
    
    // Return 400 with validation details
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
