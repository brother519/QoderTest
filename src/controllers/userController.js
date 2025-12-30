/**
 * User Controller
 * 
 * HTTP request handlers for user management endpoints.
 * Handles profile retrieval, updates, and admin operations.
 */

const User = require('../models/User');
const { sanitizeUser } = require('../utils/validators');
const { ERROR_CODES } = require('../utils/constants');

/**
 * Get current authenticated user's profile
 * GET /api/users/me
 * 
 * @param {Object} req - Express request with authenticated user
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('roles');
    
    res.json({
      success: true,
      user: sanitizeUser(user)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update current authenticated user's profile
 * PATCH /api/users/me
 * 
 * @param {Object} req - Express request with update data in body
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const updateMe = async (req, res, next) => {
  try {
    const { email, username } = req.body;
    const userId = req.user._id;
    
    // Check email uniqueness if being updated
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        const error = new Error('Email already in use');
        error.code = ERROR_CODES.DUPLICATE_ERROR;
        error.status = 400;
        throw error;
      }
    }
    
    // Check username uniqueness if being updated
    if (username) {
      const existingUser = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUser) {
        const error = new Error('Username already in use');
        error.code = ERROR_CODES.DUPLICATE_ERROR;
        error.status = 400;
        throw error;
      }
    }
    
    // Build update object with only provided fields
    const updates = {};
    if (email) updates.email = email;
    if (username) updates.username = username;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('roles');
    
    res.json({
      success: true,
      user: sanitizeUser(user)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get paginated list of all users (admin only)
 * GET /api/users
 * 
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20)
 * - search: Search term for email/username
 * 
 * @param {Object} req - Express request with query params
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const search = req.query.search || '';
    
    // Build query with optional search filter
    const query = {};
    
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get total count and paginated results
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .populate('roles')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      users: users.map(sanitizeUser),
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific user by ID
 * GET /api/users/:id
 * 
 * @param {Object} req - Express request with user ID in params
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('roles');
    
    if (!user) {
      const error = new Error('User not found');
      error.code = ERROR_CODES.NOT_FOUND;
      error.status = 404;
      throw error;
    }
    
    res.json({
      success: true,
      user: sanitizeUser(user)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a user by ID (admin only)
 * DELETE /api/users/:id
 * 
 * @param {Object} req - Express request with user ID in params
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      const error = new Error('User not found');
      error.code = ERROR_CODES.NOT_FOUND;
      error.status = 404;
      throw error;
    }
    
    await user.deleteOne();
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMe,
  updateMe,
  getUsers,
  getUserById,
  deleteUser
};
