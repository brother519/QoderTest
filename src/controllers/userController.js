const User = require('../models/User');
const { sanitizeUser } = require('../utils/validators');
const { ERROR_CODES } = require('../utils/constants');

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

const updateMe = async (req, res, next) => {
  try {
    const { email, username } = req.body;
    const userId = req.user._id;
    
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        const error = new Error('Email already in use');
        error.code = ERROR_CODES.DUPLICATE_ERROR;
        error.status = 400;
        throw error;
      }
    }
    
    if (username) {
      const existingUser = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUser) {
        const error = new Error('Username already in use');
        error.code = ERROR_CODES.DUPLICATE_ERROR;
        error.status = 400;
        throw error;
      }
    }
    
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

const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const search = req.query.search || '';
    
    const query = {};
    
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }
    
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
