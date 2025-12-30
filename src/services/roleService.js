/**
 * @file 角色服务
 * @description 处理角色和权限管理
 */
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const User = require('../models/User');
const { ERROR_CODES } = require('../utils/constants');

/**
 * 角色服务类
 * @class RoleService
 */
class RoleService {
  /**
   * 获取所有角色
   * @async
   * @returns {Promise<Array>} 角色列表
   */
  async getAllRoles() {
    return Role.find().populate('permissions');
  }
  
  /**
   * 根据ID获取角色
   * @async
   * @param {string} roleId - 角色ID
   * @returns {Promise<Object>} 角色对象
   */
  async getRoleById(roleId) {
    const role = await Role.findById(roleId).populate('permissions');
    
    if (!role) {
      const error = new Error('Role not found');
      error.code = ERROR_CODES.NOT_FOUND;
      error.status = 404;
      throw error;
    }
    
    return role;
  }
  
  /**
   * 创建新角色
   * @async
   * @param {Object} roleData - 角色数据
   * @returns {Promise<Object>} 创建的角色
   */
  async createRole(roleData) {
    const { name, description, permissions } = roleData;
    
    const existingRole = await Role.findOne({ name: name.toLowerCase() });
    
    if (existingRole) {
      const error = new Error('Role already exists');
      error.code = ERROR_CODES.DUPLICATE_ERROR;
      error.status = 400;
      throw error;
    }
    
    const role = new Role({
      name: name.toLowerCase(),
      description,
      permissions: permissions || []
    });
    
    await role.save();
    return role.populate('permissions');
  }
  
  /**
   * 更新角色
   * @async
   * @param {string} roleId - 角色ID
   * @param {Object} updates - 更新数据
   * @returns {Promise<Object>} 更新后的角色
   */
  async updateRole(roleId, updates) {
    const role = await Role.findById(roleId);
    
    if (!role) {
      const error = new Error('Role not found');
      error.code = ERROR_CODES.NOT_FOUND;
      error.status = 404;
      throw error;
    }
    
    if (updates.name) {
      role.name = updates.name.toLowerCase();
    }
    if (updates.description !== undefined) {
      role.description = updates.description;
    }
    if (updates.permissions) {
      role.permissions = updates.permissions;
    }
    
    await role.save();
    return role.populate('permissions');
  }
  
  /**
   * 删除角色
   * @async
   * @param {string} roleId - 角色ID
   * @returns {Promise<Object>} 操作结果
   */
  async deleteRole(roleId) {
    const role = await Role.findById(roleId);
    
    if (!role) {
      const error = new Error('Role not found');
      error.code = ERROR_CODES.NOT_FOUND;
      error.status = 404;
      throw error;
    }
    
    await User.updateMany(
      { roles: roleId },
      { $pull: { roles: roleId } }
    );
    
    await role.deleteOne();
    return { success: true };
  }
  
  /**
   * 为用户分配角色
   * @async
   * @param {string} userId - 用户ID
   * @param {Array<string>} roleIds - 角色ID数组
   * @returns {Promise<Object>} 更新后的用户
   */
  async assignRolesToUser(userId, roleIds) {
    const user = await User.findById(userId);
    
    if (!user) {
      const error = new Error('User not found');
      error.code = ERROR_CODES.NOT_FOUND;
      error.status = 404;
      throw error;
    }
    
    const roles = await Role.find({ _id: { $in: roleIds } });
    
    if (roles.length !== roleIds.length) {
      const error = new Error('One or more roles not found');
      error.code = ERROR_CODES.NOT_FOUND;
      error.status = 404;
      throw error;
    }
    
    user.roles = roleIds;
    await user.save();
    
    return User.findById(userId).populate('roles');
  }
  
  /**
   * 获取用户的所有权限
   * @async
   * @param {string} userId - 用户ID
   * @returns {Promise<Array<string>>} 权限列表
   */
  async getUserPermissions(userId) {
    const user = await User.findById(userId).populate({
      path: 'roles',
      populate: {
        path: 'permissions'
      }
    });
    
    if (!user) {
      return [];
    }
    
    const permissions = new Set();
    
    for (const role of user.roles) {
      for (const permission of role.permissions) {
        permissions.add(permission.name);
      }
    }
    
    return Array.from(permissions);
  }
  
  /**
   * 检查用户是否拥有指定权限
   * @async
   * @param {string} userId - 用户ID
   * @param {string} requiredPermission - 所需权限
   * @returns {Promise<boolean>} 是否拥有权限
   */
  async checkPermission(userId, requiredPermission) {
    const permissions = await this.getUserPermissions(userId);
    
    if (permissions.includes('*:*')) {
      return true;
    }
    
    if (permissions.includes(requiredPermission)) {
      return true;
    }
    
    const [resource, action] = requiredPermission.split(':');
    
    if (permissions.includes(`${resource}:*`)) {
      return true;
    }
    
    if (permissions.includes(`*:${action}`)) {
      return true;
    }
    
    return false;
  }
  
  /**
   * 获取所有权限
   * @async
   * @returns {Promise<Array>} 权限列表
   */
  async getAllPermissions() {
    return Permission.find();
  }
  
  /**
   * 创建权限
   * @async
   * @param {Object} permissionData - 权限数据
   * @returns {Promise<Object>} 创建的权限
   */
  async createPermission(permissionData) {
    const { resource, action, description } = permissionData;
    
    const existingPermission = await Permission.findOne({ resource, action });
    
    if (existingPermission) {
      const error = new Error('Permission already exists');
      error.code = ERROR_CODES.DUPLICATE_ERROR;
      error.status = 400;
      throw error;
    }
    
    const permission = new Permission({
      resource,
      action,
      description
    });
    
    await permission.save();
    return permission;
  }
}

module.exports = new RoleService();