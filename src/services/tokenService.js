/**
 * @file 令牌服务
 * @description JWT令牌的生成和验证
 */
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

/**
 * 生成访问令牌
 * @param {Object} user - 用户对象
 * @returns {string} JWT访问令牌
 */
const generateAccessToken = (user) => {
  const payload = {
    sub: user._id.toString(),
    email: user.email,
    roles: user.roles?.map(r => r.name || r) || []
  };
  
  return jwt.sign(payload, jwtConfig.accessToken.secret, {
    expiresIn: jwtConfig.accessToken.expiresIn
  });
};

/**
 * 验证访问令牌
 * @param {string} token - JWT令牌
 * @returns {Object|null} 解码后的令牌信息或null
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.accessToken.secret);
  } catch (error) {
    return null;
  }
};

/**
 * 生成密码重置令牌
 * @param {string} userId - 用户ID
 * @returns {string} JWT重置令牌
 */
const generateResetToken = (userId) => {
  const payload = {
    sub: userId.toString(),
    type: 'reset'
  };
  
  return jwt.sign(payload, jwtConfig.accessToken.secret, {
    expiresIn: '5m'
  });
};

/**
 * 验证密码重置令牌
 * @param {string} token - JWT重置令牌
 * @returns {Object|null} 解码后的令牌信息或null
 */
const verifyResetToken = (token) => {
  try {
    const decoded = jwt.verify(token, jwtConfig.accessToken.secret);
    if (decoded.type !== 'reset') {
      return null;
    }
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * 解码令牌(不验证)
 * @param {string} token - JWT令牌
 * @returns {Object|null} 解码后的令牌信息或null
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