/**
 * Password Routes
 * 
 * Defines API endpoints for password management operations.
 * All routes are prefixed with /api/password
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

/**
 * POST /api/password/security-questions/set
 * Set or update security questions for password recovery
 * Requires authentication
 */
router.post(
  '/security-questions/set',
  authenticate,
  validate(setSecurityQuestionsSchema),
  passwordController.setSecurityQuestions
);

/**
 * POST /api/password/reset/verify
 * Verify security question answers to get reset token
 * Rate limited to prevent enumeration attacks
 */
router.post(
  '/reset/verify',
  passwordResetLimiter,
  validate(verifySecurityQuestionsSchema),
  passwordController.verifySecurityQuestions
);

/**
 * POST /api/password/reset/confirm
 * Reset password using reset token from verify step
 * No authentication required (uses reset token)
 */
router.post(
  '/reset/confirm',
  validate(resetPasswordSchema),
  passwordController.resetPassword
);

/**
 * POST /api/password/change
 * Change password for authenticated user
 * Requires current password verification
 */
router.post(
  '/change',
  authenticate,
  validate(changePasswordSchema),
  passwordController.changePassword
);

module.exports = router;
