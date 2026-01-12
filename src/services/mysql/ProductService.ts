import { pool } from '../../config/database';
import type { Product } from '../../types/search.types';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

export class ProductService {
  async findById(id: number): Promise<Product | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? this.mapRowToProduct(rows[0]) : null;
  }

  async findAll(limit = 100, offset = 0): Promise<Product[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM products ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    return rows.map(this.mapRowToProduct);
  }

  async findByStatus(status: string, limit = 100): Promise<Product[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM products WHERE status = ? ORDER BY created_at DESC LIMIT ?',
      [status, limit]
    );
    return rows.map(this.mapRowToProduct);
  }

  async findUpdatedSince(since: Date): Promise<Product[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM products WHERE updated_at > ? ORDER BY updated_at ASC',
      [since]
    );
    return rows.map(this.mapRowToProduct);
  }

  async count(): Promise<number> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM products'
    );
    return rows[0].count;
  }

  async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO products (name, description, detail, brand, category, price, stock, sales_count, tags, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product.name,
        product.description || null,
        product.detail || null,
        product.brand || null,
        product.category || null,
        product.price || null,
        product.stock || 0,
        product.sales_count || 0,
        JSON.stringify(product.tags || []),
        product.status || 'available',
      ]
    );
    return result.insertId;
  }

  async update(id: number, product: Partial<Product>): Promise<boolean> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (product.name !== undefined) {
      fields.push('name = ?');
      values.push(product.name);
    }
    if (product.description !== undefined) {
      fields.push('description = ?');
      values.push(product.description);
    }
    if (product.detail !== undefined) {
      fields.push('detail = ?');
      values.push(product.detail);
    }
    if (product.brand !== undefined) {
      fields.push('brand = ?');
      values.push(product.brand);
    }
    if (product.category !== undefined) {
      fields.push('category = ?');
      values.push(product.category);
    }
    if (product.price !== undefined) {
      fields.push('price = ?');
      values.push(product.price);
    }
    if (product.stock !== undefined) {
      fields.push('stock = ?');
      values.push(product.stock);
    }
    if (product.tags !== undefined) {
      fields.push('tags = ?');
      values.push(JSON.stringify(product.tags));
    }
    if (product.status !== undefined) {
      fields.push('status = ?');
      values.push(product.status);
    }

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE products SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM products WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  private mapRowToProduct(row: RowDataPacket): Product {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      detail: row.detail,
      brand: row.brand,
      category: row.category,
      price: row.price ? parseFloat(row.price) : undefined,
      stock: row.stock,
      sales_count: row.sales_count,
      tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}

export const productService = new ProductService();
