/**
 * Authentication Routes
 * 
 * Defines API endpoints for user authentication operations.
 * All routes are prefixed with /api/auth
 */

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

/**
 * POST /api/auth/register
 * Register a new user account
 * Rate limited to prevent mass registration
 */
router.post(
  '/register',
  registerLimiter,
  validate(registerSchema),
  authController.register
);

/**
 * POST /api/auth/login
 * Authenticate user and return tokens
 * Rate limited to prevent brute force attacks
 */
router.post(
  '/login',
  loginLimiter,
  validate(loginSchema),
  authController.login
);

/**
 * POST /api/auth/logout
 * Revoke refresh token and end session
 * Requires authentication
 */
router.post(
  '/logout',
  authenticate,
  validate(logoutSchema),
  authController.logout
);

/**
 * POST /api/auth/refresh
 * Exchange refresh token for new token pair
 * Does not require authentication (uses refresh token)
 */
router.post(
  '/refresh',
  validate(refreshTokenSchema),
  authController.refresh
);

/**
 * POST /api/auth/revoke-all
 * Revoke all refresh tokens for current user
 * Forces logout on all devices
 * Requires authentication
 */
router.post(
  '/revoke-all',
  authenticate,
  authController.revokeAll
);

module.exports = router;
