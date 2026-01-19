import fs from 'fs';
import path from 'path';
import { pool } from '../config/database';

async function runMigrations(): Promise<void> {
  const migrationsDir = path.join(__dirname);
  
  // Get all SQL files sorted by name
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  console.log('Running database migrations...');

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    try {
      await pool.query(sql);
      console.log(`✓ Executed: ${file}`);
    } catch (error) {
      console.error(`✗ Failed: ${file}`);
      console.error(error);
      process.exit(1);
    }
  }

  console.log('All migrations completed successfully!');
  process.exit(0);
}

runMigrations();
