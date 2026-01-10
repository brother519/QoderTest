import { query } from '../config/database';
import { Url, CreateUrlInput } from '../models';

export async function createUrl(input: CreateUrlInput, shortCode: string): Promise<Url> {
  const expiresAt = input.expires_in 
    ? new Date(Date.now() + input.expires_in * 1000) 
    : null;
  
  const result = await query(
    `INSERT INTO urls (short_code, original_url, custom_domain, title, expires_at, user_id, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      shortCode,
      input.original_url,
      input.custom_domain || null,
      input.title || null,
      expiresAt,
      input.user_id || null,
      JSON.stringify({}),
    ]
  );
  
  return result.rows[0];
}

export async function findByShortCode(shortCode: string): Promise<Url | null> {
  const result = await query(
    'SELECT * FROM urls WHERE short_code = $1',
    [shortCode]
  );
  
  return result.rows[0] || null;
}

export async function findByOriginalUrl(originalUrl: string): Promise<Url | null> {
  const result = await query(
    'SELECT * FROM urls WHERE original_url = $1 AND is_active = TRUE ORDER BY created_at DESC LIMIT 1',
    [originalUrl]
  );
  
  return result.rows[0] || null;
}

export async function findById(id: number): Promise<Url | null> {
  const result = await query(
    'SELECT * FROM urls WHERE id = $1',
    [id]
  );
  
  return result.rows[0] || null;
}

export async function updateClickCount(id: number): Promise<void> {
  await query(
    `UPDATE urls 
     SET click_count = click_count + 1, last_clicked_at = NOW()
     WHERE id = $1`,
    [id]
  );
}

export async function updateUrl(
  shortCode: string,
  updates: { is_active?: boolean; expires_at?: Date }
): Promise<Url | null> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;
  
  if (updates.is_active !== undefined) {
    fields.push(`is_active = $${paramCount}`);
    values.push(updates.is_active);
    paramCount++;
  }
  
  if (updates.expires_at !== undefined) {
    fields.push(`expires_at = $${paramCount}`);
    values.push(updates.expires_at);
    paramCount++;
  }
  
  if (fields.length === 0) {
    return await findByShortCode(shortCode);
  }
  
  values.push(shortCode);
  
  const result = await query(
    `UPDATE urls SET ${fields.join(', ')} WHERE short_code = $${paramCount} RETURNING *`,
    values
  );
  
  return result.rows[0] || null;
}

export async function softDelete(shortCode: string): Promise<boolean> {
  const result = await query(
    'UPDATE urls SET is_active = FALSE WHERE short_code = $1 RETURNING id',
    [shortCode]
  );
  
  return result.rowCount > 0;
}

export async function getTopUrls(limit: number = 10, days: number = 7): Promise<Url[]> {
  const result = await query(
    `SELECT * FROM urls 
     WHERE is_active = TRUE 
     AND created_at >= NOW() - INTERVAL '${days} days'
     ORDER BY click_count DESC 
     LIMIT $1`,
    [limit]
  );
  
  return result.rows;
}

export async function getTotalCount(): Promise<number> {
  const result = await query('SELECT COUNT(*) as count FROM urls');
  return parseInt(result.rows[0].count, 10);
}

export async function getActiveCount(): Promise<number> {
  const result = await query('SELECT COUNT(*) as count FROM urls WHERE is_active = TRUE');
  return parseInt(result.rows[0].count, 10);
}
