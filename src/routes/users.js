/**
 * @file 用户路由
 * @description 处理用户相关的API路由
 */
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { validate } = require('../middleware/validator');
const { updateUserSchema, userIdSchema, userListSchema } = require('../schemas/userSchemas');

/** GET /users/me - 获取当前用户信息 */
router.get('/me', authenticate, userController.getMe);

/** PATCH /users/me - 更新当前用户信息 */
router.patch(
  '/me',
  authenticate,
  validate(updateUserSchema),
  userController.updateMe
);

/** GET /users - 获取用户列表 */
router.get(
  '/',
  authenticate,
  authorize.permissions(['users:read']),
  validate(userListSchema),
  userController.getUsers
);

/** GET /users/:id - 根据ID获取用户 */
router.get(
  '/:id',
  authenticate,
  authorize.isOwnerOrHasPermission('id', ['users:read']),
  validate(userIdSchema),
  userController.getUserById
);

/** DELETE /users/:id - 删除用户 */
router.delete(
  '/:id',
  authenticate,
  authorize.permissions(['users:delete']),
  validate(userIdSchema),
  userController.deleteUser
);

module.exports = router;