/**
 * @file 应用配置模块
 * @description 加载环境变量并导出应用程序的核心配置项
 */
require('dotenv').config();

/**
 * 应用程序配置对象
 * @type {Object}
 * @property {number} port - 服务器端口号
 * @property {string} nodeEnv - Node环境模式
 * @property {boolean} isProduction - 是否为生产环境
 * @property {boolean} isDevelopment - 是否为开发环境
 * @property {number} bcryptRounds - bcrypt加密轮数
 * @property {Object} rateLimiting - 速率限制配置
 * @property {string} logLevel - 日志级别
 */
module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,
  
  rateLimiting: {
    loginLimit: parseInt(process.env.LOGIN_RATE_LIMIT, 10) || 5,
    passwordResetLimit: parseInt(process.env.PASSWORD_RESET_RATE_LIMIT, 10) || 3,
    generalLimit: 100
  },
  
  logLevel: process.env.LOG_LEVEL || 'info'
};