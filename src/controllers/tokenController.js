const tokenService = require('../services/tokenService');
const logger = require('../utils/logger');

const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({
        error: {
          message: 'Refresh token not provided',
          code: 'NO_REFRESH_TOKEN'
        }
      });
    }
    
    const ipAddress = req.ip || req.connection.remoteAddress;
    const deviceInfo = req.get('User-Agent');
    
    const result = await tokenService.refreshAccessToken(refreshToken, ipAddress, deviceInfo);
    
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: process.env.COOKIE_SAME_SITE || 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });
    
    res.json({
      accessToken: result.accessToken
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  refresh
};
