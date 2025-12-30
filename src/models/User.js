const mongoose = require('mongoose');
const { hashPassword, comparePassword, hashSecurityAnswer } = require('../utils/crypto');
const { LOCK_TIME, MAX_LOGIN_ATTEMPTS } = require('../utils/constants');

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

userSchema.virtual('isAccountLocked').get(function() {
  return this.isLocked && this.lockUntil && this.lockUntil > Date.now();
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  this.password = await hashPassword(this.password);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return comparePassword(candidatePassword, this.password);
};

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

userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $set: { loginAttempts: 0, isLocked: false },
    $unset: { lockUntil: 1 }
  });
};

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
