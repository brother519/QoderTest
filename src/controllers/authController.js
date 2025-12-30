/**
 * @file 认证控制器
 * @description 处理认证相关的HTTP请求
 */
const authService = require('../services/authService');

/**
 * 获取客户端IP地址
 * @param {Object} req - Express请求对象
 * @returns {string} IP地址
 */
const getClientIp = (req) => {
  return req.ip || req.connection.remoteAddress || 'unknown';
};

/**
 * 用户注册
 * @async
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - 下一个中间件
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
 * 用户登录
 * @async
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - 下一个中间件
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
 * 用户登出
 * @async
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - 下一个中间件
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
 * 刷新访问令牌
 * @async
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - 下一个中间件
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
 * 撤销所有会话
 * @async
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - 下一个中间件
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