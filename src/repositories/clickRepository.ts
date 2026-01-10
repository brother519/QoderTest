import { query } from '../config/database';
import { Click, ClickInput } from '../models';

export async function recordClick(clickData: ClickInput): Promise<Click> {
  const result = await query(
    `INSERT INTO clicks (url_id, ip_address, user_agent, referer, country, city, device_type, browser, os)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      clickData.url_id,
      clickData.ip_address || null,
      clickData.user_agent || null,
      clickData.referer || null,
      clickData.country || null,
      clickData.city || null,
      clickData.device_type || null,
      clickData.browser || null,
      clickData.os || null,
    ]
  );
  
  return result.rows[0];
}

export async function getTotalClicks(): Promise<number> {
  const result = await query('SELECT COUNT(*) as count FROM clicks');
  return parseInt(result.rows[0].count, 10);
}

export async function getClicksToday(): Promise<number> {
  const result = await query(
    `SELECT COUNT(*) as count FROM clicks 
     WHERE clicked_at >= CURRENT_DATE`
  );
  return parseInt(result.rows[0].count, 10);
}

export async function getClicksByUrlId(
  urlId: number,
  startDate?: Date,
  endDate?: Date
): Promise<Click[]> {
  let sql = 'SELECT * FROM clicks WHERE url_id = $1';
  const params: any[] = [urlId];
  
  if (startDate) {
    params.push(startDate);
    sql += ` AND clicked_at >= $${params.length}`;
  }
  
  if (endDate) {
    params.push(endDate);
    sql += ` AND clicked_at <= $${params.length}`;
  }
  
  sql += ' ORDER BY clicked_at DESC';
  
  const result = await query(sql, params);
  return result.rows;
}

export async function getClicksByDate(
  urlId: number,
  days: number = 7
): Promise<Array<{ date: string; clicks: number }>> {
  const result = await query(
    `SELECT DATE(clicked_at) as date, COUNT(*) as clicks
     FROM clicks
     WHERE url_id = $1 AND clicked_at >= NOW() - INTERVAL '${days} days'
     GROUP BY DATE(clicked_at)
     ORDER BY date DESC`,
    [urlId]
  );
  
  return result.rows.map((row) => ({
    date: row.date.toISOString().split('T')[0],
    clicks: parseInt(row.clicks, 10),
  }));
}

export async function getTopCountries(
  urlId: number,
  limit: number = 5
): Promise<Array<{ country: string; clicks: number }>> {
  const result = await query(
    `SELECT country, COUNT(*) as clicks
     FROM clicks
     WHERE url_id = $1 AND country IS NOT NULL
     GROUP BY country
     ORDER BY clicks DESC
     LIMIT $2`,
    [urlId, limit]
  );
  
  return result.rows.map((row) => ({
    country: row.country,
    clicks: parseInt(row.clicks, 10),
  }));
}

export async function getTopReferers(
  urlId: number,
  limit: number = 5
): Promise<Array<{ referer: string; clicks: number }>> {
  const result = await query(
    `SELECT 
       CASE 
         WHEN referer IS NULL OR referer = '' THEN 'direct'
         ELSE referer
       END as referer,
       COUNT(*) as clicks
     FROM clicks
     WHERE url_id = $1
     GROUP BY referer
     ORDER BY clicks DESC
     LIMIT $2`,
    [urlId, limit]
  );
  
  return result.rows.map((row) => ({
    referer: row.referer,
    clicks: parseInt(row.clicks, 10),
  }));
}

export async function getDeviceBreakdown(
  urlId: number
): Promise<Record<string, number>> {
  const result = await query(
    `SELECT device_type, COUNT(*) as clicks
     FROM clicks
     WHERE url_id = $1 AND device_type IS NOT NULL
     GROUP BY device_type`,
    [urlId]
  );
  
  const breakdown: Record<string, number> = {};
  result.rows.forEach((row) => {
    breakdown[row.device_type] = parseInt(row.clicks, 10);
  });
  
  return breakdown;
}

export async function getBrowserBreakdown(
  urlId: number
): Promise<Record<string, number>> {
  const result = await query(
    `SELECT browser, COUNT(*) as clicks
     FROM clicks
     WHERE url_id = $1 AND browser IS NOT NULL
     GROUP BY browser`,
    [urlId]
  );
  
  const breakdown: Record<string, number> = {};
  result.rows.forEach((row) => {
    breakdown[row.browser] = parseInt(row.clicks, 10);
  });
  
  return breakdown;
}
