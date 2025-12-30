const passwordService = require('../services/passwordService');

const getClientIp = (req) => {
  return req.ip || req.connection.remoteAddress || 'unknown';
};

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
