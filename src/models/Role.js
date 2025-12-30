/**
 * Role Model
 * 
 * Defines roles for Role-Based Access Control (RBAC).
 * Roles group permissions and can be assigned to users.
 * Examples: admin, user, moderator
 */

const mongoose = require('mongoose');

/**
 * Role Schema Definition
 */
const roleSchema = new mongoose.Schema({
  // Role identifier - unique, lowercase (e.g., 'admin', 'user')
  name: {
    type: String,
    required: [true, 'Role name is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  // Human-readable description of the role
  description: {
    type: String,
    trim: true
  },
  // Array of permission references
  permissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission'
  }]
}, {
  timestamps: true  // Adds createdAt and updatedAt
});

// Index for fast role lookups by name
roleSchema.index({ name: 1 });

module.exports = mongoose.model('Role', roleSchema);
