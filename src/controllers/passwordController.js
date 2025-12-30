/**
 * @file 密码控制器
 * @description 处理密码相关的HTTP请求
 */
const passwordService = require('../services/passwordService');

/**
 * 获取客户端IP地址
 * @param {Object} req - Express请求对象
 * @returns {string} IP地址
 */
const getClientIp = (req) => {
  return req.ip || req.connection.remoteAddress || 'unknown';
};

/**
 * 设置安全问题
 * @async
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - 下一个中间件
 */
const setSecurityQuestions = async (req, res, next) => {
  try {
    const { questions } = req.body;
    
    await passwordService.setSecurityQuestions(req.user._id, questions);
    
    res.json({
      success: true,
      message: 'Security questions set successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 验证安全问题答案
 * @async
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - 下一个中间件
 */
const verifySecurityQuestions = async (req, res, next) => {
  try {
    const { email, answers } = req.body;
    
    const result = await passwordService.verifySecurityQuestions(email, answers);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 重置密码
 * @async
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - 下一个中间件
 */
const resetPassword = async (req, res, next) => {
  try {
    const { resetToken, newPassword } = req.body;
    const ip = getClientIp(req);
    
    await passwordService.resetPassword(resetToken, newPassword, ip);
    
    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 修改密码
 * @async
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - 下一个中间件
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const ip = getClientIp(req);
    
    await passwordService.changePassword(req.user._id, currentPassword, newPassword, ip);
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  setSecurityQuestions,
  verifySecurityQuestions,
  resetPassword,
  changePassword
};