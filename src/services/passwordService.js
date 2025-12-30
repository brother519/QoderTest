/**
 * Password Service
 * 
 * Business logic for password-related operations including:
 * - Security question management
 * - Password reset via security questions
 * - Password change for authenticated users
 */

const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const tokenService = require('./tokenService');
const { verifySecurityAnswer } = require('../utils/crypto');
const { ERROR_CODES } = require('../utils/constants');

class PasswordService {
  /**
   * Set or update security questions for a user
   * Requires minimum of 2 questions for password recovery
   * 
   * @param {string} userId - User ID to set questions for
   * @param {Array<Object>} questions - Array of {question, answer} objects
   * @returns {Promise<Object>} - Success status
   * @throws {Error} - If less than 2 questions or user not found
   */
  async setSecurityQuestions(userId, questions) {
    // Validate minimum question count
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
    
    // Hash answers before storing
    user.setSecurityQuestions(questions);
    await user.save();
    
    return { success: true };
  }
  
  /**
   * Verify security question answers and generate reset token
   * All provided answers must be correct
   * 
   * @param {string} email - User's email address
   * @param {Array<Object>} answers - Array of {question, answer} objects
   * @returns {Promise<Object>} - Contains reset token if verified
   * @throws {Error} - If user not found, no questions set, or answers incorrect
   */
  async verifySecurityQuestions(email, answers) {
    // Load user with security questions
    const user = await User.findOne({ email }).select('+securityQuestions');
    
    if (!user) {
      const error = new Error('User not found');
      error.code = ERROR_CODES.NOT_FOUND;
      error.status = 404;
      throw error;
    }
    
    // Ensure security questions are configured
    if (!user.securityQuestions || user.securityQuestions.length === 0) {
      const error = new Error('Security questions not set');
      error.code = ERROR_CODES.VALIDATION_ERROR;
      error.status = 400;
      throw error;
    }
    
    let allCorrect = true;
    
    // Verify each provided answer
    for (const providedAnswer of answers) {
      // Find matching question
      const storedQuestion = user.securityQuestions.find(
        q => q.question === providedAnswer.question
      );
      
      if (!storedQuestion) {
        allCorrect = false;
        break;
      }
      
      // Verify answer hash matches
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
    
    // Generate short-lived reset token (5 minutes)
    const resetToken = tokenService.generateResetToken(user._id);
    
    return { resetToken };
  }
  
  /**
   * Reset password using a valid reset token
   * Also unlocks account and revokes all existing sessions
   * 
   * @param {string} resetToken - Token from verifySecurityQuestions
   * @param {string} newPassword - New password to set
   * @param {string} ip - Client IP for audit trail
   * @returns {Promise<Object>} - Success status
   * @throws {Error} - If token invalid/expired or user not found
   */
  async resetPassword(resetToken, newPassword, ip) {
    // Verify reset token
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
    
    // Update password and unlock account
    user.password = newPassword;
    user.isLocked = false;
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();
    
    // Revoke all existing refresh tokens for security
    await RefreshToken.revokeAllUserTokens(user._id, ip);
    
    return { success: true };
  }
  
  /**
   * Change password for authenticated user
   * Requires current password verification
   * Revokes all sessions after password change
   * 
   * @param {string} userId - Authenticated user's ID
   * @param {string} currentPassword - Current password for verification
   * @param {string} newPassword - New password to set
   * @param {string} ip - Client IP for audit trail
   * @returns {Promise<Object>} - Success status
   * @throws {Error} - If current password incorrect or user not found
   */
  async changePassword(userId, currentPassword, newPassword, ip) {
    // Load user with password field
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      const error = new Error('User not found');
      error.code = ERROR_CODES.NOT_FOUND;
      error.status = 404;
      throw error;
    }
    
    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isPasswordValid) {
      const error = new Error('Current password is incorrect');
      error.code = ERROR_CODES.AUTHENTICATION_ERROR;
      error.status = 401;
      throw error;
    }
    
    // Update password (pre-save hook will hash it)
    user.password = newPassword;
    await user.save();
    
    // Revoke all sessions for security
    await RefreshToken.revokeAllUserTokens(user._id, ip);
    
    return { success: true };
  }
}

module.exports = new PasswordService();
