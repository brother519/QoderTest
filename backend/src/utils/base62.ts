import crypto from 'crypto';
import { SHORT_CODE_LENGTH, MAX_COLLISION_RETRIES, RESERVED_CODES } from '../config/index.js';

const BASE62_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Generates a random base62 string of specified length
 */
export function generateBase62(length: number = SHORT_CODE_LENGTH): string {
  const bytes = crypto.randomBytes(length);
  let result = '';
  
  for (let i = 0; i < length; i++) {
    const byte = bytes[i];
    if (byte !== undefined) {
      result += BASE62_CHARS[byte % 62];
    }
  }
  
  return result;
}

/**
 * Encodes a number to base62 string
 */
export function encodeBase62(num: bigint): string {
  if (num === 0n) return '0';
  
  let result = '';
  const base = 62n;
  
  while (num > 0n) {
    const remainder = Number(num % base);
    result = BASE62_CHARS[remainder] + result;
    num = num / base;
  }
  
  return result;
}

/**
 * Decodes a base62 string to number
 */
export function decodeBase62(str: string): bigint {
  let result = 0n;
  const base = 62n;
  
  for (const char of str) {
    const index = BASE62_CHARS.indexOf(char);
    if (index === -1) {
      throw new Error(`Invalid base62 character: ${char}`);
    }
    result = result * base + BigInt(index);
  }
  
  return result;
}

/**
 * Validates a custom short code
 */
export function isValidCustomCode(code: string): { valid: boolean; error?: string } {
  if (code.length < 3 || code.length > 20) {
    return { valid: false, error: 'Code must be between 3 and 20 characters' };
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(code)) {
    return { valid: false, error: 'Code can only contain letters, numbers, underscores, and hyphens' };
  }
  
  if (RESERVED_CODES.includes(code.toLowerCase())) {
    return { valid: false, error: 'This code is reserved and cannot be used' };
  }
  
  return { valid: true };
}

/**
 * Generates a unique short code with collision checking
 */
export async function generateUniqueCode(
  checkExists: (code: string) => Promise<boolean>,
  customCode?: string
): Promise<string> {
  // If custom code provided, validate and check existence
  if (customCode) {
    const validation = isValidCustomCode(customCode);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    
    const exists = await checkExists(customCode);
    if (exists) {
      throw new Error('This custom code is already taken');
    }
    
    return customCode;
  }
  
  // Generate random code with collision retry
  let length = SHORT_CODE_LENGTH;
  
  for (let attempt = 0; attempt < MAX_COLLISION_RETRIES; attempt++) {
    const code = generateBase62(length);
    const exists = await checkExists(code);
    
    if (!exists) {
      return code;
    }
  }
  
  // If all retries failed, increase length and try once more
  length++;
  const code = generateBase62(length);
  const exists = await checkExists(code);
  
  if (exists) {
    throw new Error('Unable to generate unique short code. Please try again.');
  }
  
  return code;
}

/**
 * Hash a string using SHA-256
 */
export function hashString(str: string): string {
  return crypto.createHash('sha256').update(str).digest('hex');
}

/**
 * Generate a random API key
 */
export function generateApiKey(): { key: string; hash: string; prefix: string } {
  const key = `sk_${generateBase62(32)}`;
  const hash = hashString(key);
  const prefix = key.substring(0, 10);
  
  return { key, hash, prefix };
}
