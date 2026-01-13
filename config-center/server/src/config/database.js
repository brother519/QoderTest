const mysql = require('mysql2/promise');
const config = require('./app.config');

let pool = null;

async function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: config.mysql.host,
      port: config.mysql.port,
      user: config.mysql.user,
      password: config.mysql.password,
      database: config.mysql.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
  return pool;
}

async function query(sql, params = []) {
  const pool = await getPool();
  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function getConnection() {
  const pool = await getPool();
  return pool.getConnection();
}

module.exports = {
  getPool,
  query,
  getConnection
};
