import { uploadConfig } from '../config';
import { fileTypeFromBuffer } from 'file-type';
import { logger } from '../utils/logger.util';

const EXECUTABLE_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.scr', '.pif',
  '.sh', '.bash', '.app', '.deb', '.rpm',
  '.dmg', '.pkg', '.run', '.bin',
];

const MIME_TYPE_PATTERNS = uploadConfig.allowedMimeTypes.map(pattern => {
  if (pattern.endsWith('/*')) {
    return new RegExp(`^${pattern.replace('/*', '/.*')}$`);
  }
  return new RegExp(`^${pattern}$`);
});

export function validateMimeType(mimeType: string): boolean {
  return MIME_TYPE_PATTERNS.some(pattern => pattern.test(mimeType));
}

export function validateExtension(fileName: string): boolean {
  const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  return !EXECUTABLE_EXTENSIONS.includes(ext);
}

export async function detectFileType(buffer: Buffer): Promise<{ ext: string; mime: string } | null> {
  try {
    const result = await fileTypeFromBuffer(buffer);
    return result ? { ext: result.ext, mime: result.mime } : null;
  } catch (error) {
    logger.error('Failed to detect file type', error);
    return null;
  }
}

export function isExecutableFile(fileName: string): boolean {
  const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  return EXECUTABLE_EXTENSIONS.includes(ext);
}

export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
}
