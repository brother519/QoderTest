const { ERROR_CODES } = require('../utils/constants');

const checkPermission = (userPermissions, requiredPermission) => {
  if (userPermissions.includes('*:*')) {
    return true;
  }
  
  if (userPermissions.includes(requiredPermission)) {
    return true;
  }
  
  const [resource, action] = requiredPermission.split(':');
  
  if (userPermissions.includes(`${resource}:*`)) {
    return true;
  }
  
  if (userPermissions.includes(`*:${action}`)) {
    return true;
  }
  
  return false;
};

const authorize = {
  roles: (allowedRoles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Authentication required',
            code: ERROR_CODES.AUTHENTICATION_ERROR
          }
        });
      }
      
      const userRoles = req.user.roles.map(r => r.name || r);
      const hasRole = allowedRoles.some(role => userRoles.includes(role));
      
      if (!hasRole) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Insufficient permissions',
            code: ERROR_CODES.AUTHORIZATION_ERROR
          }
        });
      }
      
      next();
    };
  },
  
  permissions: (requiredPermissions) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Authentication required',
            code: ERROR_CODES.AUTHENTICATION_ERROR
          }
        });
      }
      
      const userPermissions = req.user.permissions || [];
      
      const hasAllPermissions = requiredPermissions.every(permission =>
        checkPermission(userPermissions, permission)
      );
      
      if (!hasAllPermissions) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Insufficient permissions',
            code: ERROR_CODES.AUTHORIZATION_ERROR
          }
        });
      }
      
      next();
    };
  },
  
  isOwner: (paramName = 'id') => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Authentication required',
            code: ERROR_CODES.AUTHENTICATION_ERROR
          }
        });
      }
      
      const resourceId = req.params[paramName];
      const userId = req.user._id.toString();
      
      if (resourceId !== userId) {
        const userRoles = req.user.roles.map(r => r.name || r);
        if (!userRoles.includes('admin')) {
          return res.status(403).json({
            success: false,
            error: {
              message: 'You can only access your own resources',
              code: ERROR_CODES.AUTHORIZATION_ERROR
            }
          });
        }
      }
      
      next();
    };
  },
  
  isOwnerOrHasPermission: (paramName, requiredPermissions) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Authentication required',
            code: ERROR_CODES.AUTHENTICATION_ERROR
          }
        });
      }
      
      const resourceId = req.params[paramName];
      const userId = req.user._id.toString();
      
      if (resourceId === userId) {
        return next();
      }
      
      const userPermissions = req.user.permissions || [];
      const hasPermission = requiredPermissions.some(permission =>
        checkPermission(userPermissions, permission)
      );
      
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Insufficient permissions',
            code: ERROR_CODES.AUTHORIZATION_ERROR
          }
        });
      }
      
      next();
    };
  }
};

module.exports = authorize;
