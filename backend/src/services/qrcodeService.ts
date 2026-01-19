import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';
import { appConfig } from '../config/app';

const QR_CODE_DIR = path.join(process.cwd(), 'uploads', 'qrcodes');

// Ensure QR code directory exists
if (!fs.existsSync(QR_CODE_DIR)) {
  fs.mkdirSync(QR_CODE_DIR, { recursive: true });
}

interface QRCodeOptions {
  size?: 'small' | 'medium' | 'large';
  format?: 'png' | 'svg';
}

const SIZE_MAP = {
  small: 150,
  medium: 300,
  large: 600,
};

/**
 * Generate QR code for a short link
 */
export async function generateQRCode(
  shortCode: string,
  options: QRCodeOptions = {}
): Promise<Buffer> {
  const { size = 'medium', format = 'png' } = options;
  const url = `${appConfig.baseUrl}/${shortCode}`;
  const width = SIZE_MAP[size];

  if (format === 'svg') {
    const svg = await QRCode.toString(url, {
      type: 'svg',
      width,
      margin: 2,
    });
    return Buffer.from(svg);
  }

  return QRCode.toBuffer(url, {
    type: 'png',
    width,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });
}

/**
 * Generate and save QR code to file
 */
export async function saveQRCode(
  shortCode: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const { size = 'medium', format = 'png' } = options;
  const filename = `${shortCode}_${size}.${format}`;
  const filepath = path.join(QR_CODE_DIR, filename);

  const buffer = await generateQRCode(shortCode, options);
  await fs.promises.writeFile(filepath, buffer);

  return filepath;
}

/**
 * Get QR code as data URL
 */
export async function getQRCodeDataURL(
  shortCode: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const { size = 'medium' } = options;
  const url = `${appConfig.baseUrl}/${shortCode}`;
  const width = SIZE_MAP[size];

  return QRCode.toDataURL(url, {
    width,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });
}

/**
 * Delete QR code files for a short code
 */
export async function deleteQRCode(shortCode: string): Promise<void> {
  const sizes: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large'];
  const formats = ['png', 'svg'];

  for (const size of sizes) {
    for (const format of formats) {
      const filepath = path.join(QR_CODE_DIR, `${shortCode}_${size}.${format}`);
      try {
        await fs.promises.unlink(filepath);
      } catch {
        // File doesn't exist, ignore
      }
    }
  }
}
