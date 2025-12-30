/**
 * @file 权限模型
 * @description 定义系统权限数据结构
 */
const mongoose = require('mongoose');

/**
 * 权限模式
 * @type {mongoose.Schema}
 * @property {string} resource - 资源名称
 * @property {string} action - 操作类型 (create/read/update/delete/manage/*)
 * @property {string} description - 权限描述
 */
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

/**
 * 虚拟属性：获取权限名称 (resource:action格式)
 * @returns {string}
 */
permissionSchema.virtual('name').get(function() {
  return `${this.resource}:${this.action}`;
});

permissionSchema.set('toJSON', { virtuals: true });
permissionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Permission', permissionSchema);