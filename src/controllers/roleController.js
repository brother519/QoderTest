/**
 * @file 角色控制器
 * @description 处理角色和权限相关的HTTP请求
 */
const roleService = require('../services/roleService');
const { sanitizeUser } = require('../utils/validators');

/**
 * 获取所有角色
 * @async
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - 下一个中间件
 */
const getAllRoles = async (req, res, next) => {
  try {
    const roles = await roleService.getAllRoles();
    
    res.json({
      success: true,
      roles
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 根据ID获取角色
 * @async
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - 下一个中间件
 */
const getRoleById = async (req, res, next) => {
  try {
    const role = await roleService.getRoleById(req.params.id);
    
    res.json({
      success: true,
      role
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 创建新角色
 * @async
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - 下一个中间件
 */
const createRole = async (req, res, next) => {
  try {
    const role = await roleService.createRole(req.body);
    
    res.status(201).json({
      success: true,
      role
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新角色
 * @async
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - 下一个中间件
 */
const updateRole = async (req, res, next) => {
  try {
    const role = await roleService.updateRole(req.params.id, req.body);
    
    res.json({
      success: true,
      role
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 删除角色
 * @async
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - 下一个中间件
 */
const deleteRole = async (req, res, next) => {
  try {
    await roleService.deleteRole(req.params.id);
    
    res.json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 为用户分配角色
 * @async
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - 下一个中间件
 */
const assignRoles = async (req, res, next) => {
  try {
    const { roles } = req.body;
    const user = await roleService.assignRolesToUser(req.params.id, roles);
    
    res.json({
      success: true,
      user: sanitizeUser(user)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取所有权限
 * @async
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - 下一个中间件
 */
const getAllPermissions = async (req, res, next) => {
  try {
    const permissions = await roleService.getAllPermissions();
    
    res.json({
      success: true,
      permissions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 创建权限
 * @async
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - 下一个中间件
 */
const createPermission = async (req, res, next) => {
  try {
    const permission = await roleService.createPermission(req.body);
    
    res.status(201).json({
      success: true,
      permission
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  assignRoles,
  getAllPermissions,
  createPermission
};