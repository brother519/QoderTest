/**
 * @file 用户模型
 * @description 定义用户数据结构、验证规则和相关方法
 */
const mongoose = require('mongoose');
const { hashPassword, comparePassword, hashSecurityAnswer } = require('../utils/crypto');
const { LOCK_TIME, MAX_LOGIN_ATTEMPTS } = require('../utils/constants');

/**
 * 安全问题子模式
 * @type {mongoose.Schema}
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
 * 用户模式
 * @type {mongoose.Schema}
 * @property {string} email - 用户邮箱
 * @property {string} username - 用户名
 * @property {string} password - 密码(哈希存储)
 * @property {ObjectId[]} roles - 用户角色引用
 * @property {boolean} isActive - 账户是否激活
 * @property {boolean} isLocked - 账户是否锁定
 * @property {number} loginAttempts - 登录尝试次数
 * @property {Date} lockUntil - 锁定截止时间
 * @property {Array} securityQuestions - 安全问题列表
 * @property {Date} lastLogin - 最后登录时间
 */
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  roles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  securityQuestions: {
    type: [securityQuestionSchema],
    select: false
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ createdAt: -1 });

/**
 * 虚拟属性：判断账户是否处于锁定状态
 * @returns {boolean}
 */
userSchema.virtual('isAccountLocked').get(function() {
  return this.isLocked && this.lockUntil && this.lockUntil > Date.now();
});

/**
 * 保存前钩子：对密码进行哈希处理
 */
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  this.password = await hashPassword(this.password);
  next();
});

/**
 * 比较用户输入的密码与存储的密码哈希
 * @param {string} candidatePassword - 待验证的密码
 * @returns {Promise<boolean>} 密码是否匹配
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  return comparePassword(candidatePassword, this.password);
};

/**
 * 增加登录尝试次数，超过限制则锁定账户
 * @returns {Promise<Object>} 更新结果
 */
userSchema.methods.incLoginAttempts = async function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
    updates.$set = {
      lockUntil: new Date(Date.now() + LOCK_TIME),
      isLocked: true
    };
  }
  
  return this.updateOne(updates);
};

/**
 * 重置登录尝试次数和锁定状态
 * @returns {Promise<Object>} 更新结果
 */
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $set: { loginAttempts: 0, isLocked: false },
    $unset: { lockUntil: 1 }
  });
};

/**
 * 设置用户的安全问题
 * @param {Array<{question: string, answer: string}>} questions - 安全问题数组
 */
userSchema.methods.setSecurityQuestions = function(questions) {
  this.securityQuestions = questions.map(q => ({
    question: q.question,
    answerHash: hashSecurityAnswer(q.answer)
  }));
};

userSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.securityQuestions;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);