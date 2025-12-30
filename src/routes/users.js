/**
 * User Routes
 * 
 * Defines API endpoints for user management.
 * All routes are prefixed with /api/users
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { validate } = require('../middleware/validator');
const { updateUserSchema, userIdSchema, userListSchema } = require('../schemas/userSchemas');

/**
 * GET /api/users/me
 * Get current authenticated user's profile
 * Requires authentication
 */
router.get('/me', authenticate, userController.getMe);

/**
 * PATCH /api/users/me
 * Update current authenticated user's profile
 * Requires authentication
 */
router.patch(
  '/me',
  authenticate,
  validate(updateUserSchema),
  userController.updateMe
);

/**
 * GET /api/users
 * Get paginated list of all users
 * Requires authentication and users:read permission
 */
router.get(
  '/',
  authenticate,
  authorize.permissions(['users:read']),
  validate(userListSchema),
  userController.getUsers
);

/**
 * GET /api/users/:id
 * Get a specific user by ID
 * Requires authentication
 * User can view own profile, others need users:read permission
 */
router.get(
  '/:id',
  authenticate,
  authorize.isOwnerOrHasPermission('id', ['users:read']),
  validate(userIdSchema),
  userController.getUserById
);

/**
 * DELETE /api/users/:id
 * Delete a user by ID
 * Requires authentication and users:delete permission
 */
router.delete(
  '/:id',
  authenticate,
  authorize.permissions(['users:delete']),
  validate(userIdSchema),
  userController.deleteUser
);

module.exports = router;
