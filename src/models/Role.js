/**
 * @file 角色模型
 * @description 定义系统角色数据结构
 */
const mongoose = require('mongoose');

/**
 * 角色模式
 * @type {mongoose.Schema}
 * @property {string} name - 角色名称
 * @property {string} description - 角色描述
 * @property {ObjectId[]} permissions - 权限引用列表
 */
const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Role name is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  description: {
    type: String,
    trim: true
  },
  permissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission'
  }]
}, {
  timestamps: true
});

roleSchema.index({ name: 1 });

module.exports = mongoose.model('Role', roleSchema);