const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LoginAttempt = sequelize.define('LoginAttempt', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: false
  },
  attempt_time: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  is_successful: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'login_attempts',
  timestamps: false,
  indexes: [
    {
      fields: ['email', 'attempt_time']
    },
    {
      fields: ['ip_address', 'attempt_time']
    }
  ]
});

module.exports = LoginAttempt;
