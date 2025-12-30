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

router.post(
  '/security-questions/set',
  authenticate,
  validate(setSecurityQuestionsSchema),
  passwordController.setSecurityQuestions
);

router.post(
  '/reset/verify',
  passwordResetLimiter,
  validate(verifySecurityQuestionsSchema),
  passwordController.verifySecurityQuestions
);

router.post(
  '/reset/confirm',
  validate(resetPasswordSchema),
  passwordController.resetPassword
);

router.post(
  '/change',
  authenticate,
  validate(changePasswordSchema),
  passwordController.changePassword
);

module.exports = router;
