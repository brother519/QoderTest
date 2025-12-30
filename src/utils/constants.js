/**
 * Application Constants
 * 
 * Centralized configuration values and enumerations
 * used throughout the application.
 */

module.exports = {
  /**
   * Predefined role names for RBAC
   */
  ROLES: {
    ADMIN: 'admin',           // Full system access
    USER: 'user',             // Standard user access
    MODERATOR: 'moderator'    // Limited admin capabilities
  },
  
  /**
   * Predefined permission strings
   * Format: resource:action
   */
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
  
  /**
   * Standardized error codes for API responses
   * Used for client-side error handling
   */
  ERROR_CODES: {
    VALIDATION_ERROR: 'VALIDATION_ERROR',         // Invalid input data
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR', // Login failed
    AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',   // Permission denied
    NOT_FOUND: 'NOT_FOUND',                       // Resource not found
    DUPLICATE_ERROR: 'DUPLICATE_ERROR',           // Unique constraint violation
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',               // JWT expired
    TOKEN_INVALID: 'TOKEN_INVALID',               // JWT invalid/malformed
    ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',             // Too many failed attempts
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',   // Too many requests
    INTERNAL_ERROR: 'INTERNAL_ERROR'              // Server error
  },
  
  /**
   * Password strength regex pattern
   * Requires:
   * - At least 8 characters
   * - At least one lowercase letter
   * - At least one uppercase letter
   * - At least one digit
   * - At least one special character (!@#$%^&*)
   */
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
  
  /**
   * Token type identifiers
   */
  TOKEN_TYPES: {
    ACCESS: 'access',     // Short-lived API access token
    REFRESH: 'refresh',   // Long-lived refresh token
    RESET: 'reset'        // Password reset token
  },
  
  /**
   * Account lock duration in milliseconds
   * Default: 15 minutes
   */
  LOCK_TIME: 15 * 60 * 1000,
  
  /**
   * Maximum failed login attempts before account lock
   * Default: 5 attempts
   */
  MAX_LOGIN_ATTEMPTS: 5
};
