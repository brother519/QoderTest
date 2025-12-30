/**
 * Role Controller
 * 
 * HTTP request handlers for role and permission management endpoints.
 * Delegates business logic to RoleService.
 */

const roleService = require('../services/roleService');
const { sanitizeUser } = require('../utils/validators');

/**
 * Get all roles with permissions
 * GET /api/roles
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
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
 * Get a specific role by ID
 * GET /api/roles/:id
 * 
 * @param {Object} req - Express request with role ID in params
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
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
 * Create a new role
 * POST /api/roles
 * 
 * @param {Object} req - Express request with role data in body
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
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
 * Update an existing role
 * PATCH /api/roles/:id
 * 
 * @param {Object} req - Express request with role ID in params and updates in body
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
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
 * Delete a role
 * DELETE /api/roles/:id
 * 
 * @param {Object} req - Express request with role ID in params
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
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
 * Assign roles to a user
 * PATCH /api/roles/users/:id/roles
 * 
 * @param {Object} req - Express request with user ID in params and roles array in body
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
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
 * Get all defined permissions
 * GET /api/roles/permissions/all
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
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
 * Create a new permission
 * POST /api/roles/permissions
 * 
 * @param {Object} req - Express request with permission data in body
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
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
