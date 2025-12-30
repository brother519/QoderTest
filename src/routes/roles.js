/**
 * Role Routes
 * 
 * Defines API endpoints for role and permission management.
 * All routes are prefixed with /api/roles
 * All routes require authentication and appropriate permissions
 */

const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { authenticate } = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

/**
 * GET /api/roles
 * Get all roles with their permissions
 * Requires roles:read permission
 */
router.get(
  '/',
  authenticate,
  authorize.permissions(['roles:read']),
  roleController.getAllRoles
);

/**
 * GET /api/roles/:id
 * Get a specific role by ID
 * Requires roles:read permission
 */
router.get(
  '/:id',
  authenticate,
  authorize.permissions(['roles:read']),
  roleController.getRoleById
);

/**
 * POST /api/roles
 * Create a new role
 * Requires roles:create permission
 */
router.post(
  '/',
  authenticate,
  authorize.permissions(['roles:create']),
  roleController.createRole
);

/**
 * PATCH /api/roles/:id
 * Update an existing role
 * Requires roles:update permission
 */
router.patch(
  '/:id',
  authenticate,
  authorize.permissions(['roles:update']),
  roleController.updateRole
);

/**
 * DELETE /api/roles/:id
 * Delete a role
 * Requires roles:delete permission
 */
router.delete(
  '/:id',
  authenticate,
  authorize.permissions(['roles:delete']),
  roleController.deleteRole
);

/**
 * PATCH /api/roles/users/:id/roles
 * Assign roles to a user
 * Requires roles:assign permission
 */
router.patch(
  '/users/:id/roles',
  authenticate,
  authorize.permissions(['roles:assign']),
  roleController.assignRoles
);

/**
 * GET /api/roles/permissions/all
 * Get all defined permissions
 * Requires roles:read permission
 */
router.get(
  '/permissions/all',
  authenticate,
  authorize.permissions(['roles:read']),
  roleController.getAllPermissions
);

/**
 * POST /api/roles/permissions
 * Create a new permission
 * Requires roles:create permission
 */
router.post(
  '/permissions',
  authenticate,
  authorize.permissions(['roles:create']),
  roleController.createPermission
);

module.exports = router;
