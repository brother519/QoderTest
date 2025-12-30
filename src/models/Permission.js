/**
 * Permission Model
 * 
 * Defines granular permissions for Role-Based Access Control (RBAC).
 * Permissions follow the pattern: resource:action
 * Examples: users:read, posts:delete, roles:manage
 */

const mongoose = require('mongoose');

/**
 * Permission Schema Definition
 */
const permissionSchema = new mongoose.Schema({
  // Resource being protected (e.g., 'users', 'posts', 'roles')
  resource: {
    type: String,
    required: [true, 'Resource is required'],
    trim: true
  },
  // Action allowed on the resource
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: ['create', 'read', 'update', 'delete', 'manage', '*'],
    trim: true
  },
  // Human-readable description of what this permission allows
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true  // Adds createdAt and updatedAt
});

// Compound unique index - each resource:action pair must be unique
permissionSchema.index({ resource: 1, action: 1 }, { unique: true });

/**
 * Virtual property for permission name
 * Returns the standard format: resource:action
 */
permissionSchema.virtual('name').get(function() {
  return `${this.resource}:${this.action}`;
});

// Include virtual properties in JSON and Object output
permissionSchema.set('toJSON', { virtuals: true });
permissionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Permission', permissionSchema);
