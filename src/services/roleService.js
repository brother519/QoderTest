/**
 * Role Service
 * 
 * Business logic for role and permission management.
 * Implements RBAC (Role-Based Access Control) operations.
 */

const Role = require('../models/Role');
const Permission = require('../models/Permission');
const User = require('../models/User');
const { ERROR_CODES } = require('../utils/constants');

class RoleService {
  /**
   * Get all roles with their permissions
   * @returns {Promise<Array>} - Array of role documents
   */
  async getAllRoles() {
    return Role.find().populate('permissions');
  }
  
  /**
   * Get a single role by ID
   * @param {string} roleId - Role's MongoDB ObjectId
   * @returns {Promise<Object>} - Role document with permissions
   * @throws {Error} - If role not found
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
   * Create a new role
   * @param {Object} roleData - Role creation data
   * @param {string} roleData.name - Role name (will be lowercased)
   * @param {string} roleData.description - Role description
   * @param {Array<string>} roleData.permissions - Permission IDs to assign
   * @returns {Promise<Object>} - Created role document
   * @throws {Error} - If role name already exists
   */
  async createRole(roleData) {
    const { name, description, permissions } = roleData;
    
    // Check for duplicate role name
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
   * Update an existing role
   * @param {string} roleId - Role ID to update
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} - Updated role document
   * @throws {Error} - If role not found
   */
  async updateRole(roleId, updates) {
    const role = await Role.findById(roleId);
    
    if (!role) {
      const error = new Error('Role not found');
      error.code = ERROR_CODES.NOT_FOUND;
      error.status = 404;
      throw error;
    }
    
    // Apply updates
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
   * Delete a role and remove it from all users
   * @param {string} roleId - Role ID to delete
   * @returns {Promise<Object>} - Success status
   * @throws {Error} - If role not found
   */
  async deleteRole(roleId) {
    const role = await Role.findById(roleId);
    
    if (!role) {
      const error = new Error('Role not found');
      error.code = ERROR_CODES.NOT_FOUND;
      error.status = 404;
      throw error;
    }
    
    // Remove role from all users who have it
    await User.updateMany(
      { roles: roleId },
      { $pull: { roles: roleId } }
    );
    
    await role.deleteOne();
    return { success: true };
  }
  
  /**
   * Assign roles to a user (replaces existing roles)
   * @param {string} userId - User ID to assign roles to
   * @param {Array<string>} roleIds - Array of role IDs
   * @returns {Promise<Object>} - Updated user document
   * @throws {Error} - If user or any role not found
   */
  async assignRolesToUser(userId, roleIds) {
    const user = await User.findById(userId);
    
    if (!user) {
      const error = new Error('User not found');
      error.code = ERROR_CODES.NOT_FOUND;
      error.status = 404;
      throw error;
    }
    
    // Verify all roles exist
    const roles = await Role.find({ _id: { $in: roleIds } });
    
    if (roles.length !== roleIds.length) {
      const error = new Error('One or more roles not found');
      error.code = ERROR_CODES.NOT_FOUND;
      error.status = 404;
      throw error;
    }
    
    // Replace user's roles
    user.roles = roleIds;
    await user.save();
    
    return User.findById(userId).populate('roles');
  }
  
  /**
   * Get all permissions for a user (aggregated from roles)
   * @param {string} userId - User ID
   * @returns {Promise<Array<string>>} - Array of permission names
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
    
    // Aggregate permissions from all roles
    const permissions = new Set();
    
    for (const role of user.roles) {
      for (const permission of role.permissions) {
        permissions.add(permission.name);
      }
    }
    
    return Array.from(permissions);
  }
  
  /**
   * Check if a user has a specific permission
   * Supports wildcard matching
   * @param {string} userId - User ID to check
   * @param {string} requiredPermission - Permission to check (format: resource:action)
   * @returns {Promise<boolean>} - True if user has permission
   */
  async checkPermission(userId, requiredPermission) {
    const permissions = await this.getUserPermissions(userId);
    
    // Super admin has all permissions
    if (permissions.includes('*:*')) {
      return true;
    }
    
    // Direct match
    if (permissions.includes(requiredPermission)) {
      return true;
    }
    
    const [resource, action] = requiredPermission.split(':');
    
    // Resource-level wildcard
    if (permissions.includes(`${resource}:*`)) {
      return true;
    }
    
    // Action-level wildcard
    if (permissions.includes(`*:${action}`)) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Get all defined permissions
   * @returns {Promise<Array>} - Array of permission documents
   */
  async getAllPermissions() {
    return Permission.find();
  }
  
  /**
   * Create a new permission
   * @param {Object} permissionData - Permission data
   * @param {string} permissionData.resource - Resource name
   * @param {string} permissionData.action - Action type
   * @param {string} permissionData.description - Permission description
   * @returns {Promise<Object>} - Created permission document
   * @throws {Error} - If permission already exists
   */
  async createPermission(permissionData) {
    const { resource, action, description } = permissionData;
    
    // Check for duplicate permission
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
