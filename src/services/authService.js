/**
 * Authentication Service
 * 
 * Core business logic for user authentication operations including:
 * - User registration with optional security questions
 * - Login with account locking protection
 * - Logout and token revocation
 * - Token refresh with rotation mechanism
 */

const User = require('../models/User');
const Role = require('../models/Role');
const RefreshToken = require('../models/RefreshToken');
const tokenService = require('./tokenService');
const { sanitizeUser } = require('../utils/validators');
const { ERROR_CODES, ROLES } = require('../utils/constants');

class AuthService {
  /**
   * Register a new user account
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User's email address
   * @param {string} userData.username - Desired username
   * @param {string} userData.password - Plain text password
   * @param {Array} userData.securityQuestions - Optional security questions
   * @param {string} ip - Client IP address for token tracking
   * @returns {Promise<Object>} - User data with access and refresh tokens
   * @throws {Error} - If email or username already exists
   */
  async register(userData, ip) {
    const { email, username, password, securityQuestions } = userData;
    
    // Check for existing user with same email or username
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });
    
    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      const error = new Error(`${field === 'email' ? 'Email' : 'Username'} already exists`);
      error.code = ERROR_CODES.DUPLICATE_ERROR;
      error.status = 400;
      throw error;
    }
    
    // Assign default user role
    const userRole = await Role.findOne({ name: ROLES.USER });
    
    // Create new user document
    const user = new User({
      email,
      username,
      password,
      roles: userRole ? [userRole._id] : []
    });
    
    // Set security questions if provided (minimum 2 required)
    if (securityQuestions && securityQuestions.length >= 2) {
      user.setSecurityQuestions(securityQuestions);
    }
    
    await user.save();
    
    // Generate authentication tokens
    const accessToken = tokenService.generateAccessToken(user);
    const refreshToken = await RefreshToken.createToken(user._id, ip);
    
    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken
    };
  }
  
  /**
   * Authenticate user with email and password
   * @param {string} email - User's email address
   * @param {string} password - Plain text password
   * @param {string} ip - Client IP address for token tracking
   * @returns {Promise<Object>} - User data with access and refresh tokens
   * @throws {Error} - If credentials invalid, account locked, or deactivated
   */
  async login(email, password, ip) {
    // Find user and include password field for verification
    const user = await User.findOne({ email })
      .select('+password')
      .populate('roles');
    
    // Return generic error to prevent user enumeration
    if (!user) {
      const error = new Error('Invalid email or password');
      error.code = ERROR_CODES.AUTHENTICATION_ERROR;
      error.status = 401;
      throw error;
    }
    
    // Check if account is active
    if (!user.isActive) {
      const error = new Error('Account is deactivated');
      error.code = ERROR_CODES.AUTHENTICATION_ERROR;
      error.status = 401;
      throw error;
    }
    
    // Check if account is locked due to failed attempts
    if (user.isAccountLocked) {
      const error = new Error('Account is locked. Please try again later');
      error.code = ERROR_CODES.ACCOUNT_LOCKED;
      error.status = 423;
      throw error;
    }
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      // Increment failed login attempts
      await user.incLoginAttempts();
      const error = new Error('Invalid email or password');
      error.code = ERROR_CODES.AUTHENTICATION_ERROR;
      error.status = 401;
      throw error;
    }
    
    // Reset login attempts on successful login
    await user.resetLoginAttempts();
    user.lastLogin = new Date();
    await user.save();
    
    // Generate authentication tokens
    const accessToken = tokenService.generateAccessToken(user);
    const refreshToken = await RefreshToken.createToken(user._id, ip);
    
    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken
    };
  }
  
  /**
   * Logout user by revoking refresh token
   * @param {string} refreshToken - Refresh token to revoke
   * @param {string} ip - Client IP address for audit
   * @returns {Promise<Object>} - Success status
   */
  async logout(refreshToken, ip) {
    if (!refreshToken) {
      return { success: true };
    }
    
    await RefreshToken.revokeToken(refreshToken, ip);
    return { success: true };
  }
  
  /**
   * Refresh access token using valid refresh token
   * Implements token rotation for security
   * @param {string} oldRefreshToken - Current refresh token
   * @param {string} ip - Client IP address for tracking
   * @returns {Promise<Object>} - New access and refresh tokens
   * @throws {Error} - If token invalid, expired, or reused
   */
  async refreshTokens(oldRefreshToken, ip) {
    // Find refresh token in database
    const tokenDoc = await RefreshToken.findByToken(oldRefreshToken);
    
    if (!tokenDoc) {
      const error = new Error('Invalid refresh token');
      error.code = ERROR_CODES.TOKEN_INVALID;
      error.status = 401;
      throw error;
    }
    
    // Detect token reuse attack - revoke all user tokens
    if (tokenDoc.isRevoked) {
      await RefreshToken.revokeAllUserTokens(tokenDoc.user, ip);
      const error = new Error('Token reuse detected. All sessions revoked');
      error.code = ERROR_CODES.TOKEN_INVALID;
      error.status = 401;
      throw error;
    }
    
    // Check if token has expired
    if (tokenDoc.isExpired) {
      const error = new Error('Refresh token expired');
      error.code = ERROR_CODES.TOKEN_EXPIRED;
      error.status = 401;
      throw error;
    }
    
    // Verify user still exists and is active
    const user = await User.findById(tokenDoc.user).populate('roles');
    
    if (!user || !user.isActive) {
      const error = new Error('User not found or deactivated');
      error.code = ERROR_CODES.AUTHENTICATION_ERROR;
      error.status = 401;
      throw error;
    }
    
    // Token rotation: create new token and revoke old one
    const newRefreshToken = await RefreshToken.createToken(user._id, ip);
    await RefreshToken.revokeToken(oldRefreshToken, ip, newRefreshToken);
    
    // Generate new access token
    const accessToken = tokenService.generateAccessToken(user);
    
    return {
      accessToken,
      refreshToken: newRefreshToken
    };
  }
  
  /**
   * Revoke all refresh tokens for a user (force logout all devices)
   * @param {string} userId - User ID to revoke tokens for
   * @param {string} ip - Client IP address for audit
   * @returns {Promise<Object>} - Success status
   */
  async revokeAllSessions(userId, ip) {
    await RefreshToken.revokeAllUserTokens(userId, ip);
    return { success: true };
  }
}

module.exports = new AuthService();
