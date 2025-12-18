const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const tokenService = require('./tokenService');
const { encrypt, decrypt, generateRandomCode } = require('../utils/crypto');
const { BadRequestError, UnauthorizedError } = require('../utils/errors');

const setup = async (userId) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new BadRequestError('User not found');
  }
  
  if (user.twoFactor.enabled) {
    throw new BadRequestError('2FA is already enabled');
  }
  
  const secret = speakeasy.generateSecret({
    name: `QoderAuth:${user.email}`,
    length: 32
  });
  
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
  
  user.twoFactor.secret = encrypt(secret.base32);
  await user.save();
  
  return {
    secret: secret.base32,
    qrCodeUrl,
    manualEntryKey: secret.base32.match(/.{1,4}/g).join(' ')
  };
};

const verifySetup = async (userId, code) => {
  const user = await User.findById(userId);
  
  if (!user || !user.twoFactor.secret) {
    throw new BadRequestError('2FA setup not initiated');
  }
  
  const secret = decrypt(user.twoFactor.secret);
  
  const isValid = speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token: code,
    window: 1
  });
  
  if (!isValid) {
    throw new BadRequestError('Invalid verification code');
  }
  
  user.twoFactor.enabled = true;
  
  const backupCodes = [];
  const hashedCodes = [];
  for (let i = 0; i < 10; i++) {
    const code = generateRandomCode(8);
    backupCodes.push(code);
    hashedCodes.push(await bcrypt.hash(code, 10));
  }
  user.twoFactor.backupCodes = hashedCodes;
  
  await user.save();
  
  return {
    message: '2FA enabled successfully',
    backupCodes
  };
};

const verify = async (tempToken, code, ipAddress) => {
  const decoded = tokenService.verifyTempToken(tempToken);
  
  if (!decoded) {
    throw new UnauthorizedError('Invalid or expired temp token');
  }
  
  const user = await User.findById(decoded.sub);
  
  if (!user || !user.twoFactor.enabled) {
    throw new BadRequestError('2FA not enabled');
  }
  
  const secret = decrypt(user.twoFactor.secret);
  
  const isValid = speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token: code,
    window: 1
  });
  
  if (!isValid) {
    for (let i = 0; i < user.twoFactor.backupCodes.length; i++) {
      const isBackupValid = await bcrypt.compare(code, user.twoFactor.backupCodes[i]);
      if (isBackupValid) {
        user.twoFactor.backupCodes.splice(i, 1);
        await user.save();
        
        const accessToken = tokenService.generateAccessToken(user);
        const refreshToken = await tokenService.generateRefreshToken(user, null, ipAddress);
        
        await user.resetFailedAttempts();
        
        return {
          accessToken,
          refreshToken,
          user: { id: user._id, email: user.email, username: user.username },
          backupCodeUsed: true,
          remainingBackupCodes: user.twoFactor.backupCodes.length
        };
      }
    }
    
    throw new BadRequestError('Invalid 2FA code');
  }
  
  await user.resetFailedAttempts();
  
  const accessToken = tokenService.generateAccessToken(user);
  const refreshToken = await tokenService.generateRefreshToken(user, null, ipAddress);
  
  return {
    accessToken,
    refreshToken,
    user: { id: user._id, email: user.email, username: user.username }
  };
};

const disable = async (userId, password) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new BadRequestError('User not found');
  }
  
  const isPasswordValid = await user.comparePassword(password);
  
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid password');
  }
  
  user.twoFactor.enabled = false;
  user.twoFactor.secret = null;
  user.twoFactor.backupCodes = [];
  await user.save();
  
  return { message: '2FA disabled successfully' };
};

const generateBackupCodes = async (userId, password) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new BadRequestError('User not found');
  }
  
  const isPasswordValid = await user.comparePassword(password);
  
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid password');
  }
  
  if (!user.twoFactor.enabled) {
    throw new BadRequestError('2FA is not enabled');
  }
  
  const backupCodes = [];
  const hashedCodes = [];
  for (let i = 0; i < 10; i++) {
    const code = generateRandomCode(8);
    backupCodes.push(code);
    hashedCodes.push(await bcrypt.hash(code, 10));
  }
  
  user.twoFactor.backupCodes = hashedCodes;
  await user.save();
  
  return { backupCodes };
};

module.exports = {
  setup,
  verifySetup,
  verify,
  disable,
  generateBackupCodes
};
