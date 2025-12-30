const roleService = require('../services/roleService');
const { sanitizeUser } = require('../utils/validators');

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
