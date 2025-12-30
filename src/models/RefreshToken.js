const mongoose = require('mongoose');
const { hashToken } = require('../utils/crypto');

const refreshTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }
  },
  isRevoked: {
    type: Boolean,
    default: false
  },
  replacedBy: {
    type: String
  },
  createdByIp: {
    type: String
  },
  revokedAt: {
    type: Date
  },
  revokedByIp: {
    type: String
  }
}, {
  timestamps: true
});

refreshTokenSchema.index({ user: 1 });
refreshTokenSchema.index({ token: 1 });

refreshTokenSchema.virtual('isExpired').get(function() {
  return Date.now() >= this.expiresAt;
});

refreshTokenSchema.virtual('isActive').get(function() {
  return !this.isRevoked && !this.isExpired;
});

refreshTokenSchema.statics.createToken = async function(userId, ip) {
  const { generateRandomToken } = require('../utils/crypto');
  const rawToken = generateRandomToken(40);
  const hashedToken = hashToken(rawToken);
  
  const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
  const expiresMs = parseExpiration(expiresIn);
  
  await this.create({
    token: hashedToken,
    user: userId,
    expiresAt: new Date(Date.now() + expiresMs),
    createdByIp: ip
  });
  
  return rawToken;
};

refreshTokenSchema.statics.findByToken = async function(rawToken) {
  const hashedToken = hashToken(rawToken);
  return this.findOne({ token: hashedToken });
};

refreshTokenSchema.statics.revokeToken = async function(rawToken, ip, replacedByToken = null) {
  const hashedToken = hashToken(rawToken);
  const update = {
    isRevoked: true,
    revokedAt: new Date(),
    revokedByIp: ip
  };
  
  if (replacedByToken) {
    update.replacedBy = hashToken(replacedByToken);
  }
  
  return this.updateOne({ token: hashedToken }, { $set: update });
};

refreshTokenSchema.statics.revokeAllUserTokens = async function(userId, ip) {
  return this.updateMany(
    { user: userId, isRevoked: false },
    {
      $set: {
        isRevoked: true,
        revokedAt: new Date(),
        revokedByIp: ip
      }
    }
  );
};

function parseExpiration(expiresIn) {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }
  
  const value = parseInt(match[1], 10);
  const unit = match[2];
  
  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return 7 * 24 * 60 * 60 * 1000;
  }
}

refreshTokenSchema.set('toJSON', { virtuals: true });
refreshTokenSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
