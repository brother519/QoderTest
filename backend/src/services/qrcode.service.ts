import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs/promises';

const QR_CODE_DIR = path.join(process.cwd(), 'uploads', 'qr');

async function ensureQrDir(): Promise<void> {
  try {
    await fs.access(QR_CODE_DIR);
  } catch {
    await fs.mkdir(QR_CODE_DIR, { recursive: true });
  }
}

export async function generateQrCode(urlId: string, shortUrl: string): Promise<string> {
  await ensureQrDir();
  
  const filename = `${urlId}.png`;
  const filepath = path.join(QR_CODE_DIR, filename);
  
  await QRCode.toFile(filepath, shortUrl, {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'M',
  });
  
  return filepath;
}

export async function getQrCodePath(urlId: string): Promise<string | null> {
  const filepath = path.join(QR_CODE_DIR, `${urlId}.png`);
  
  try {
    await fs.access(filepath);
    return filepath;
  } catch {
    return null;
  }
}

export async function deleteQrCode(filepath: string | null): Promise<void> {
  if (!filepath) return;
  
  try {
    await fs.unlink(filepath);
  } catch {
    // File might not exist, ignore error
  }
}

export async function generateQrCodeBuffer(
  shortUrl: string,
  size: number = 300,
  format: 'png' | 'svg' = 'png'
): Promise<Buffer | string> {
  const options = {
    width: size,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'M' as const,
  };
  
  if (format === 'svg') {
    return QRCode.toString(shortUrl, { ...options, type: 'svg' });
  }
  
  return QRCode.toBuffer(shortUrl, options);
}
