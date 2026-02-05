import { appConfig } from '../config/app';
import { isValid as isValidBase62 } from './base62';

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
export function isValidPassword(password: string): boolean {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
}

/**
 * Validate username
 * - 3-30 characters
 * - Only alphanumeric and underscore
 */
export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(username);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Validate custom short code
 * - 3-10 characters
 * - Only alphanumeric and hyphen
 * - Not a reserved word
 */
export function isValidShortCode(code: string): { valid: boolean; reason?: string } {
  if (!code || code.length < 3) {
    return { valid: false, reason: 'Short code must be at least 3 characters' };
  }
  
  if (code.length > 10) {
    return { valid: false, reason: 'Short code must be at most 10 characters' };
  }
  
  const validFormat = /^[a-zA-Z0-9-]+$/.test(code);
  if (!validFormat) {
    return { valid: false, reason: 'Short code can only contain letters, numbers, and hyphens' };
  }
  
  if (appConfig.reservedCodes.includes(code.toLowerCase())) {
    return { valid: false, reason: 'This short code is reserved' };
  }
  
  return { valid: true };
}

/**
 * Validate domain format
 */
export function isValidDomain(domain: string): boolean {
  const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  return domainRegex.test(domain);
}

/**
 * Sanitize URL to prevent XSS
 */
export function sanitizeUrl(url: string): string {
  // Remove javascript: and data: protocols
  const dangerous = /^(javascript|data|vbscript):/i;
  if (dangerous.test(url.trim())) {
    throw new Error('Invalid URL protocol');
  }
  return url.trim();
}
