import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../../config';
import { JwtPayload } from '../types/express.d';

export function generateAccessToken(userId: string, email: string): string {
  const payload = { sub: userId, email };
  const options: SignOptions = { expiresIn: config.jwt.accessExpiresIn as string };
  return jwt.sign(payload, config.jwt.accessSecret, options);
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function verifyAccessToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, config.jwt.accessSecret) as JwtPayload;
  } catch {
    return null;
  }
}

export function generateTempToken(userId: string): string {
  const payload = { sub: userId, type: 'temp' };
  const options: SignOptions = { expiresIn: '5m' };
  return jwt.sign(payload, config.jwt.accessSecret, options);
}

export function verifyTempToken(token: string): { sub: string; type: string } | null {
  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret) as { sub: string; type: string };
    if (decoded.type !== 'temp') {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

export function generateFamilyId(): string {
  return crypto.randomUUID();
}

export function getRefreshTokenExpiry(): Date {
  const days = parseInt(config.jwt.refreshExpiresIn.replace('d', ''), 10) || 7;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}
