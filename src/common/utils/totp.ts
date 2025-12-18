import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { config } from '../../config';

export function generateTotpSecret(): string {
  return authenticator.generateSecret();
}

export function verifyTotpCode(secret: string, code: string): boolean {
  return authenticator.verify({ token: code, secret });
}

export async function generateQrCodeUrl(email: string, secret: string): Promise<string> {
  const otpauth = authenticator.keyuri(email, config.totp.issuer, secret);
  return QRCode.toDataURL(otpauth);
}

export function formatSecretForManualEntry(secret: string): string {
  return secret.match(/.{1,4}/g)?.join(' ') || secret;
}

export function generateBackupCodes(count: number = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(5).toString('hex').toUpperCase();
    codes.push(`${code.slice(0, 5)}-${code.slice(5)}`);
  }
  return codes;
}

export function hashBackupCode(code: string): string {
  return crypto.createHash('sha256').update(code.replace('-', '')).digest('hex');
}

export function verifyBackupCode(inputCode: string, hashedCodes: string[]): number {
  const inputHash = hashBackupCode(inputCode);
  return hashedCodes.findIndex(hash => hash === inputHash);
}
