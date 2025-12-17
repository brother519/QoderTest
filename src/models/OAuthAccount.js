const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OAuthAccount = sequelize.define('OAuthAccount', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  provider: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: [['github', 'google', 'microsoft', 'facebook']]
    }
  },
  provider_user_id: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  provider_email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  access_token: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  refresh_token: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  token_expires_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'oauth_accounts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['provider', 'provider_user_id']
    },
    {
      fields: ['user_id']
    }
  ]
});

module.exports = OAuthAccount;
