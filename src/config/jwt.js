module.exports = {
  accessToken: {
    secret: process.env.JWT_SECRET || 'default-jwt-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m'
  },
  refreshToken: {
    secret: process.env.REFRESH_TOKEN_SECRET || 'default-refresh-secret-change-in-production',
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'
  },
  securityAnswerSecret: process.env.SECURITY_ANSWER_SECRET || 'default-security-answer-secret'
};
