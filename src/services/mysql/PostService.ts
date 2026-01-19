import { pool } from '../../config/database';
import type { Post } from '../../types/search.types';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

export class PostService {
  async findById(id: number): Promise<Post | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM posts WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? this.mapRowToPost(rows[0]) : null;
  }

  async findAll(limit = 100, offset = 0): Promise<Post[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM posts ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    return rows.map(this.mapRowToPost);
  }

  async findByStatus(status: string, limit = 100): Promise<Post[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM posts WHERE status = ? ORDER BY created_at DESC LIMIT ?',
      [status, limit]
    );
    return rows.map(this.mapRowToPost);
  }

  async findUpdatedSince(since: Date): Promise<Post[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM posts WHERE updated_at > ? ORDER BY updated_at ASC',
      [since]
    );
    return rows.map(this.mapRowToPost);
  }

  async count(): Promise<number> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM posts'
    );
    return rows[0].count;
  }

  async create(post: Omit<Post, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO posts (title, content, user_id, user_name, topic, tags, like_count, comment_count, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        post.title,
        post.content,
        post.user_id,
        post.user_name || null,
        post.topic || null,
        JSON.stringify(post.tags || []),
        post.like_count || 0,
        post.comment_count || 0,
        post.status || 'normal',
      ]
    );
    return result.insertId;
  }

  async update(id: number, post: Partial<Post>): Promise<boolean> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (post.title !== undefined) {
      fields.push('title = ?');
      values.push(post.title);
    }
    if (post.content !== undefined) {
      fields.push('content = ?');
      values.push(post.content);
    }
    if (post.topic !== undefined) {
      fields.push('topic = ?');
      values.push(post.topic);
    }
    if (post.tags !== undefined) {
      fields.push('tags = ?');
      values.push(JSON.stringify(post.tags));
    }
    if (post.status !== undefined) {
      fields.push('status = ?');
      values.push(post.status);
    }

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE posts SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM posts WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  private mapRowToPost(row: RowDataPacket): Post {
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      user_id: row.user_id,
      user_name: row.user_name,
      topic: row.topic,
      tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags,
      like_count: row.like_count,
      comment_count: row.comment_count,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}

export const postService = new PostService();
