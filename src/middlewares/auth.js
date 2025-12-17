const { verifyAccessToken } = require('../services/tokenService');
const { User } = require('../models');
const { AuthenticationError, AuthorizationError } = require('../utils/errors');

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }
    
    const token = authHeader.substring(7);
    const verification = verifyAccessToken(token);
    
    if (!verification.valid) {
      throw new AuthenticationError('Invalid or expired token');
    }
    
    const user = await User.findByPk(verification.payload.userId);
    
    if (!user || !user.is_active) {
      throw new AuthenticationError('User not found or inactive');
    }
    
    req.user = user.toSafeObject();
    req.userId = user.id;
    
    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      next(error);
    } else {
      next(new AuthenticationError('Authentication failed'));
    }
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('Not authenticated'));
    }
    
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AuthorizationError('Insufficient permissions'));
    }
    
    next();
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    
    const token = authHeader.substring(7);
    const verification = verifyAccessToken(token);
    
    if (verification.valid) {
      const user = await User.findByPk(verification.payload.userId);
      if (user && user.is_active) {
        req.user = user.toSafeObject();
        req.userId = user.id;
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  requireAuth,
  requireRole,
  optionalAuth
};
