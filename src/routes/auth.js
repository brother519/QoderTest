const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authenticate');
const { validate } = require('../middleware/validator');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiter');
const {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema
} = require('../schemas/authSchemas');

router.post(
  '/register',
  registerLimiter,
  validate(registerSchema),
  authController.register
);

router.post(
  '/login',
  loginLimiter,
  validate(loginSchema),
  authController.login
);

router.post(
  '/logout',
  authenticate,
  validate(logoutSchema),
  authController.logout
);

router.post(
  '/refresh',
  validate(refreshTokenSchema),
  authController.refresh
);

router.post(
  '/revoke-all',
  authenticate,
  authController.revokeAll
);

module.exports = router;
