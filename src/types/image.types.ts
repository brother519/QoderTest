// Supported image formats for input
export type InputFormat = 'jpeg' | 'png' | 'webp' | 'gif' | 'bmp' | 'heic' | 'heif' | 'avif' | 'tiff';

// Supported image formats for output
export type OutputFormat = 'jpeg' | 'png' | 'webp' | 'avif';

// Fit modes for resizing
export type FitMode = 'cover' | 'contain' | 'fill' | 'inside' | 'outside';

// Watermark position
export type WatermarkPosition = 
  | 'top-left' 
  | 'top-center' 
  | 'top-right'
  | 'center-left' 
  | 'center' 
  | 'center-right'
  | 'bottom-left' 
  | 'bottom-center' 
  | 'bottom-right';

// Transform parameters from URL query
export interface TransformParams {
  width?: number;
  height?: number;
  fit?: FitMode;
  format?: OutputFormat;
  quality?: number;
  watermark?: string;
  blur?: number;
  sharpen?: boolean;
  grayscale?: boolean;
}

// Parsed and validated transform options
export interface TransformOptions {
  width?: number;
  height?: number;
  fit: FitMode;
  format: OutputFormat;
  quality: number;
  watermark?: WatermarkConfig;
  blur?: number;
  sharpen: boolean;
  grayscale: boolean;
}

// Watermark configuration
export interface WatermarkConfig {
  type: 'text' | 'image';
  content: string; // Text content or image path/URL
  position: WatermarkPosition;
  opacity: number; // 0-100
  fontSize?: number; // For text watermark
  fontColor?: string; // For text watermark
}

// Thumbnail variant configuration
export interface ThumbnailVariant {
  name: string;
  width: number;
  height: number;
  fit: FitMode;
  format?: OutputFormat;
  quality?: number;
}

// Image metadata from EXIF
export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
  hasAlpha: boolean;
  exif?: ExifData;
}

// EXIF data structure
export interface ExifData {
  make?: string;
  model?: string;
  dateTaken?: string;
  exposureTime?: number;
  fNumber?: number;
  iso?: number;
  focalLength?: number;
  gps?: {
    latitude?: number;
    longitude?: number;
    altitude?: number;
  };
  orientation?: number;
}

// Image upload result
export interface UploadResult {
  imageId: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  metadata: ImageMetadata;
}

// Processing result
export interface ProcessingResult {
  imageId: string;
  variant: string;
  url: string;
  size: number;
  width: number;
  height: number;
  format: OutputFormat;
}
