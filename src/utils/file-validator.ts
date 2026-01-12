import path from 'path';

// Supported input MIME types
export const SUPPORTED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/heic',
  'image/heif',
  'image/avif',
  'image/tiff',
]);

// Supported file extensions
export const SUPPORTED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.bmp',
  '.heic',
  '.heif',
  '.avif',
  '.tiff',
  '.tif',
]);

// MIME type to extension mapping
export const MIME_TO_EXTENSION: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/bmp': '.bmp',
  'image/heic': '.heic',
  'image/heif': '.heif',
  'image/avif': '.avif',
  'image/tiff': '.tiff',
};

// Extension to MIME type mapping
export const EXTENSION_TO_MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.bmp': 'image/bmp',
  '.heic': 'image/heic',
  '.heif': 'image/heif',
  '.avif': 'image/avif',
  '.tiff': 'image/tiff',
  '.tif': 'image/tiff',
};

/**
 * Validate file MIME type
 */
export function isValidMimeType(mimeType: string): boolean {
  return SUPPORTED_MIME_TYPES.has(mimeType);
}

/**
 * Validate file extension
 */
export function isValidExtension(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return SUPPORTED_EXTENSIONS.has(ext);
}

/**
 * Get MIME type from file extension
 */
export function getMimeType(filename: string): string | undefined {
  const ext = path.extname(filename).toLowerCase();
  return EXTENSION_TO_MIME[ext];
}

/**
 * Get file extension from MIME type
 */
export function getExtension(mimeType: string): string | undefined {
  return MIME_TO_EXTENSION[mimeType];
}

/**
 * Validate file size
 */
export function isValidFileSize(size: number, maxSize: number): boolean {
  return size > 0 && size <= maxSize;
}

/**
 * Check if format requires special handling (HEIC)
 */
export function requiresConversion(mimeType: string): boolean {
  return mimeType === 'image/heic' || mimeType === 'image/heif';
}

/**
 * Validate image file
 */
export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateImageFile(
  filename: string,
  mimeType: string,
  size: number,
  maxSize: number
): FileValidationResult {
  if (!isValidMimeType(mimeType)) {
    return {
      valid: false,
      error: `Unsupported MIME type: ${mimeType}`,
    };
  }

  if (!isValidExtension(filename)) {
    return {
      valid: false,
      error: `Unsupported file extension: ${path.extname(filename)}`,
    };
  }

  if (!isValidFileSize(size, maxSize)) {
    return {
      valid: false,
      error: size === 0 
        ? 'File is empty' 
        : `File size (${size} bytes) exceeds maximum allowed (${maxSize} bytes)`,
    };
  }

  return { valid: true };
}
