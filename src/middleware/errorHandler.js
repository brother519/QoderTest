/**
 * Error Handler Middleware
 * 
 * Global error handling for Express application.
 * Normalizes error responses and handles specific error types.
 */

const { ERROR_CODES } = require('../utils/constants');
const appConfig = require('../config/app');

/**
 * Global error handler middleware
 * Catches all errors thrown in routes and middleware
 * 
 * Handles:
 * - Mongoose ValidationError (400)
 * - Mongoose CastError (400)
 * - MongoDB duplicate key error (400)
 * - JWT errors (401)
 * - Custom application errors
 * 
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function (unused but required)
 */
const errorHandler = (err, req, res, next) => {
  // Default error values
  let statusCode = err.status || err.statusCode || 500;
  let errorCode = err.code || ERROR_CODES.INTERNAL_ERROR;
  let message = err.message || 'Internal server error';
  let details = null;
  
  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = ERROR_CODES.VALIDATION_ERROR;
    message = 'Validation failed';
    // Extract field-level error messages
    details = Object.keys(err.errors).reduce((acc, key) => {
      acc[key] = err.errors[key].message;
      return acc;
    }, {});
  }
  
  // Handle Mongoose cast errors (invalid ObjectId, etc.)
  if (err.name === 'CastError') {
    statusCode = 400;
    errorCode = ERROR_CODES.VALIDATION_ERROR;
    message = `Invalid ${err.path}: ${err.value}`;
  }
  
  // Handle MongoDB duplicate key errors
  if (err.code === 11000) {
    statusCode = 400;
    errorCode = ERROR_CODES.DUPLICATE_ERROR;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }
  
  // Handle JWT invalid signature/format errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorCode = ERROR_CODES.TOKEN_INVALID;
    message = 'Invalid token';
  }
  
  // Handle JWT expiration errors
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorCode = ERROR_CODES.TOKEN_EXPIRED;
    message = 'Token expired';
  }
  
  // Build response object
  const response = {
    success: false,
    error: {
      message,
      code: errorCode
    }
  };
  
  // Include validation details if present
  if (details) {
    response.error.details = details;
  }
  
  // Include stack trace in development mode only
  if (!appConfig.isProduction) {
    response.error.stack = err.stack;
  }
  
  // Log error for debugging
  console.error(`[Error] ${statusCode} - ${message}`, {
    code: errorCode,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  res.status(statusCode).json(response);
};

/**
 * 404 Not Found handler
 * Catches requests to undefined routes
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.path} not found`,
      code: ERROR_CODES.NOT_FOUND
    }
  });
};

module.exports = { errorHandler, notFoundHandler };
