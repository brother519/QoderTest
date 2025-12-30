/**
 * Cryptographic Utilities
 * 
 * Security-related functions for password hashing, token generation,
 * and security question answer encryption.
 */

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwtConfig = require('../config/jwt');
const appConfig = require('../config/app');

/**
 * Hash a plain text password using bcrypt
 * Uses configurable salt rounds for security/performance balance
 * 
 * @param {string} password - Plain text password to hash
 * @returns {Promise<string>} - Bcrypt hash of the password
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(appConfig.bcryptRounds);
  return bcrypt.hash(password, salt);
};

/**
 * Compare a plain text password against a bcrypt hash
 * 
 * @param {string} password - Plain text password to verify
 * @param {string} hashedPassword - Bcrypt hash to compare against
 * @returns {Promise<boolean>} - True if password matches
 */
const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * Hash a security question answer using HMAC-SHA256
 * Normalizes input (lowercase, trimmed) before hashing
 * Uses a secret key for added security
 * 
 * @param {string} answer - Security question answer to hash
 * @returns {string} - 64-character hex string (SHA256 output)
 */
const hashSecurityAnswer = (answer) => {
  // Normalize: trim whitespace and convert to lowercase
  const normalizedAnswer = answer.trim().toLowerCase();
  return crypto
    .createHmac('sha256', jwtConfig.securityAnswerSecret)
    .update(normalizedAnswer)
    .digest('hex');
};

/**
 * Verify a security question answer against stored hash
 * 
 * @param {string} answer - Plain text answer to verify
 * @param {string} hashedAnswer - Stored hash to compare against
 * @returns {boolean} - True if answer matches
 */
const verifySecurityAnswer = (answer, hashedAnswer) => {
  const hashedInput = hashSecurityAnswer(answer);
  return hashedInput === hashedAnswer;
};

/**
 * Hash a token using SHA256
 * Used for storing refresh tokens securely
 * 
 * @param {string} token - Token to hash
 * @returns {string} - 64-character hex string (SHA256 output)
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Generate a cryptographically secure random token
 * 
 * @param {number} bytes - Number of random bytes (default: 32)
 * @returns {string} - Hex-encoded random string (2 chars per byte)
 */
const generateRandomToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

module.exports = {
  hashPassword,
  comparePassword,
  hashSecurityAnswer,
  verifySecurityAnswer,
  hashToken,
  generateRandomToken
};
