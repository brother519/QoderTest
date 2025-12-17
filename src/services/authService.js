const { User, EmailVerification } = require('../models');
const { generateRandomToken } = require('../utils/crypto');
const { generateAccessToken, generateRefreshToken } = require('./tokenService');
const loginAttemptService = require('./loginAttemptService');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');
const { AuthenticationError, ValidationError, RateLimitError } = require('../utils/errors');

async function register(email, password, username = null) {
  const existingUser = await User.findOne({ where: { email } });
  
  if (existingUser) {
    throw new ValidationError('Email already registered', [
      { field: 'email', message: 'This email is already in use' }
    ]);
  }
  
  if (username) {
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      throw new ValidationError('Username already taken', [
        { field: 'username', message: 'This username is already in use' }
      ]);
    }
  }
  
  const user = await User.create({
    email,
    username,
    password_hash: password,
    is_email_verified: false
  });
  
  const verificationToken = generateRandomToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);
  
  await EmailVerification.create({
    user_id: user.id,
    token: verificationToken,
    expires_at: expiresAt
  });
  
  logger.info('User registered successfully', { userId: user.id, email });
  
  return {
    user: user.toSafeObject(),
    verificationToken
  };
}

async function login(email, password, ipAddress = null) {
  const emailRateLimit = await loginAttemptService.checkRateLimit(email);
  if (!emailRateLimit.allowed) {
    throw new RateLimitError(`Too many failed login attempts. Please try again in ${Math.ceil(emailRateLimit.retryAfter / 60)} minutes`);
  }
  
  const ipRateLimit = await loginAttemptService.checkIPRateLimit(ipAddress);
  if (!ipRateLimit.allowed) {
    throw new RateLimitError(`Too many requests from this IP. Please try again in ${Math.ceil(ipRateLimit.retryAfter / 60)} minutes`);
  }
  
  const user = await User.findOne({ 
    where: { email },
    include: ['twoFactorAuth']
  });
  
  const dummyHash = '$2a$12$dummyhashtopreventtimingattacks1234567890';
  const passwordToCheck = user ? user.password_hash : dummyHash;
  
  const isValidPassword = await bcrypt.compare(password, passwordToCheck);
  
  if (!user || !isValidPassword) {
    await loginAttemptService.recordAttempt(email, ipAddress, false);
    
    const failedCount = await loginAttemptService.getFailedAttemptCount(email);
    if (failedCount >= 3) {
      await new Promise(resolve => setTimeout(resolve, 2000 * Math.min(failedCount - 2, 3)));
    }
    
    throw new AuthenticationError('Invalid email or password');
  }
  
  if (!user.is_active) {
    await loginAttemptService.recordAttempt(email, ipAddress, false);
    throw new AuthenticationError('Account has been deactivated');
  }
  
  await loginAttemptService.recordAttempt(email, ipAddress, true);
  
  if (user.twoFactorAuth && user.twoFactorAuth.is_enabled) {
    const tempToken = require('jsonwebtoken').sign(
      { userId: user.id, requires2FA: true, type: 'temp' },
      require('../config/security').jwt.accessSecret,
      { expiresIn: '5m' }
    );
    
    logger.info('Login requires 2FA', { userId: user.id });
    
    return {
      requires2FA: true,
      tempSessionId: tempToken
    };
  }
  
  user.last_login_at = new Date();
  await user.save();
  
  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user, ipAddress);
  
  logger.info('User logged in successfully', { userId: user.id });
  
  return {
    accessToken,
    refreshToken,
    user: user.toSafeObject()
  };
}

async function verifyEmail(token) {
  const verification = await EmailVerification.findOne({
    where: { token },
    include: [{ model: User, as: 'User' }]
  });
  
  if (!verification) {
    throw new ValidationError('Invalid verification token');
  }
  
  if (new Date() > verification.expires_at) {
    throw new ValidationError('Verification token has expired');
  }
  
  const user = await User.findByPk(verification.user_id);
  
  if (!user) {
    throw new ValidationError('User not found');
  }
  
  user.is_email_verified = true;
  await user.save();
  
  await EmailVerification.destroy({ where: { id: verification.id } });
  
  logger.info('Email verified successfully', { userId: user.id });
  
  return user.toSafeObject();
}

async function logout(userId, refreshToken) {
  const tokenService = require('./tokenService');
  
  if (refreshToken) {
    await tokenService.revokeRefreshToken(refreshToken);
  }
  
  logger.info('User logged out', { userId });
  
  return true;
}

module.exports = {
  register,
  login,
  verifyEmail,
  logout
};
