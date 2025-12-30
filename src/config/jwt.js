/**
 * JWT Configuration
 * 
 * Settings for JSON Web Token generation and validation.
 * All secrets should be set via environment variables in production.
 */

module.exports = {
  // Access token settings (short-lived, for API requests)
  accessToken: {
    secret: process.env.JWT_SECRET || 'default-jwt-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m'  // 15 minutes default
  },
  
  // Refresh token settings (long-lived, for getting new access tokens)
  refreshToken: {
    secret: process.env.REFRESH_TOKEN_SECRET || 'default-refresh-secret-change-in-production',
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'  // 7 days default
  },
  
  // Secret for hashing security question answers
  securityAnswerSecret: process.env.SECURITY_ANSWER_SECRET || 'default-security-answer-secret'
};
