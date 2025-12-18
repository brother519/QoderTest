const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  twoFactor: {
    enabled: { type: Boolean, default: false },
    secret: { type: String, default: null },
    backupCodes: [{ type: String }]
  },
  passwordReset: {
    token: { type: String, default: null },
    expires: { type: Date, default: null },
    lastReset: { type: Date, default: null }
  },
  emailVerification: {
    token: { type: String, default: null },
    expires: { type: Date, default: null }
  },
  security: {
    failedAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    lastLogin: { type: Date, default: null }
  }
}, {
  timestamps: true
});

userSchema.index({ email: 1 });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isLocked = function() {
  return this.security.lockUntil && this.security.lockUntil > Date.now();
};

userSchema.methods.incrementFailedAttempts = async function() {
  this.security.failedAttempts += 1;
  
  if (this.security.failedAttempts >= 5) {
    let lockDuration = 15 * 60 * 1000;
    if (this.security.failedAttempts >= 15) {
      lockDuration = 24 * 60 * 60 * 1000;
    } else if (this.security.failedAttempts >= 10) {
      lockDuration = 60 * 60 * 1000;
    }
    this.security.lockUntil = new Date(Date.now() + lockDuration);
  }
  
  await this.save();
};

userSchema.methods.resetFailedAttempts = async function() {
  this.security.failedAttempts = 0;
  this.security.lockUntil = null;
  this.security.lastLogin = new Date();
  await this.save();
};

module.exports = mongoose.model('User', userSchema);
