const User = require('../models/User');
const tokenService = require('../services/tokenService');
const { ERROR_CODES } = require('../utils/constants');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Access token required',
          code: ERROR_CODES.AUTHENTICATION_ERROR
        }
      });
    }
    
    const token = authHeader.split(' ')[1];
    
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
    
    const user = await User.findById(decoded.sub).populate({
      path: 'roles',
      populate: {
        path: 'permissions'
      }
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'User not found',
          code: ERROR_CODES.AUTHENTICATION_ERROR
        }
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Account is deactivated',
          code: ERROR_CODES.AUTHENTICATION_ERROR
        }
      });
    }
    
    const permissions = new Set();
    for (const role of user.roles) {
      for (const permission of role.permissions) {
        permissions.add(permission.name);
      }
    }
    
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

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  
  const token = authHeader.split(' ')[1];
  const decoded = tokenService.verifyAccessToken(token);
  
  if (decoded) {
    const user = await User.findById(decoded.sub).populate({
      path: 'roles',
      populate: {
        path: 'permissions'
      }
    });
    
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
