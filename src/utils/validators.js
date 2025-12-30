/**
 * Validation Utilities
 * 
 * Helper functions for validating and sanitizing data.
 */

const { PASSWORD_REGEX } = require('./constants');

/**
 * Validate email format
 * 
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * Checks for minimum 8 chars, uppercase, lowercase, number, and special char
 * 
 * @param {string} password - Password to validate
 * @returns {boolean} - True if meets strength requirements
 */
const isValidPassword = (password) => {
  return PASSWORD_REGEX.test(password);
};

/**
 * Validate username format
 * Allows letters, numbers, underscores, 3-30 characters
 * 
 * @param {string} username - Username to validate
 * @returns {boolean} - True if valid format
 */
const isValidUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(username);
};

/**
 * Remove sensitive fields from user object
 * Safe for sending in API responses
 * 
 * @param {Object} user - Mongoose user document or plain object
 * @returns {Object} - User object without sensitive fields
 */
const sanitizeUser = (user) => {
  // Convert Mongoose document to plain object if needed
  const userObj = user.toObject ? user.toObject() : { ...user };
  
  // Remove sensitive fields
  delete userObj.password;
  delete userObj.securityQuestions;
  delete userObj.__v;
  
  return userObj;
};

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidUsername,
  sanitizeUser
};
