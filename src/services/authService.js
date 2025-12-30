const User = require('../models/User');
const Role = require('../models/Role');
const RefreshToken = require('../models/RefreshToken');
const tokenService = require('./tokenService');
const { sanitizeUser } = require('../utils/validators');
const { ERROR_CODES, ROLES } = require('../utils/constants');

class AuthService {
  async register(userData, ip) {
    const { email, username, password, securityQuestions } = userData;
    
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });
    
    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      const error = new Error(`${field === 'email' ? 'Email' : 'Username'} already exists`);
      error.code = ERROR_CODES.DUPLICATE_ERROR;
      error.status = 400;
      throw error;
    }
    
    const userRole = await Role.findOne({ name: ROLES.USER });
    
    const user = new User({
      email,
      username,
      password,
      roles: userRole ? [userRole._id] : []
    });
    
    if (securityQuestions && securityQuestions.length >= 2) {
      user.setSecurityQuestions(securityQuestions);
    }
    
    await user.save();
    
    const accessToken = tokenService.generateAccessToken(user);
    const refreshToken = await RefreshToken.createToken(user._id, ip);
    
    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken
    };
  }
  
  async login(email, password, ip) {
    const user = await User.findOne({ email })
      .select('+password')
      .populate('roles');
    
    if (!user) {
      const error = new Error('Invalid email or password');
      error.code = ERROR_CODES.AUTHENTICATION_ERROR;
      error.status = 401;
      throw error;
    }
    
    if (!user.isActive) {
      const error = new Error('Account is deactivated');
      error.code = ERROR_CODES.AUTHENTICATION_ERROR;
      error.status = 401;
      throw error;
    }
    
    if (user.isAccountLocked) {
      const error = new Error('Account is locked. Please try again later');
      error.code = ERROR_CODES.ACCOUNT_LOCKED;
      error.status = 423;
      throw error;
    }
    
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      await user.incLoginAttempts();
      const error = new Error('Invalid email or password');
      error.code = ERROR_CODES.AUTHENTICATION_ERROR;
      error.status = 401;
      throw error;
    }
    
    await user.resetLoginAttempts();
    user.lastLogin = new Date();
    await user.save();
    
    const accessToken = tokenService.generateAccessToken(user);
    const refreshToken = await RefreshToken.createToken(user._id, ip);
    
    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken
    };
  }
  
  async logout(refreshToken, ip) {
    if (!refreshToken) {
      return { success: true };
    }
    
    await RefreshToken.revokeToken(refreshToken, ip);
    return { success: true };
  }
  
  async refreshTokens(oldRefreshToken, ip) {
    const tokenDoc = await RefreshToken.findByToken(oldRefreshToken);
    
    if (!tokenDoc) {
      const error = new Error('Invalid refresh token');
      error.code = ERROR_CODES.TOKEN_INVALID;
      error.status = 401;
      throw error;
    }
    
    if (tokenDoc.isRevoked) {
      await RefreshToken.revokeAllUserTokens(tokenDoc.user, ip);
      const error = new Error('Token reuse detected. All sessions revoked');
      error.code = ERROR_CODES.TOKEN_INVALID;
      error.status = 401;
      throw error;
    }
    
    if (tokenDoc.isExpired) {
      const error = new Error('Refresh token expired');
      error.code = ERROR_CODES.TOKEN_EXPIRED;
      error.status = 401;
      throw error;
    }
    
    const user = await User.findById(tokenDoc.user).populate('roles');
    
    if (!user || !user.isActive) {
      const error = new Error('User not found or deactivated');
      error.code = ERROR_CODES.AUTHENTICATION_ERROR;
      error.status = 401;
      throw error;
    }
    
    const newRefreshToken = await RefreshToken.createToken(user._id, ip);
    await RefreshToken.revokeToken(oldRefreshToken, ip, newRefreshToken);
    
    const accessToken = tokenService.generateAccessToken(user);
    
    return {
      accessToken,
      refreshToken: newRefreshToken
    };
  }
  
  async revokeAllSessions(userId, ip) {
    await RefreshToken.revokeAllUserTokens(userId, ip);
    return { success: true };
  }
}

module.exports = new AuthService();
