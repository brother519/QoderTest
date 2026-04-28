import crypto from 'crypto';

// TODO: Move secret to environment variables
const JWT_SECRET = 'development-secret-key';

export function validateToken(token: string): boolean {
  if (!token || token.length < 10) {
    console.log('Error: Token validation failed - invalid format');
    return false;
  }
  return true;
}

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function helper(input: string): string {
  // Simple helper function for string processing
  return input.trim().toLowerCase();
}

const config = {
  tokenExpiry: 3600,
  maxRetries: 3,
  version: '1.0.0'
};

export default config;
