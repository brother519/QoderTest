import { query } from '../config/database';
import { Link, CreateLinkInput, UpdateLinkInput } from '../types/models';

export async function createLink(userId: number, input: CreateLinkInput, shortCode: string): Promise<Link> {
  const result = await query(
    `INSERT INTO links (short_code, original_url, user_id, title, description, expires_at, custom_domain_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      shortCode,
      input.original_url,
      userId,
      input.title || null,
      input.description || null,
      input.expires_at || null,
      input.custom_domain_id || null,
    ]
  );

  return result.rows[0];
}

export async function findLinkByShortCode(shortCode: string): Promise<Link | null> {
  const result = await query(
    'SELECT * FROM links WHERE short_code = $1',
    [shortCode]
  );
  return result.rows[0] || null;
}

export async function findLinkById(id: number): Promise<Link | null> {
  const result = await query('SELECT * FROM links WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function findLinksByUserId(
  userId: number,
  page: number = 1,
  limit: number = 20
): Promise<{ links: Link[]; total: number }> {
  const offset = (page - 1) * limit;

  const [linksResult, countResult] = await Promise.all([
    query(
      `SELECT * FROM links 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    ),
    query('SELECT COUNT(*) as total FROM links WHERE user_id = $1', [userId]),
  ]);

  return {
    links: linksResult.rows,
    total: parseInt(countResult.rows[0].total, 10),
  };
}

export async function updateLink(id: number, userId: number, input: UpdateLinkInput): Promise<Link | null> {
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (input.title !== undefined) {
    updates.push(`title = $${paramIndex++}`);
    values.push(input.title);
  }
  if (input.description !== undefined) {
    updates.push(`description = $${paramIndex++}`);
    values.push(input.description);
  }
  if (input.expires_at !== undefined) {
    updates.push(`expires_at = $${paramIndex++}`);
    values.push(input.expires_at);
  }
  if (input.is_active !== undefined) {
    updates.push(`is_active = $${paramIndex++}`);
    values.push(input.is_active);
  }

  if (updates.length === 0) {
    return findLinkById(id);
  }

  values.push(id, userId);

  const result = await query(
    `UPDATE links 
     SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
     WHERE id = $${paramIndex++} AND user_id = $${paramIndex}
     RETURNING *`,
    values
  );

  return result.rows[0] || null;
}

export async function deleteLink(id: number, userId: number): Promise<boolean> {
  const result = await query(
    'DELETE FROM links WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function incrementClickCount(linkId: number): Promise<void> {
  await query(
    'UPDATE links SET click_count = click_count + 1 WHERE id = $1',
    [linkId]
  );
}

export async function updateQrCodePath(linkId: number, path: string): Promise<void> {
  await query(
    'UPDATE links SET qr_code_path = $1 WHERE id = $2',
    [path, linkId]
  );
}

export async function getActiveLink(shortCode: string): Promise<Link | null> {
  const result = await query(
    `SELECT * FROM links 
     WHERE short_code = $1 
       AND is_active = true 
       AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)`,
    [shortCode]
  );
  return result.rows[0] || null;
}

export async function getTopLinks(userId: number, limit: number = 10): Promise<Link[]> {
  const result = await query(
    `SELECT * FROM links 
     WHERE user_id = $1 
     ORDER BY click_count DESC 
     LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
}
