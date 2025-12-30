/**
 * Authentication Middleware
 * 
 * JWT token verification middleware for protecting API routes.
 * Extracts and validates Bearer tokens from Authorization header.
 * Loads user data and permissions into request object.
 */

const User = require('../models/User');
const tokenService = require('../services/tokenService');
const { ERROR_CODES } = require('../utils/constants');

/**
 * Required authentication middleware
 * Verifies JWT access token and loads user with permissions
 * Returns 401 if token is missing, invalid, or expired
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authenticate = async (req, res, next) => {
  try {
    // Extract Authorization header
    const authHeader = req.headers.authorization;
    
    // Check for Bearer token format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Access token required',
          code: ERROR_CODES.AUTHENTICATION_ERROR
        }
      });
    }
    
    // Extract token from header
    const token = authHeader.split(' ')[1];
    
    // Verify token signature and expiration
    const decoded = tokenService.verifyAccessToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid or expired access token',
          code: ERROR_CODES.TOKEN_INVALID
        }
      });
    }
    
    // Load user with roles and permissions
    const user = await User.findById(decoded.sub).populate({
      path: 'roles',
      populate: {
        path: 'permissions'
      }
    });
    
    // Verify user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'User not found',
          code: ERROR_CODES.AUTHENTICATION_ERROR
        }
      });
    }
    
    // Verify account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Account is deactivated',
          code: ERROR_CODES.AUTHENTICATION_ERROR
        }
      });
    }
    
    // Aggregate all permissions from user's roles
    const permissions = new Set();
    for (const role of user.roles) {
      for (const permission of role.permissions) {
        permissions.add(permission.name);
      }
    }
    
    // Attach user and permissions to request object
    req.user = user;
    req.user.permissions = Array.from(permissions);
    
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        message: 'Authentication failed',
        code: ERROR_CODES.INTERNAL_ERROR
      }
    });
  }
};

/**
 * Optional authentication middleware
 * Attempts to authenticate user if token provided, but allows
 * unauthenticated requests to proceed. Useful for routes that
 * behave differently for authenticated vs anonymous users.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  // If no token, continue without authentication
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  
  // Extract and verify token
  const token = authHeader.split(' ')[1];
  const decoded = tokenService.verifyAccessToken(token);
  
  // If valid token, load user
  if (decoded) {
    const user = await User.findById(decoded.sub).populate({
      path: 'roles',
      populate: {
        path: 'permissions'
      }
    });
    
    // Only attach user if active
    if (user && user.isActive) {
      const permissions = new Set();
      for (const role of user.roles) {
        for (const permission of role.permissions) {
          permissions.add(permission.name);
        }
      }
      
      req.user = user;
      req.user.permissions = Array.from(permissions);
    }
  }
  
  next();
};

module.exports = { authenticate, optionalAuth };
