const tokenService = require('../services/tokenService');
const { UnauthorizedError } = require('../utils/errors');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('No token provided'));
  }
  
  const token = authHeader.split(' ')[1];
  const decoded = tokenService.verifyAccessToken(token);
  
  if (!decoded) {
    return next(new UnauthorizedError('Invalid or expired token'));
  }
  
  req.user = decoded;
  next();
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new UnauthorizedError('Insufficient permissions'));
    }
    next();
  };
};

module.exports = {
  authenticate,
  requireRole
};
