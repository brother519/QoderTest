import { query } from '../config/database';
import { Click, CreateClickInput } from '../types/models';

export async function createClick(input: CreateClickInput): Promise<Click> {
  const result = await query(
    `INSERT INTO clicks (
      link_id, ip_address, country, city, latitude, longitude,
      referer, user_agent, browser, os, device_type
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *`,
    [
      input.link_id,
      input.ip_address || null,
      input.country || null,
      input.city || null,
      input.latitude || null,
      input.longitude || null,
      input.referer || null,
      input.user_agent || null,
      input.browser || null,
      input.os || null,
      input.device_type || null,
    ]
  );

  return result.rows[0];
}

export async function getClicksByLinkId(
  linkId: number,
  page: number = 1,
  limit: number = 50
): Promise<{ clicks: Click[]; total: number }> {
  const offset = (page - 1) * limit;

  const [clicksResult, countResult] = await Promise.all([
    query(
      `SELECT * FROM clicks 
       WHERE link_id = $1 
       ORDER BY clicked_at DESC 
       LIMIT $2 OFFSET $3`,
      [linkId, limit, offset]
    ),
    query('SELECT COUNT(*) as total FROM clicks WHERE link_id = $1', [linkId]),
  ]);

  return {
    clicks: clicksResult.rows,
    total: parseInt(countResult.rows[0].total, 10),
  };
}

export async function getClickCountByLinkId(linkId: number): Promise<number> {
  const result = await query(
    'SELECT COUNT(*) as count FROM clicks WHERE link_id = $1',
    [linkId]
  );
  return parseInt(result.rows[0].count, 10);
}

export async function getClicksByCountry(linkId: number): Promise<{ country: string; count: number }[]> {
  const result = await query(
    `SELECT country, COUNT(*) as count 
     FROM clicks 
     WHERE link_id = $1 AND country IS NOT NULL
     GROUP BY country 
     ORDER BY count DESC 
     LIMIT 20`,
    [linkId]
  );
  return result.rows.map(row => ({
    country: row.country,
    count: parseInt(row.count, 10),
  }));
}

export async function getClicksByBrowser(linkId: number): Promise<{ browser: string; count: number }[]> {
  const result = await query(
    `SELECT browser, COUNT(*) as count 
     FROM clicks 
     WHERE link_id = $1 AND browser IS NOT NULL
     GROUP BY browser 
     ORDER BY count DESC`,
    [linkId]
  );
  return result.rows.map(row => ({
    browser: row.browser,
    count: parseInt(row.count, 10),
  }));
}

export async function getClicksByOS(linkId: number): Promise<{ os: string; count: number }[]> {
  const result = await query(
    `SELECT os, COUNT(*) as count 
     FROM clicks 
     WHERE link_id = $1 AND os IS NOT NULL
     GROUP BY os 
     ORDER BY count DESC`,
    [linkId]
  );
  return result.rows.map(row => ({
    os: row.os,
    count: parseInt(row.count, 10),
  }));
}

export async function getClicksByDeviceType(linkId: number): Promise<{ device_type: string; count: number }[]> {
  const result = await query(
    `SELECT device_type, COUNT(*) as count 
     FROM clicks 
     WHERE link_id = $1 AND device_type IS NOT NULL
     GROUP BY device_type 
     ORDER BY count DESC`,
    [linkId]
  );
  return result.rows.map(row => ({
    device_type: row.device_type,
    count: parseInt(row.count, 10),
  }));
}

export async function getClicksByDate(
  linkId: number,
  days: number = 30
): Promise<{ date: string; count: number }[]> {
  const result = await query(
    `SELECT DATE(clicked_at) as date, COUNT(*) as count 
     FROM clicks 
     WHERE link_id = $1 AND clicked_at >= CURRENT_DATE - INTERVAL '${days} days'
     GROUP BY DATE(clicked_at) 
     ORDER BY date ASC`,
    [linkId]
  );
  return result.rows.map(row => ({
    date: row.date.toISOString().split('T')[0],
    count: parseInt(row.count, 10),
  }));
}

export async function getTopReferers(linkId: number, limit: number = 10): Promise<{ referer: string; count: number }[]> {
  const result = await query(
    `SELECT referer, COUNT(*) as count 
     FROM clicks 
     WHERE link_id = $1 AND referer IS NOT NULL AND referer != ''
     GROUP BY referer 
     ORDER BY count DESC 
     LIMIT $2`,
    [linkId, limit]
  );
  return result.rows.map(row => ({
    referer: row.referer,
    count: parseInt(row.count, 10),
  }));
}

export async function getUniqueVisitors(linkId: number): Promise<number> {
  const result = await query(
    'SELECT COUNT(DISTINCT ip_address) as count FROM clicks WHERE link_id = $1',
    [linkId]
  );
  return parseInt(result.rows[0].count, 10);
}
