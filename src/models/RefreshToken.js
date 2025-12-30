/**
 * Refresh Token Model
 * 
 * Stores refresh tokens for JWT token rotation.
 * Features:
 * - Tokens are hashed before storage for security
 * - Supports token rotation (old tokens replaced by new)
 * - Tracks IP addresses for security auditing
 * - Automatic cleanup via TTL index on expiration
 */

const mongoose = require('mongoose');
const { hashToken } = require('../utils/crypto');

/**
 * Refresh Token Schema Definition
 */
const refreshTokenSchema = new mongoose.Schema({
  // SHA256 hash of the token (never store raw tokens)
  token: {
    type: String,
    required: true,
    unique: true
  },
  // Reference to the user who owns this token
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Expiration timestamp - TTL index auto-deletes expired tokens
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }  // MongoDB TTL index
  },
  // Flag indicating if token has been manually revoked
  isRevoked: {
    type: Boolean,
    default: false
  },
  // Hash of the replacement token (for token rotation tracking)
  replacedBy: {
    type: String
  },
  // IP address where token was created
  createdByIp: {
    type: String
  },
  // Timestamp when token was revoked
  revokedAt: {
    type: Date
  },
  // IP address where token was revoked
  revokedByIp: {
    type: String
  }
}, {
  timestamps: true  // Adds createdAt and updatedAt
});

// Database indexes for optimized queries
refreshTokenSchema.index({ user: 1 });
refreshTokenSchema.index({ token: 1 });

/**
 * Virtual property to check if token has expired
 */
refreshTokenSchema.virtual('isExpired').get(function() {
  return Date.now() >= this.expiresAt;
});

/**
 * Virtual property to check if token is still usable
 * Token must not be revoked and not expired
 */
refreshTokenSchema.virtual('isActive').get(function() {
  return !this.isRevoked && !this.isExpired;
});

/**
 * Static method to create and store a new refresh token
 * Returns the raw token to be sent to client (stored hash in DB)
 * 
 * @param {ObjectId} userId - User ID to associate with token
 * @param {string} ip - Client IP address for auditing
 * @returns {Promise<string>} - Raw token to send to client
 */
refreshTokenSchema.statics.createToken = async function(userId, ip) {
  const { generateRandomToken } = require('../utils/crypto');
  
  // Generate cryptographically secure random token
  const rawToken = generateRandomToken(40);
  const hashedToken = hashToken(rawToken);
  
  // Parse expiration time from environment
  const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
  const expiresMs = parseExpiration(expiresIn);
  
  // Store hashed token in database
  await this.create({
    token: hashedToken,
    user: userId,
    expiresAt: new Date(Date.now() + expiresMs),
    createdByIp: ip
  });
  
  // Return raw token for client storage
  return rawToken;
};

/**
 * Static method to find a token by its raw value
 * Hashes the input and searches for matching record
 * 
 * @param {string} rawToken - Raw token from client
 * @returns {Promise<Object|null>} - Token document or null
 */
refreshTokenSchema.statics.findByToken = async function(rawToken) {
  const hashedToken = hashToken(rawToken);
  return this.findOne({ token: hashedToken });
};

/**
 * Static method to revoke a specific token
 * Used during logout or token rotation
 * 
 * @param {string} rawToken - Token to revoke
 * @param {string} ip - IP address for audit trail
 * @param {string|null} replacedByToken - New token that replaces this one
 * @returns {Promise<Object>} - MongoDB update result
 */
refreshTokenSchema.statics.revokeToken = async function(rawToken, ip, replacedByToken = null) {
  const hashedToken = hashToken(rawToken);
  const update = {
    isRevoked: true,
    revokedAt: new Date(),
    revokedByIp: ip
  };
  
  // Track replacement for token rotation
  if (replacedByToken) {
    update.replacedBy = hashToken(replacedByToken);
  }
  
  return this.updateOne({ token: hashedToken }, { $set: update });
};

/**
 * Static method to revoke all tokens for a user
 * Used for force logout or security breach response
 * 
 * @param {ObjectId} userId - User whose tokens to revoke
 * @param {string} ip - IP address for audit trail
 * @returns {Promise<Object>} - MongoDB update result
 */
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

/**
 * Parse duration string to milliseconds
 * Supports: s (seconds), m (minutes), h (hours), d (days)
 * 
 * @param {string} expiresIn - Duration string (e.g., "7d", "24h")
 * @returns {number} - Duration in milliseconds
 */
function parseExpiration(expiresIn) {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) {
    // Default to 7 days if invalid format
    return 7 * 24 * 60 * 60 * 1000;
  }
  
  const value = parseInt(match[1], 10);
  const unit = match[2];
  
  switch (unit) {
    case 's': return value * 1000;                    // Seconds
    case 'm': return value * 60 * 1000;               // Minutes
    case 'h': return value * 60 * 60 * 1000;          // Hours
    case 'd': return value * 24 * 60 * 60 * 1000;     // Days
    default: return 7 * 24 * 60 * 60 * 1000;
  }
}

// Include virtual properties in JSON output
refreshTokenSchema.set('toJSON', { virtuals: true });
refreshTokenSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
