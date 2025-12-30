/**
 * Password Controller
 * 
 * HTTP request handlers for password management endpoints.
 * Handles security questions and password reset/change operations.
 */

const passwordService = require('../services/passwordService');

/**
 * Extract client IP address from request
 * 
 * @param {Object} req - Express request object
 * @returns {string} - Client IP address or 'unknown'
 */
const getClientIp = (req) => {
  return req.ip || req.connection.remoteAddress || 'unknown';
};

/**
 * Set security questions for password recovery
 * POST /api/password/security-questions/set
 * 
 * @param {Object} req - Express request with questions array in body
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
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
 * Verify security question answers and get reset token
 * POST /api/password/reset/verify
 * 
 * @param {Object} req - Express request with email and answers in body
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
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
 * Reset password using reset token
 * POST /api/password/reset/confirm
 * 
 * @param {Object} req - Express request with resetToken and newPassword in body
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
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
 * Change password for authenticated user
 * POST /api/password/change
 * 
 * @param {Object} req - Express request with currentPassword and newPassword in body
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
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
