const { User } = require('../models');
const { ValidationError, AuthenticationError } = require('../utils/errors');
const logger = require('../utils/logger');

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId, {
      include: [
        { association: 'oauthAccounts', attributes: ['provider'] },
        { association: 'twoFactorAuth', attributes: ['is_enabled'] }
      ]
    });
    
    const profile = user.toSafeObject();
    profile.has2FA = user.twoFactorAuth?.is_enabled || false;
    profile.oauthProviders = user.oauthAccounts?.map(acc => acc.provider) || [];
    
    res.json(profile);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { username } = req.body;
    
    const user = await User.findByPk(req.userId);
    
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        throw new ValidationError('Username already taken', [
          { field: 'username', message: 'This username is already in use' }
        ]);
      }
      user.username = username;
    }
    
    await user.save();
    
    logger.info('Profile updated', { userId: req.userId });
    
    res.json({
      message: '更新成功',
      user: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findByPk(req.userId);
    
    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      throw new AuthenticationError('当前密码错误');
    }
    
    user.password_hash = newPassword;
    await user.save();
    
    logger.info('Password changed', { userId: req.userId });
    
    res.json({
      message: '密码修改成功'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword
};
