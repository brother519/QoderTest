const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middlewares/auth');
const { validateProfileUpdate, validatePasswordChange, handleValidationErrors } = require('../middlewares/validator');

router.get(
  '/me',
  requireAuth,
  userController.getProfile
);

router.patch(
  '/me',
  requireAuth,
  validateProfileUpdate,
  handleValidationErrors,
  userController.updateProfile
);

router.post(
  '/me/change-password',
  requireAuth,
  validatePasswordChange,
  handleValidationErrors,
  userController.changePassword
);

module.exports = router;
