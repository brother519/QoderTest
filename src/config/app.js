require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,
  
  rateLimiting: {
    loginLimit: parseInt(process.env.LOGIN_RATE_LIMIT, 10) || 5,
    passwordResetLimit: parseInt(process.env.PASSWORD_RESET_RATE_LIMIT, 10) || 3,
    generalLimit: 100
  },
  
  logLevel: process.env.LOG_LEVEL || 'info'
};
