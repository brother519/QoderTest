const Role = require('../models/Role');
const Permission = require('../models/Permission');
const User = require('../models/User');
const { ERROR_CODES } = require('../utils/constants');

class RoleService {
  async getAllRoles() {
    return Role.find().populate('permissions');
  }
  
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
  
  async getAllPermissions() {
    return Permission.find();
  }
  
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
