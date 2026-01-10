import { Pool } from 'pg';
import config from './env';

const pool = new Pool({
  connectionString: config.database.url,
  min: config.database.poolMin,
  max: config.database.poolMax,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('PostgreSQL连接池错误:', err);
  process.exit(-1);
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  
  if (duration > 1000) {
    console.warn(`慢查询 (${duration}ms):`, text);
  }
  
  return res;
};

export const getClient = async () => {
  return await pool.connect();
};

export default pool;
