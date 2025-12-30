/**
 * @file 密码服务
 * @description 处理密码相关操作：安全问题、密码重置、密码修改
 */
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const tokenService = require('./tokenService');
const { verifySecurityAnswer } = require('../utils/crypto');
const { ERROR_CODES } = require('../utils/constants');

/**
 * 密码服务类
 * @class PasswordService
 */
class PasswordService {
  /**
   * 设置用户安全问题
   * @async
   * @param {string} userId - 用户ID
   * @param {Array} questions - 安全问题数组
   * @returns {Promise<Object>} 操作结果
   */
  async setSecurityQuestions(userId, questions) {
    if (!questions || questions.length < 2) {
      const error = new Error('At least 2 security questions are required');
      error.code = ERROR_CODES.VALIDATION_ERROR;
      error.status = 400;
      throw error;
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      const error = new Error('User not found');
      error.code = ERROR_CODES.NOT_FOUND;
      error.status = 404;
      throw error;
    }
    
    user.setSecurityQuestions(questions);
    await user.save();
    
    return { success: true };
  }
  
  /**
   * 验证安全问题答案
   * @async
   * @param {string} email - 用户邮箱
   * @param {Array} answers - 答案数组
   * @returns {Promise<Object>} 包含重置令牌的对象
   */
  async verifySecurityQuestions(email, answers) {
    const user = await User.findOne({ email }).select('+securityQuestions');
    
    if (!user) {
      const error = new Error('User not found');
      error.code = ERROR_CODES.NOT_FOUND;
      error.status = 404;
      throw error;
    }
    
    if (!user.securityQuestions || user.securityQuestions.length === 0) {
      const error = new Error('Security questions not set');
      error.code = ERROR_CODES.VALIDATION_ERROR;
      error.status = 400;
      throw error;
    }
    
    let allCorrect = true;
    
    for (const providedAnswer of answers) {
      const storedQuestion = user.securityQuestions.find(
        q => q.question === providedAnswer.question
      );
      
      if (!storedQuestion) {
        allCorrect = false;
        break;
      }
      
      if (!verifySecurityAnswer(providedAnswer.answer, storedQuestion.answerHash)) {
        allCorrect = false;
        break;
      }
    }
    
    if (!allCorrect) {
      const error = new Error('Security answers are incorrect');
      error.code = ERROR_CODES.AUTHENTICATION_ERROR;
      error.status = 401;
      throw error;
    }
    
    const resetToken = tokenService.generateResetToken(user._id);
    
    return { resetToken };
  }
  
  /**
   * 使用重置令牌重置密码
   * @async
   * @param {string} resetToken - 重置令牌
   * @param {string} newPassword - 新密码
   * @param {string} ip - 客户端IP
   * @returns {Promise<Object>} 操作结果
   */
  async resetPassword(resetToken, newPassword, ip) {
    const decoded = tokenService.verifyResetToken(resetToken);
    
    if (!decoded) {
      const error = new Error('Invalid or expired reset token');
      error.code = ERROR_CODES.TOKEN_INVALID;
      error.status = 400;
      throw error;
    }
    
    const user = await User.findById(decoded.sub);
    
    if (!user) {
      const error = new Error('User not found');
      error.code = ERROR_CODES.NOT_FOUND;
      error.status = 404;
      throw error;
    }
    
    user.password = newPassword;
    user.isLocked = false;
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();
    
    await RefreshToken.revokeAllUserTokens(user._id, ip);
    
    return { success: true };
  }
  
  /**
   * 修改密码
   * @async
   * @param {string} userId - 用户ID
   * @param {string} currentPassword - 当前密码
   * @param {string} newPassword - 新密码
   * @param {string} ip - 客户端IP
   * @returns {Promise<Object>} 操作结果
   */
  async changePassword(userId, currentPassword, newPassword, ip) {
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      const error = new Error('User not found');
      error.code = ERROR_CODES.NOT_FOUND;
      error.status = 404;
      throw error;
    }
    
    const isPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isPasswordValid) {
      const error = new Error('Current password is incorrect');
      error.code = ERROR_CODES.AUTHENTICATION_ERROR;
      error.status = 401;
      throw error;
    }
    
    user.password = newPassword;
    await user.save();
    
    await RefreshToken.revokeAllUserTokens(user._id, ip);
    
    return { success: true };
  }
}

module.exports = new PasswordService();