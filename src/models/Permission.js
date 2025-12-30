const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  resource: {
    type: String,
    required: [true, 'Resource is required'],
    trim: true
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: ['create', 'read', 'update', 'delete', 'manage', '*'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

permissionSchema.index({ resource: 1, action: 1 }, { unique: true });

permissionSchema.virtual('name').get(function() {
  return `${this.resource}:${this.action}`;
});

permissionSchema.set('toJSON', { virtuals: true });
permissionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Permission', permissionSchema);
