const { validationResult } = require('express-validator');
const { ERROR_CODES } = require('../utils/constants');

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
