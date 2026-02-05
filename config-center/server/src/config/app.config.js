require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  
  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'config_center'
  },
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || ''
  },
  
  cache: {
    ttl: 300, // 5 minutes
    prefix: 'config:'
  },
  
  websocket: {
    heartbeatInterval: 30000, // 30 seconds
    heartbeatTimeout: 10000   // 10 seconds
  }
};
