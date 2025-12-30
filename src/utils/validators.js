/**
 * @file 验证工具模块
 * @description 提供数据验证和清理功能
 */
const { PASSWORD_REGEX } = require('./constants');

/**
 * 验证邮箱格式
 * @param {string} email - 邮箱地址
 * @returns {boolean} 是否有效
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 验证密码格式
 * @param {string} password - 密码
 * @returns {boolean} 是否有效
 */
const isValidPassword = (password) => {
  return PASSWORD_REGEX.test(password);
};

/**
 * 验证用户名格式
 * @param {string} username - 用户名
 * @returns {boolean} 是否有效
 */
const isValidUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(username);
};

/**
 * 清理用户对象，移除敏感信息
 * @param {Object} user - 用户对象
 * @returns {Object} 清理后的用户对象
 */
const sanitizeUser = (user) => {
  const userObj = user.toObject ? user.toObject() : { ...user };
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