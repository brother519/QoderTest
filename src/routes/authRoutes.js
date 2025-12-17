const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const tokenController = require('../controllers/tokenController');
const { validateRegistration, validateLogin, handleValidationErrors } = require('../middlewares/validator');
const { loginLimiter, registrationLimiter } = require('../middlewares/rateLimiter');
const { requireAuth } = require('../middlewares/auth');

router.post(
  '/register',
  registrationLimiter,
  validateRegistration,
  handleValidationErrors,
  authController.register
);

router.post(
  '/login',
  loginLimiter,
  validateLogin,
  handleValidationErrors,
  authController.login
);

router.post(
  '/logout',
  requireAuth,
  authController.logout
);

router.post(
  '/refresh',
  tokenController.refresh
);

router.get(
  '/verify-email/:token',
  authController.verifyEmail
);

module.exports = router;
