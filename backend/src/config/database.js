const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const dbPath = path.join(__dirname, '../../', process.env.DATABASE_PATH || './database/blog.db');

let db = null;

function getDatabase() {
  if (!db) {
    db = new Database(dbPath, { verbose: console.log });
    db.pragma('journal_mode = WAL');
  }
  return db;
}

function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = {
  getDatabase,
  closeDatabase
};
