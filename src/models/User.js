/**
 * User Model
 * 
 * Defines the user schema for MongoDB with authentication features including:
 * - Password hashing with bcrypt
 * - Account locking after failed login attempts
 * - Security questions for password reset
 * - Role-based access control (RBAC)
 */

const mongoose = require('mongoose');
const { hashPassword, comparePassword, hashSecurityAnswer } = require('../utils/crypto');
const { LOCK_TIME, MAX_LOGIN_ATTEMPTS } = require('../utils/constants');

/**
 * Security Question Sub-schema
 * Stores encrypted security questions and answers for password recovery
 */
const securityQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  answerHash: {
    type: String,
    required: true
  }
}, { _id: false });

/**
 * User Schema Definition
 * Main schema for storing user account information
 */
const userSchema = new mongoose.Schema({
  // User's email address - unique identifier for login
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email']
  },
  // Username for display purposes - must be unique
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  // Hashed password - excluded from queries by default
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  // Array of role references for RBAC
  roles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  }],
  // Account status flag
  isActive: {
    type: Boolean,
    default: true
  },
  // Account lock status for brute force protection
  isLocked: {
    type: Boolean,
    default: false
  },
  // Counter for failed login attempts
  loginAttempts: {
    type: Number,
    default: 0
  },
  // Timestamp when account lock expires
  lockUntil: {
    type: Date
  },
  // Security questions for password reset - excluded from queries by default
  securityQuestions: {
    type: [securityQuestionSchema],
    select: false
  },
  // Last successful login timestamp
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Database indexes for optimized queries
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ createdAt: -1 });

/**
 * Virtual property to check if account is currently locked
 * Returns true if account is locked and lock period hasn't expired
 */
userSchema.virtual('isAccountLocked').get(function() {
  return this.isLocked && this.lockUntil && this.lockUntil > Date.now();
});

/**
 * Pre-save middleware to hash password
 * Only hashes password if it has been modified
 */
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  this.password = await hashPassword(this.password);
  next();
});

/**
 * Instance method to compare candidate password with stored hash
 * @param {string} candidatePassword - Plain text password to verify
 * @returns {Promise<boolean>} - True if password matches
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  return comparePassword(candidatePassword, this.password);
};

/**
 * Instance method to increment failed login attempts
 * Locks account after MAX_LOGIN_ATTEMPTS failures
 */
userSchema.methods.incLoginAttempts = async function() {
  // Reset attempts if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account if max attempts reached
  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
    updates.$set = {
      lockUntil: new Date(Date.now() + LOCK_TIME),
      isLocked: true
    };
  }
  
  return this.updateOne(updates);
};

/**
 * Instance method to reset login attempts after successful login
 */
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $set: { loginAttempts: 0, isLocked: false },
    $unset: { lockUntil: 1 }
  });
};

/**
 * Instance method to set security questions with hashed answers
 * @param {Array} questions - Array of {question, answer} objects
 */
userSchema.methods.setSecurityQuestions = function(questions) {
  this.securityQuestions = questions.map(q => ({
    question: q.question,
    answerHash: hashSecurityAnswer(q.answer)
  }));
};

/**
 * Transform function to remove sensitive fields from JSON output
 */
userSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.securityQuestions;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);
