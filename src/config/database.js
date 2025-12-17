require('dotenv').config();
const { Sequelize } = require('sequelize');
const path = require('path');
const logger = require('../utils/logger');

const dbPath = process.env.DATABASE_PATH || './database/development.sqlite';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.resolve(dbPath),
  logging: (msg) => logger.debug(msg),
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true
  }
});

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
  } catch (error) {
    logger.error('Unable to connect to database:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  testConnection
};
