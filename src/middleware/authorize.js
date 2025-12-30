/**
 * @file 授权中间件
 * @description 处理用户权限和角色验证
 */
const { ERROR_CODES } = require('../utils/constants');

/**
 * 检查用户是否拥有指定权限
 * @param {string[]} userPermissions - 用户权限列表
 * @param {string} requiredPermission - 所需权限
 * @returns {boolean} 是否拥有权限
 */
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

/**
 * 授权中间件工厂对象
 * @type {Object}
 */
const authorize = {
  /**
   * 验证用户是否拥有指定角色
   * @param {string[]} allowedRoles - 允许的角色列表
   * @returns {Function} Express中间件函数
   */
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
  
  /**
   * 验证用户是否拥有指定权限
   * @param {string[]} requiredPermissions - 所需权限列表
   * @returns {Function} Express中间件函数
   */
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
  
  /**
   * 验证用户是否为资源所有者
   * @param {string} [paramName='id'] - 路由参数名
   * @returns {Function} Express中间件函数
   */
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
  
  /**
   * 验证用户是资源所有者或拥有指定权限
   * @param {string} paramName - 路由参数名
   * @param {string[]} requiredPermissions - 所需权限列表
   * @returns {Function} Express中间件函数
   */
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