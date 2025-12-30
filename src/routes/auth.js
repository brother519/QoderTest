/**
 * @file 认证路由
 * @description 处理用户认证相关的API路由
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

/** POST /auth/register - 用户注册 */
router.post(
  '/register',
  registerLimiter,
  validate(registerSchema),
  authController.register
);

/** POST /auth/login - 用户登录 */
router.post(
  '/login',
  loginLimiter,
  validate(loginSchema),
  authController.login
);

/** POST /auth/logout - 用户登出 */
router.post(
  '/logout',
  authenticate,
  validate(logoutSchema),
  authController.logout
);

/** POST /auth/refresh - 刷新访问令牌 */
router.post(
  '/refresh',
  validate(refreshTokenSchema),
  authController.refresh
);

/** POST /auth/revoke-all - 撤销所有会话 */
router.post(
  '/revoke-all',
  authenticate,
  authController.revokeAll
);

module.exports = router;