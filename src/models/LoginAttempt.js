const mongoose = require('mongoose');

const loginAttemptSchema = new mongoose.Schema({
  ipAddress: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  success: {
    type: Boolean,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

loginAttemptSchema.index({ ipAddress: 1 });
loginAttemptSchema.index({ email: 1 });
loginAttemptSchema.index({ timestamp: 1 }, { expireAfterSeconds: 3600 });

module.exports = mongoose.model('LoginAttempt', loginAttemptSchema);
