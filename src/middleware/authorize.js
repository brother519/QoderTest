/**
 * Authorization Middleware
 * 
 * Role-Based Access Control (RBAC) middleware for protecting API routes.
 * Provides multiple authorization strategies:
 * - Role-based: Check if user has specific roles
 * - Permission-based: Check if user has specific permissions
 * - Ownership-based: Check if user owns the resource
 */

const { ERROR_CODES } = require('../utils/constants');

/**
 * Check if user has a specific permission
 * Supports wildcard matching for super admin and resource-level wildcards
 * 
 * @param {Array<string>} userPermissions - User's permission list
 * @param {string} requiredPermission - Permission to check (format: "resource:action")
 * @returns {boolean} - True if user has the permission
 */
const checkPermission = (userPermissions, requiredPermission) => {
  // Super admin has all permissions
  if (userPermissions.includes('*:*')) {
    return true;
  }
  
  // Direct permission match
  if (userPermissions.includes(requiredPermission)) {
    return true;
  }
  
  const [resource, action] = requiredPermission.split(':');
  
  // Resource-level wildcard (e.g., "users:*" matches "users:read")
  if (userPermissions.includes(`${resource}:*`)) {
    return true;
  }
  
  // Action-level wildcard (e.g., "*:read" matches "users:read")
  if (userPermissions.includes(`*:${action}`)) {
    return true;
  }
  
  return false;
};

/**
 * Authorization middleware factory object
 * Contains different authorization strategies
 */
const authorize = {
  /**
   * Role-based authorization middleware
   * Checks if user has at least one of the allowed roles
   * 
   * @param {Array<string>} allowedRoles - List of roles that can access the route
   * @returns {Function} - Express middleware function
   * 
   * @example
   * router.get('/admin', authenticate, authorize.roles(['admin']), handler);
   */
  roles: (allowedRoles) => {
    return (req, res, next) => {
      // Ensure user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Authentication required',
            code: ERROR_CODES.AUTHENTICATION_ERROR
          }
        });
      }
      
      // Extract role names from user object
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
  
  /**
   * Permission-based authorization middleware
   * Checks if user has ALL required permissions
   * 
   * @param {Array<string>} requiredPermissions - List of required permissions
   * @returns {Function} - Express middleware function
   * 
   * @example
   * router.delete('/users/:id', authenticate, authorize.permissions(['users:delete']), handler);
   */
  permissions: (requiredPermissions) => {
    return (req, res, next) => {
      // Ensure user is authenticated
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
      
      // User must have ALL required permissions
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
  
  /**
   * Ownership-based authorization middleware
   * Allows access only if user owns the resource (or is admin)
   * 
   * @param {string} paramName - Route parameter name containing resource ID
   * @returns {Function} - Express middleware function
   * 
   * @example
   * router.patch('/users/:id', authenticate, authorize.isOwner('id'), handler);
   */
  isOwner: (paramName = 'id') => {
    return (req, res, next) => {
      // Ensure user is authenticated
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
      
      // Allow if user is accessing their own resource
      if (resourceId !== userId) {
        // Allow admins to access any resource
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
  
  /**
   * Combined ownership and permission authorization middleware
   * Allows access if user owns the resource OR has required permissions
   * 
   * @param {string} paramName - Route parameter name containing resource ID
   * @param {Array<string>} requiredPermissions - Fallback permissions to check
   * @returns {Function} - Express middleware function
   * 
   * @example
   * router.get('/users/:id', authenticate, authorize.isOwnerOrHasPermission('id', ['users:read']), handler);
   */
  isOwnerOrHasPermission: (paramName, requiredPermissions) => {
    return (req, res, next) => {
      // Ensure user is authenticated
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
      
      // Allow if user owns the resource
      if (resourceId === userId) {
        return next();
      }
      
      // Check if user has at least one of the required permissions
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
