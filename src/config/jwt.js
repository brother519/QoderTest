/**
 * @file JWT配置模块
 * @description JWT访问令牌和刷新令牌的配置
 */

/**
 * JWT配置对象
 * @type {Object}
 * @property {Object} accessToken - 访问令牌配置
 * @property {string} accessToken.secret - 访问令牌密钥
 * @property {string} accessToken.expiresIn - 访问令牌过期时间
 * @property {Object} refreshToken - 刷新令牌配置
 * @property {string} refreshToken.secret - 刷新令牌密钥
 * @property {string} refreshToken.expiresIn - 刷新令牌过期时间
 * @property {string} securityAnswerSecret - 安全问题答案加密密钥
 */
module.exports = {
  accessToken: {
    secret: process.env.JWT_SECRET || 'default-jwt-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m'
  },
  refreshToken: {
    secret: process.env.REFRESH_TOKEN_SECRET || 'default-refresh-secret-change-in-production',
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'
  },
  securityAnswerSecret: process.env.SECURITY_ANSWER_SECRET || 'default-security-answer-secret'
};