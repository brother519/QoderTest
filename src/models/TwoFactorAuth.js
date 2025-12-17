const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TwoFactorAuth = sequelize.define('TwoFactorAuth', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  secret: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  is_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  backup_codes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  enabled_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'two_factor_auth',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['user_id']
    }
  ]
});

module.exports = TwoFactorAuth;
