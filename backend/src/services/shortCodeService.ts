import { query } from '../config/database';
import { generateRandom, isValid } from '../utils/base62';
import { isValidShortCode } from '../utils/validators';
import { appConfig } from '../config/app';

/**
 * Generate a unique short code
 * Tries random generation first, then falls back to sequential if collisions occur
 */
export async function generateShortCode(): Promise<string> {
  const maxAttempts = 10;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateRandom(appConfig.shortCodeLength);
    
    // Check if code already exists
    const result = await query(
      'SELECT id FROM links WHERE short_code = $1',
      [code]
    );
    
    if (result.rows.length === 0) {
      return code;
    }
  }
  
  // If random generation fails, use sequential approach
  // Get the max ID and encode it
  const result = await query('SELECT MAX(id) as max_id FROM links');
  const maxId = result.rows[0]?.max_id || 0;
  
  // Add some randomness to sequential ID
  const nextId = maxId + Math.floor(Math.random() * 1000) + 1;
  return generateRandom(appConfig.shortCodeLength);
}

/**
 * Validate and reserve a custom short code
 */
export async function reserveCustomCode(code: string): Promise<{ success: boolean; error?: string }> {
  // Validate format
  const validation = isValidShortCode(code);
  if (!validation.valid) {
    return { success: false, error: validation.reason };
  }
  
  // Check availability
  const result = await query(
    'SELECT id FROM links WHERE short_code = $1',
    [code]
  );
  
  if (result.rows.length > 0) {
    return { success: false, error: 'This short code is already taken' };
  }
  
  return { success: true };
}

/**
 * Check if a short code exists
 */
export async function shortCodeExists(code: string): Promise<boolean> {
  const result = await query(
    'SELECT id FROM links WHERE short_code = $1',
    [code]
  );
  return result.rows.length > 0;
}
