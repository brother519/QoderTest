const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { validate } = require('../middleware/validator');
const { updateUserSchema, userIdSchema, userListSchema } = require('../schemas/userSchemas');

router.get('/me', authenticate, userController.getMe);

router.patch(
  '/me',
  authenticate,
  validate(updateUserSchema),
  userController.updateMe
);

router.get(
  '/',
  authenticate,
  authorize.permissions(['users:read']),
  validate(userListSchema),
  userController.getUsers
);

router.get(
  '/:id',
  authenticate,
  authorize.isOwnerOrHasPermission('id', ['users:read']),
  validate(userIdSchema),
  userController.getUserById
);

router.delete(
  '/:id',
  authenticate,
  authorize.permissions(['users:delete']),
  validate(userIdSchema),
  userController.deleteUser
);

module.exports = router;
