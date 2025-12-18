const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwtConfig = require('../config/jwt');
const RefreshToken = require('../models/Token');

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      sub: user._id,
      email: user.email,
      role: user.role
    },
    jwtConfig.accessToken.secret,
    { expiresIn: jwtConfig.accessToken.expiresIn }
  );
};

const generateRefreshToken = async (user, deviceInfo = null, ipAddress = null) => {
  const tokenValue = crypto.randomBytes(64).toString('hex');
  const hashedToken = await bcrypt.hash(tokenValue, 10);
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  await RefreshToken.create({
    userId: user._id,
    token: hashedToken,
    deviceInfo,
    ipAddress,
    expiresAt
  });
  
  return jwt.sign(
    { token: tokenValue, sub: user._id },
    jwtConfig.refreshToken.secret,
    { expiresIn: jwtConfig.refreshToken.expiresIn }
  );
};

const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.accessToken.secret);
  } catch (error) {
    return null;
  }
};

const verifyRefreshToken = async (token) => {
  try {
    const decoded = jwt.verify(token, jwtConfig.refreshToken.secret);
    
    const storedTokens = await RefreshToken.find({
      userId: decoded.sub,
      isRevoked: false,
      expiresAt: { $gt: new Date() }
    });
    
    for (const storedToken of storedTokens) {
      const isMatch = await bcrypt.compare(decoded.token, storedToken.token);
      if (isMatch) {
        return { decoded, storedToken };
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

const revokeRefreshToken = async (tokenId) => {
  await RefreshToken.findByIdAndUpdate(tokenId, { isRevoked: true });
};

const revokeAllUserTokens = async (userId) => {
  await RefreshToken.updateMany({ userId }, { isRevoked: true });
};

const rotateRefreshToken = async (oldTokenId, user, deviceInfo, ipAddress) => {
  await revokeRefreshToken(oldTokenId);
  return generateRefreshToken(user, deviceInfo, ipAddress);
};

const generateTempToken = (userId) => {
  return jwt.sign(
    { sub: userId, type: 'temp_2fa' },
    jwtConfig.accessToken.secret,
    { expiresIn: '5m' }
  );
};

const verifyTempToken = (token) => {
  try {
    const decoded = jwt.verify(token, jwtConfig.accessToken.secret);
    if (decoded.type !== 'temp_2fa') return null;
    return decoded;
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  rotateRefreshToken,
  generateTempToken,
  verifyTempToken
};
