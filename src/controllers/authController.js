/**
 * Authentication Controller
 * 
 * HTTP request handlers for authentication endpoints.
 * Delegates business logic to AuthService.
 */

const authService = require('../services/authService');

/**
 * Extract client IP address from request
 * Handles various proxy configurations
 * 
 * @param {Object} req - Express request object
 * @returns {string} - Client IP address or 'unknown'
 */
const getClientIp = (req) => {
  return req.ip || req.connection.remoteAddress || 'unknown';
};

/**
 * Handle user registration
 * POST /api/auth/register
 * 
 * @param {Object} req - Express request with registration data in body
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const register = async (req, res, next) => {
  try {
    const ip = getClientIp(req);
    const result = await authService.register(req.body, ip);
    
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle user login
 * POST /api/auth/login
 * 
 * @param {Object} req - Express request with email and password in body
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const ip = getClientIp(req);
    
    const result = await authService.login(email, password, ip);
    
    res.json({
      success: true,
      message: 'Login successful',
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle user logout
 * POST /api/auth/logout
 * Revokes the provided refresh token
 * 
 * @param {Object} req - Express request with refreshToken in body
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const ip = getClientIp(req);
    
    await authService.logout(refreshToken, ip);
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle token refresh
 * POST /api/auth/refresh
 * Issues new access and refresh tokens
 * 
 * @param {Object} req - Express request with refreshToken in body
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const ip = getClientIp(req);
    
    const result = await authService.refreshTokens(refreshToken, ip);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle revoke all sessions
 * POST /api/auth/revoke-all
 * Revokes all refresh tokens for the authenticated user
 * 
 * @param {Object} req - Express request with authenticated user
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const revokeAll = async (req, res, next) => {
  try {
    const ip = getClientIp(req);
    
    await authService.revokeAllSessions(req.user._id, ip);
    
    res.json({
      success: true,
      message: 'All sessions revoked'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  refresh,
  revokeAll
};
