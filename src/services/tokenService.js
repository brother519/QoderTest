const jwt = require('jsonwebtoken');
const { RefreshToken } = require('../models');
const { hashToken } = require('../utils/crypto');
const securityConfig = require('../config/security');
const logger = require('../utils/logger');

function generateAccessToken(user) {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };
  
  return jwt.sign(payload, securityConfig.jwt.accessSecret, {
    expiresIn: securityConfig.jwt.accessExpiresIn
  });
}

async function generateRefreshToken(user, ipAddress = null, deviceInfo = null) {
  const payload = {
    userId: user.id,
    type: 'refresh'
  };
  
  const token = jwt.sign(payload, securityConfig.jwt.refreshSecret, {
    expiresIn: securityConfig.jwt.refreshExpiresIn
  });
  
  const tokenHash = hashToken(token);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  
  await RefreshToken.create({
    user_id: user.id,
    token_hash: tokenHash,
    expires_at: expiresAt,
    ip_address: ipAddress,
    device_info: deviceInfo
  });
  
  return token;
}

function verifyAccessToken(token) {
  try {
    const decoded = jwt.verify(token, securityConfig.jwt.accessSecret);
    return { valid: true, payload: decoded };
  } catch (error) {
    logger.debug('Access token verification failed:', error.message);
    return { valid: false, error: error.message };
  }
}

async function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, securityConfig.jwt.refreshSecret);
    const tokenHash = hashToken(token);
    
    const refreshToken = await RefreshToken.findOne({
      where: {
        token_hash: tokenHash,
        user_id: decoded.userId
      }
    });
    
    if (!refreshToken) {
      return { valid: false, error: 'Refresh token not found' };
    }
    
    if (refreshToken.is_revoked) {
      return { valid: false, error: 'Refresh token has been revoked' };
    }
    
    if (new Date() > refreshToken.expires_at) {
      return { valid: false, error: 'Refresh token has expired' };
    }
    
    return { valid: true, payload: decoded, tokenRecord: refreshToken };
  } catch (error) {
    logger.debug('Refresh token verification failed:', error.message);
    return { valid: false, error: error.message };
  }
}

async function revokeRefreshToken(token) {
  const tokenHash = hashToken(token);
  
  const refreshToken = await RefreshToken.findOne({
    where: { token_hash: tokenHash }
  });
  
  if (refreshToken) {
    refreshToken.is_revoked = true;
    await refreshToken.save();
    return true;
  }
  
  return false;
}

async function revokeAllUserTokens(userId) {
  await RefreshToken.update(
    { is_revoked: true },
    { where: { user_id: userId, is_revoked: false } }
  );
}

async function refreshAccessToken(refreshToken, ipAddress = null, deviceInfo = null) {
  const verification = await verifyRefreshToken(refreshToken);
  
  if (!verification.valid) {
    throw new Error(verification.error);
  }
  
  const { User } = require('../models');
  const user = await User.findByPk(verification.payload.userId);
  
  if (!user || !user.is_active) {
    throw new Error('User not found or inactive');
  }
  
  const newAccessToken = generateAccessToken(user);
  
  const oldTokenRecord = verification.tokenRecord;
  oldTokenRecord.is_revoked = true;
  await oldTokenRecord.save();
  
  const newRefreshToken = await generateRefreshToken(user, ipAddress, deviceInfo);
  
  await RefreshToken.update(
    { replaced_by: oldTokenRecord.id + 1 },
    { where: { id: oldTokenRecord.id } }
  );
  
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  };
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  refreshAccessToken
};
