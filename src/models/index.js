const { sequelize } = require('../config/database');
const User = require('./User');
const OAuthAccount = require('./OAuthAccount');
const TwoFactorAuth = require('./TwoFactorAuth');
const RefreshToken = require('./RefreshToken');
const LoginAttempt = require('./LoginAttempt');
const EmailVerification = require('./EmailVerification');

User.hasMany(OAuthAccount, { foreignKey: 'user_id', as: 'oauthAccounts' });
OAuthAccount.belongsTo(User, { foreignKey: 'user_id' });

User.hasOne(TwoFactorAuth, { foreignKey: 'user_id', as: 'twoFactorAuth' });
TwoFactorAuth.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(RefreshToken, { foreignKey: 'user_id', as: 'refreshTokens' });
RefreshToken.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(EmailVerification, { foreignKey: 'user_id', as: 'emailVerifications' });
EmailVerification.belongsTo(User, { foreignKey: 'user_id' });

const syncDatabase = async (options = {}) => {
  try {
    await sequelize.sync(options);
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Error synchronizing database:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  OAuthAccount,
  TwoFactorAuth,
  RefreshToken,
  LoginAttempt,
  EmailVerification,
  syncDatabase
};
