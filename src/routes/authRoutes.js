const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const twoFactorController = require('../controllers/twoFactorController');
const { authenticate } = require('../middlewares/auth');
const {
  validate,
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
  changePasswordRules,
  refreshTokenRules,
  twoFactorVerifyRules
} = require('../middlewares/validator');

router.post('/register', registerRules, validate, authController.register);
router.post('/login', loginRules, validate, authController.login);
router.post('/logout', authenticate, authController.logout);
router.post('/refresh-token', refreshTokenRules, validate, authController.refreshToken);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/forgot-password', forgotPasswordRules, validate, authController.forgotPassword);
router.post('/reset-password', resetPasswordRules, validate, authController.resetPassword);
router.post('/change-password', authenticate, changePasswordRules, validate, authController.changePassword);

router.post('/2fa/setup', authenticate, twoFactorController.setup);
router.post('/2fa/verify-setup', authenticate, twoFactorController.verifySetup);
router.post('/2fa/verify', twoFactorVerifyRules, validate, twoFactorController.verify);
router.post('/2fa/disable', authenticate, twoFactorController.disable);
router.post('/2fa/backup-codes', authenticate, twoFactorController.generateBackupCodes);

module.exports = router;
