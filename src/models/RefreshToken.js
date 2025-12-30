/**
 * @file 刷新令牌模型
 * @description 定义刷新令牌数据结构和相关操作方法
 */
const mongoose = require('mongoose');
const { hashToken } = require('../utils/crypto');

/**
 * 刷新令牌模式
 * @type {mongoose.Schema}
 * @property {string} token - 令牌哈希值
 * @property {ObjectId} user - 用户引用
 * @property {Date} expiresAt - 过期时间
 * @property {boolean} isRevoked - 是否已撤销
 * @property {string} replacedBy - 替代令牌
 * @property {string} createdByIp - 创建时的IP地址
 * @property {Date} revokedAt - 撤销时间
 * @property {string} revokedByIp - 撤销时的IP地址
 */
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

/**
 * 虚拟属性：判断令牌是否已过期
 * @returns {boolean}
 */
refreshTokenSchema.virtual('isExpired').get(function() {
  return Date.now() >= this.expiresAt;
});

/**
 * 虚拟属性：判断令牌是否有效
 * @returns {boolean}
 */
refreshTokenSchema.virtual('isActive').get(function() {
  return !this.isRevoked && !this.isExpired;
});

/**
 * 创建新的刷新令牌
 * @static
 * @param {string} userId - 用户ID
 * @param {string} ip - 客户端IP地址
 * @returns {Promise<string>} 原始令牌字符串
 */
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

/**
 * 根据原始令牌查找记录
 * @static
 * @param {string} rawToken - 原始令牌
 * @returns {Promise<Object>} 令牌记录
 */
refreshTokenSchema.statics.findByToken = async function(rawToken) {
  const hashedToken = hashToken(rawToken);
  return this.findOne({ token: hashedToken });
};

/**
 * 撤销指定令牌
 * @static
 * @param {string} rawToken - 原始令牌
 * @param {string} ip - 客户端IP地址
 * @param {string} [replacedByToken] - 替代令牌
 * @returns {Promise<Object>} 更新结果
 */
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

/**
 * 撤销用户的所有令牌
 * @static
 * @param {string} userId - 用户ID
 * @param {string} ip - 客户端IP地址
 * @returns {Promise<Object>} 更新结果
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
 * 解析过期时间字符串为毫秒数
 * @param {string} expiresIn - 过期时间字符串 (如 "7d", "1h")
 * @returns {number} 毫秒数
 */
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