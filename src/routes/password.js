/**
 * @file 密码路由
 * @description 处理密码相关的API路由
 */
const express = require('express');
const router = express.Router();
const passwordController = require('../controllers/passwordController');
const { authenticate } = require('../middleware/authenticate');
const { validate } = require('../middleware/validator');
const { passwordResetLimiter } = require('../middleware/rateLimiter');
const {
  setSecurityQuestionsSchema,
  verifySecurityQuestionsSchema,
  resetPasswordSchema,
  changePasswordSchema
} = require('../schemas/passwordSchemas');

/** POST /password/security-questions/set - 设置安全问题 */
router.post(
  '/security-questions/set',
  authenticate,
  validate(setSecurityQuestionsSchema),
  passwordController.setSecurityQuestions
);

/** POST /password/reset/verify - 验证安全问题 */
router.post(
  '/reset/verify',
  passwordResetLimiter,
  validate(verifySecurityQuestionsSchema),
  passwordController.verifySecurityQuestions
);

/** POST /password/reset/confirm - 确认重置密码 */
router.post(
  '/reset/confirm',
  validate(resetPasswordSchema),
  passwordController.resetPassword
);

/** POST /password/change - 修改密码 */
router.post(
  '/change',
  authenticate,
  validate(changePasswordSchema),
  passwordController.changePassword
);

module.exports = router;