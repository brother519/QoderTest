/**
 * Token Service
 * 
 * JWT token generation and verification utilities.
 * Handles access tokens for API authentication and
 * reset tokens for password recovery.
 */

const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

/**
 * Generate a JWT access token for authenticated user
 * Token contains user ID, email, and role names
 * 
 * @param {Object} user - User object from database
 * @param {string} user._id - User's MongoDB ObjectId
 * @param {string} user.email - User's email address
 * @param {Array} user.roles - User's roles (objects or strings)
 * @returns {string} - Signed JWT access token
 */
const generateAccessToken = (user) => {
  const payload = {
    sub: user._id.toString(),       // Subject (user ID)
    email: user.email,               // User email for quick access
    roles: user.roles?.map(r => r.name || r) || []  // Role names
  };
  
  return jwt.sign(payload, jwtConfig.accessToken.secret, {
    expiresIn: jwtConfig.accessToken.expiresIn  // Default: 15 minutes
  });
};

/**
 * Verify and decode a JWT access token
 * Returns null if token is invalid or expired
 * 
 * @param {string} token - JWT access token to verify
 * @returns {Object|null} - Decoded token payload or null if invalid
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.accessToken.secret);
  } catch (error) {
    return null;
  }
};

/**
 * Generate a short-lived reset token for password recovery
 * Token is valid for 5 minutes and marked with 'reset' type
 * 
 * @param {string} userId - User ID requesting password reset
 * @returns {string} - Signed JWT reset token
 */
const generateResetToken = (userId) => {
  const payload = {
    sub: userId.toString(),
    type: 'reset'  // Token type identifier
  };
  
  return jwt.sign(payload, jwtConfig.accessToken.secret, {
    expiresIn: '5m'  // 5 minute validity
  });
};

/**
 * Verify and decode a password reset token
 * Checks that token is valid and has 'reset' type
 * 
 * @param {string} token - Reset token to verify
 * @returns {Object|null} - Decoded token payload or null if invalid
 */
const verifyResetToken = (token) => {
  try {
    const decoded = jwt.verify(token, jwtConfig.accessToken.secret);
    // Ensure this is a reset token, not an access token
    if (decoded.type !== 'reset') {
      return null;
    }
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Decode a JWT token without verification
 * Useful for debugging or extracting claims from expired tokens
 * 
 * @param {string} token - JWT token to decode
 * @returns {Object|null} - Decoded token payload or null if malformed
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  verifyAccessToken,
  generateResetToken,
  verifyResetToken,
  decodeToken
};
