/**
 * @file 常量定义模块
 * @description 定义系统中使用的常量
 */

/**
 * 系统常量
 * @type {Object}
 */
module.exports = {
  /** 角色常量 */
  ROLES: {
    ADMIN: 'admin',
    USER: 'user',
    MODERATOR: 'moderator'
  },
  
  /** 权限常量 */
  PERMISSIONS: {
    USERS_CREATE: 'users:create',
    USERS_READ: 'users:read',
    USERS_UPDATE: 'users:update',
    USERS_DELETE: 'users:delete',
    ROLES_CREATE: 'roles:create',
    ROLES_READ: 'roles:read',
    ROLES_UPDATE: 'roles:update',
    ROLES_DELETE: 'roles:delete',
    ROLES_ASSIGN: 'roles:assign'
  },
  
  /** 错误代码常量 */
  ERROR_CODES: {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    DUPLICATE_ERROR: 'DUPLICATE_ERROR',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    TOKEN_INVALID: 'TOKEN_INVALID',
    ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    INTERNAL_ERROR: 'INTERNAL_ERROR'
  },
  
  /** 密码验证正则表达式 */
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
  
  /** 令牌类型常量 */
  TOKEN_TYPES: {
    ACCESS: 'access',
    REFRESH: 'refresh',
    RESET: 'reset'
  },
  
  /** 账户锁定时间(毫秒) */
  LOCK_TIME: 15 * 60 * 1000,
  /** 最大登录尝试次数 */
  MAX_LOGIN_ATTEMPTS: 5
};