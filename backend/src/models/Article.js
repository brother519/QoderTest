const { getDatabase } = require('../config/database');

class Article {
  static findAll(filters = {}, pagination = {}) {
    const db = getDatabase();
    const { status } = filters;
    const { page = 1, limit = 10 } = pagination;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM articles';
    const params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const stmt = db.prepare(query);
    const articles = stmt.all(...params);

    return articles;
  }

  static findById(id) {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM articles WHERE id = ?');
    return stmt.get(id);
  }

  static create(data) {
    const db = getDatabase();
    const { title, content, author = 'Anonymous', status = 'draft' } = data;

    const stmt = db.prepare(`
      INSERT INTO articles (title, content, author, status)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(title, content, author, status);
    return this.findById(result.lastInsertRowid);
  }

  static update(id, data) {
    const db = getDatabase();
    const { title, content, author, status } = data;

    const stmt = db.prepare(`
      UPDATE articles 
      SET title = ?, content = ?, author = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(title, content, author, status, id);
    return this.findById(id);
  }

  static delete(id) {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM articles WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static count(filters = {}) {
    const db = getDatabase();
    const { status } = filters;

    let query = 'SELECT COUNT(*) as count FROM articles';
    const params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    const stmt = db.prepare(query);
    const result = stmt.get(...params);
    return result.count;
  }
}

module.exports = Article;
