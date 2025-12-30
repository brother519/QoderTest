const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { authenticate } = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.get(
  '/',
  authenticate,
  authorize.permissions(['roles:read']),
  roleController.getAllRoles
);

router.get(
  '/:id',
  authenticate,
  authorize.permissions(['roles:read']),
  roleController.getRoleById
);

router.post(
  '/',
  authenticate,
  authorize.permissions(['roles:create']),
  roleController.createRole
);

router.patch(
  '/:id',
  authenticate,
  authorize.permissions(['roles:update']),
  roleController.updateRole
);

router.delete(
  '/:id',
  authenticate,
  authorize.permissions(['roles:delete']),
  roleController.deleteRole
);

router.patch(
  '/users/:id/roles',
  authenticate,
  authorize.permissions(['roles:assign']),
  roleController.assignRoles
);

router.get(
  '/permissions/all',
  authenticate,
  authorize.permissions(['roles:read']),
  roleController.getAllPermissions
);

router.post(
  '/permissions',
  authenticate,
  authorize.permissions(['roles:create']),
  roleController.createPermission
);

module.exports = router;
