const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

const generateAccessToken = (user) => {
  const payload = {
    sub: user._id.toString(),
    email: user.email,
    roles: user.roles?.map(r => r.name || r) || []
  };
  
  return jwt.sign(payload, jwtConfig.accessToken.secret, {
    expiresIn: jwtConfig.accessToken.expiresIn
  });
};

const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.accessToken.secret);
  } catch (error) {
    return null;
  }
};

const generateResetToken = (userId) => {
  const payload = {
    sub: userId.toString(),
    type: 'reset'
  };
  
  return jwt.sign(payload, jwtConfig.accessToken.secret, {
    expiresIn: '5m'
  });
};

const verifyResetToken = (token) => {
  try {
    const decoded = jwt.verify(token, jwtConfig.accessToken.secret);
    if (decoded.type !== 'reset') {
      return null;
    }
    return decoded;
  } catch (error) {
    return null;
  }
};

const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  verifyAccessToken,
  generateResetToken,
  verifyResetToken,
  decodeToken
};
