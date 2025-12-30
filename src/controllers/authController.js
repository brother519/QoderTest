const authService = require('../services/authService');

const getClientIp = (req) => {
  return req.ip || req.connection.remoteAddress || 'unknown';
};

const register = async (req, res, next) => {
  try {
    const ip = getClientIp(req);
    const result = await authService.register(req.body, ip);
    
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      ...result
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const ip = getClientIp(req);
    
    const result = await authService.login(email, password, ip);
    
    res.json({
      success: true,
      message: 'Login successful',
      ...result
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const ip = getClientIp(req);
    
    await authService.logout(refreshToken, ip);
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const ip = getClientIp(req);
    
    const result = await authService.refreshTokens(refreshToken, ip);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

const revokeAll = async (req, res, next) => {
  try {
    const ip = getClientIp(req);
    
    await authService.revokeAllSessions(req.user._id, ip);
    
    res.json({
      success: true,
      message: 'All sessions revoked'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  refresh,
  revokeAll
};
