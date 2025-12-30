const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const tokenService = require('./tokenService');
const { verifySecurityAnswer } = require('../utils/crypto');
const { ERROR_CODES } = require('../utils/constants');

class PasswordService {
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
