/**
 * @file 角色路由
 * @description 处理角色和权限相关的API路由
 */
const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { authenticate } = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

/** GET /roles - 获取所有角色 */
router.get(
  '/',
  authenticate,
  authorize.permissions(['roles:read']),
  roleController.getAllRoles
);

/** GET /roles/:id - 根据ID获取角色 */
router.get(
  '/:id',
  authenticate,
  authorize.permissions(['roles:read']),
  roleController.getRoleById
);

/** POST /roles - 创建新角色 */
router.post(
  '/',
  authenticate,
  authorize.permissions(['roles:create']),
  roleController.createRole
);

/** PATCH /roles/:id - 更新角色 */
router.patch(
  '/:id',
  authenticate,
  authorize.permissions(['roles:update']),
  roleController.updateRole
);

/** DELETE /roles/:id - 删除角色 */
router.delete(
  '/:id',
  authenticate,
  authorize.permissions(['roles:delete']),
  roleController.deleteRole
);

/** PATCH /roles/users/:id/roles - 为用户分配角色 */
router.patch(
  '/users/:id/roles',
  authenticate,
  authorize.permissions(['roles:assign']),
  roleController.assignRoles
);

/** GET /roles/permissions/all - 获取所有权限 */
router.get(
  '/permissions/all',
  authenticate,
  authorize.permissions(['roles:read']),
  roleController.getAllPermissions
);

/** POST /roles/permissions - 创建权限 */
router.post(
  '/permissions',
  authenticate,
  authorize.permissions(['roles:create']),
  roleController.createPermission
);

module.exports = router;