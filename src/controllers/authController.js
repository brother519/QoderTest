const authService = require('../services/authService');
const logger = require('../utils/logger');

const register = async (req, res, next) => {
  try {
    const { email, password, username } = req.body;
    
    const result = await authService.register(email, password, username);
    
    logger.info('Registration successful', { email });
    
    res.status(201).json({
      message: '注册成功，请检查邮箱验证链接',
      user: result.user
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    const result = await authService.login(email, password, ipAddress);
    
    if (result.requires2FA) {
      return res.json({
        requires2FA: true,
        tempSessionId: result.tempSessionId
      });
    }
    
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: process.env.COOKIE_SAME_SITE || 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });
    
    res.json({
      accessToken: result.accessToken,
      user: result.user
    });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    
    const user = await authService.verifyEmail(token);
    
    res.json({
      message: '邮箱验证成功',
      user
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    await authService.logout(req.userId, refreshToken);
    
    res.clearCookie('refreshToken');
    
    res.json({
      message: '登出成功'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  verifyEmail,
  logout
};
