const crypto = require('crypto');
const User = require('../models/User');
const tokenService = require('./tokenService');
const emailService = require('./emailService');
const { BadRequestError, UnauthorizedError, ConflictError } = require('../utils/errors');

const register = async ({ email, password, username }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ConflictError('Email already registered');
  }
  
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  
  const user = await User.create({
    email,
    password,
    username,
    emailVerification: {
      token: verificationToken,
      expires: verificationExpires
    }
  });
  
  await emailService.sendVerificationEmail(email, verificationToken);
  
  return {
    userId: user._id,
    email: user.email
  };
};

const login = async ({ email, password }, ipAddress) => {
  const user = await User.findOne({ email });
  
  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }
  
  if (user.isLocked()) {
    const lockRemaining = Math.ceil((user.security.lockUntil - Date.now()) / 60000);
    throw new UnauthorizedError(`Account locked. Try again in ${lockRemaining} minutes`);
  }
  
  const isPasswordValid = await user.comparePassword(password);
  
  if (!isPasswordValid) {
    await user.incrementFailedAttempts();
    throw new UnauthorizedError('Invalid credentials');
  }
  
  if (user.twoFactor.enabled) {
    const tempToken = tokenService.generateTempToken(user._id);
    return {
      requiresTwoFactor: true,
      tempToken
    };
  }
  
  await user.resetFailedAttempts();
  
  const accessToken = tokenService.generateAccessToken(user);
  const refreshToken = await tokenService.generateRefreshToken(user, null, ipAddress);
  
  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role
    }
  };
};

const logout = async (userId) => {
  await tokenService.revokeAllUserTokens(userId);
};

const refreshToken = async (token, ipAddress) => {
  const result = await tokenService.verifyRefreshToken(token);
  
  if (!result) {
    throw new UnauthorizedError('Invalid refresh token');
  }
  
  const { decoded, storedToken } = result;
  const user = await User.findById(decoded.sub);
  
  if (!user || !user.isActive) {
    throw new UnauthorizedError('User not found or inactive');
  }
  
  const newAccessToken = tokenService.generateAccessToken(user);
  const newRefreshToken = await tokenService.rotateRefreshToken(
    storedToken._id,
    user,
    storedToken.deviceInfo,
    ipAddress
  );
  
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  };
};

const verifyEmail = async (token) => {
  const user = await User.findOne({
    'emailVerification.token': token,
    'emailVerification.expires': { $gt: new Date() }
  });
  
  if (!user) {
    throw new BadRequestError('Invalid or expired verification token');
  }
  
  user.isEmailVerified = true;
  user.emailVerification.token = null;
  user.emailVerification.expires = null;
  await user.save();
  
  return { message: 'Email verified successfully' };
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  
  if (user) {
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordReset.token = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordReset.expires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
    
    await emailService.sendPasswordResetEmail(email, resetToken);
  }
  
  return { message: 'If the email exists, a reset link has been sent' };
};

const resetPassword = async ({ token, newPassword }) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
  const user = await User.findOne({
    'passwordReset.token': hashedToken,
    'passwordReset.expires': { $gt: new Date() }
  });
  
  if (!user) {
    throw new BadRequestError('Invalid or expired reset token');
  }
  
  user.password = newPassword;
  user.passwordReset.token = null;
  user.passwordReset.expires = null;
  user.passwordReset.lastReset = new Date();
  await user.save();
  
  await tokenService.revokeAllUserTokens(user._id);
  
  return { message: 'Password reset successfully' };
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new BadRequestError('User not found');
  }
  
  const isPasswordValid = await user.comparePassword(currentPassword);
  
  if (!isPasswordValid) {
    throw new UnauthorizedError('Current password is incorrect');
  }
  
  user.password = newPassword;
  await user.save();
  
  await tokenService.revokeAllUserTokens(userId);
  
  return { message: 'Password changed successfully' };
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword
};
