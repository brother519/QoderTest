import { pool } from '../../config/database';
import type { Article } from '../../types/search.types';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

export class ArticleService {
  async findById(id: number): Promise<Article | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM articles WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? this.mapRowToArticle(rows[0]) : null;
  }

  async findAll(limit = 100, offset = 0): Promise<Article[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM articles ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    return rows.map(this.mapRowToArticle);
  }

  async findByStatus(status: string, limit = 100): Promise<Article[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM articles WHERE status = ? ORDER BY created_at DESC LIMIT ?',
      [status, limit]
    );
    return rows.map(this.mapRowToArticle);
  }

  async findUpdatedSince(since: Date): Promise<Article[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM articles WHERE updated_at > ? ORDER BY updated_at ASC',
      [since]
    );
    return rows.map(this.mapRowToArticle);
  }

  async count(): Promise<number> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM articles'
    );
    return rows[0].count;
  }

  async create(article: Omit<Article, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO articles (title, description, content, author_id, author_name, category, tags, status, view_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        article.title,
        article.description || null,
        article.content,
        article.author_id,
        article.author_name || null,
        article.category || null,
        JSON.stringify(article.tags || []),
        article.status || 'draft',
        article.view_count || 0,
      ]
    );
    return result.insertId;
  }

  async update(id: number, article: Partial<Article>): Promise<boolean> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (article.title !== undefined) {
      fields.push('title = ?');
      values.push(article.title);
    }
    if (article.description !== undefined) {
      fields.push('description = ?');
      values.push(article.description);
    }
    if (article.content !== undefined) {
      fields.push('content = ?');
      values.push(article.content);
    }
    if (article.category !== undefined) {
      fields.push('category = ?');
      values.push(article.category);
    }
    if (article.tags !== undefined) {
      fields.push('tags = ?');
      values.push(JSON.stringify(article.tags));
    }
    if (article.status !== undefined) {
      fields.push('status = ?');
      values.push(article.status);
    }

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE articles SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM articles WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  private mapRowToArticle(row: RowDataPacket): Article {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      content: row.content,
      author_id: row.author_id,
      author_name: row.author_name,
      category: row.category,
      tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags,
      status: row.status,
      view_count: row.view_count,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}

export const articleService = new ArticleService();
