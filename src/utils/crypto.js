/**
 * @file 加密工具模块
 * @description 提供密码哈希、令牌生成等加密功能
 */
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwtConfig = require('../config/jwt');
const appConfig = require('../config/app');

/**
 * 对密码进行哈希处理
 * @async
 * @param {string} password - 原始密码
 * @returns {Promise<string>} 哈希后的密码
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(appConfig.bcryptRounds);
  return bcrypt.hash(password, salt);
};

/**
 * 比较密码与哈希值
 * @async
 * @param {string} password - 原始密码
 * @param {string} hashedPassword - 哈希后的密码
 * @returns {Promise<boolean>} 是否匹配
 */
const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * 对安全问题答案进行哈希处理
 * @param {string} answer - 原始答案
 * @returns {string} 哈希后的答案
 */
const hashSecurityAnswer = (answer) => {
  const normalizedAnswer = answer.trim().toLowerCase();
  return crypto
    .createHmac('sha256', jwtConfig.securityAnswerSecret)
    .update(normalizedAnswer)
    .digest('hex');
};

/**
 * 验证安全问题答案
 * @param {string} answer - 用户输入的答案
 * @param {string} hashedAnswer - 存储的哈希答案
 * @returns {boolean} 是否匹配
 */
const verifySecurityAnswer = (answer, hashedAnswer) => {
  const hashedInput = hashSecurityAnswer(answer);
  return hashedInput === hashedAnswer;
};

/**
 * 对令牌进行哈希处理
 * @param {string} token - 原始令牌
 * @returns {string} 哈希后的令牌
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * 生成随机令牌
 * @param {number} [bytes=32] - 字节数
 * @returns {string} 十六进制随机字符串
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