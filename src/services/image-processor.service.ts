import sharp, { Sharp, Metadata, OutputInfo } from 'sharp';
import ExifParser from 'exif-parser';
import { 
  TransformOptions, 
  ImageMetadata, 
  ExifData,
  OutputFormat,
  FitMode,
  WatermarkConfig 
} from '../types/image.types';
import { config } from '../config';
import logger from '../utils/logger';

/**
 * Core image processing service using Sharp library
 */
export class ImageProcessorService {
  private readonly defaultQuality: number;
  private readonly maxWidth: number;
  private readonly maxHeight: number;

  constructor() {
    this.defaultQuality = config.processing.defaultQuality;
    this.maxWidth = config.processing.maxWidth;
    this.maxHeight = config.processing.maxHeight;
  }

  /**
   * Process image with given transform options
   */
  async process(input: Buffer, options: Partial<TransformOptions>): Promise<Buffer> {
    try {
      let pipeline = sharp(input, { failOn: 'error' });

      // Auto-rotate based on EXIF orientation
      pipeline = pipeline.rotate();

      // Resize if dimensions specified
      if (options.width || options.height) {
        pipeline = this.applyResize(pipeline, options);
      }

      // Apply grayscale
      if (options.grayscale) {
        pipeline = pipeline.grayscale();
      }

      // Apply blur
      if (options.blur && options.blur > 0) {
        pipeline = pipeline.blur(options.blur);
      }

      // Apply sharpen
      if (options.sharpen) {
        pipeline = pipeline.sharpen();
      }

      // Convert to output format with quality settings
      pipeline = this.applyFormat(pipeline, options);

      const result = await pipeline.toBuffer();
      
      logger.debug('Image processed successfully', {
        inputSize: input.length,
        outputSize: result.length,
        options,
      });

      return result;
    } catch (error) {
      logger.error('Image processing failed', { error });
      throw error;
    }
  }

  /**
   * Apply resize transformation
   */
  private applyResize(pipeline: Sharp, options: Partial<TransformOptions>): Sharp {
    const width = options.width ? Math.min(options.width, this.maxWidth) : undefined;
    const height = options.height ? Math.min(options.height, this.maxHeight) : undefined;
    const fit = options.fit || 'cover';

    return pipeline.resize(width, height, {
      fit: fit as keyof sharp.FitEnum,
      withoutEnlargement: fit === 'inside',
      position: 'center',
    });
  }

  /**
   * Apply output format and quality
   */
  private applyFormat(pipeline: Sharp, options: Partial<TransformOptions>): Sharp {
    const format = options.format || 'jpeg';
    const quality = options.quality || this.defaultQuality;

    switch (format) {
      case 'jpeg':
        return pipeline.jpeg({
          quality,
          progressive: true,
          mozjpeg: true,
        });
      case 'png':
        return pipeline.png({
          compressionLevel: 9,
          progressive: true,
        });
      case 'webp':
        return pipeline.webp({
          quality,
          effort: 4,
        });
      case 'avif':
        return pipeline.avif({
          quality,
          effort: 4,
        });
      default:
        return pipeline.jpeg({ quality });
    }
  }

  /**
   * Add text watermark to image
   */
  async addTextWatermark(
    input: Buffer,
    text: string,
    options: Partial<WatermarkConfig> = {}
  ): Promise<Buffer> {
    const {
      position = 'bottom-right',
      opacity = 80,
      fontSize = 24,
      fontColor = 'white',
    } = options;

    // Get image dimensions
    const metadata = await sharp(input).metadata();
    const width = metadata.width || 800;
    const height = metadata.height || 600;

    // Calculate position
    const { x, y } = this.calculateWatermarkPosition(
      width,
      height,
      text.length * fontSize * 0.6,
      fontSize * 1.2,
      position
    );

    // Create SVG text overlay
    const svg = `
      <svg width="${width}" height="${height}">
        <style>
          .watermark { 
            font-family: Arial, sans-serif; 
            font-size: ${fontSize}px; 
            fill: ${fontColor};
            opacity: ${opacity / 100};
          }
        </style>
        <text x="${x}" y="${y}" class="watermark">${this.escapeXml(text)}</text>
      </svg>
    `;

    return sharp(input)
      .composite([
        {
          input: Buffer.from(svg),
          top: 0,
          left: 0,
        },
      ])
      .toBuffer();
  }

  /**
   * Add image watermark
   */
  async addImageWatermark(
    input: Buffer,
    watermarkBuffer: Buffer,
    options: Partial<WatermarkConfig> = {}
  ): Promise<Buffer> {
    const { position = 'bottom-right', opacity = 80 } = options;

    // Get dimensions of both images
    const [mainMeta, watermarkMeta] = await Promise.all([
      sharp(input).metadata(),
      sharp(watermarkBuffer).metadata(),
    ]);

    const mainWidth = mainMeta.width || 800;
    const mainHeight = mainMeta.height || 600;
    const wmWidth = watermarkMeta.width || 100;
    const wmHeight = watermarkMeta.height || 100;

    // Scale watermark to 20% of main image width
    const scaledWidth = Math.round(mainWidth * 0.2);
    const scaledHeight = Math.round((scaledWidth / wmWidth) * wmHeight);

    // Resize and adjust opacity of watermark
    const processedWatermark = await sharp(watermarkBuffer)
      .resize(scaledWidth, scaledHeight)
      .ensureAlpha()
      .modulate({ brightness: 1 })
      .linear(opacity / 100, 0)
      .toBuffer();

    // Calculate position
    const { x, y } = this.calculateWatermarkPosition(
      mainWidth,
      mainHeight,
      scaledWidth,
      scaledHeight,
      position
    );

    return sharp(input)
      .composite([
        {
          input: processedWatermark,
          top: Math.round(y),
          left: Math.round(x),
        },
      ])
      .toBuffer();
  }

  /**
   * Calculate watermark position based on position string
   */
  private calculateWatermarkPosition(
    imageWidth: number,
    imageHeight: number,
    wmWidth: number,
    wmHeight: number,
    position: string
  ): { x: number; y: number } {
    const padding = 20;
    let x = padding;
    let y = padding;

    switch (position) {
      case 'top-left':
        x = padding;
        y = padding + wmHeight;
        break;
      case 'top-center':
        x = (imageWidth - wmWidth) / 2;
        y = padding + wmHeight;
        break;
      case 'top-right':
        x = imageWidth - wmWidth - padding;
        y = padding + wmHeight;
        break;
      case 'center-left':
        x = padding;
        y = (imageHeight + wmHeight) / 2;
        break;
      case 'center':
        x = (imageWidth - wmWidth) / 2;
        y = (imageHeight + wmHeight) / 2;
        break;
      case 'center-right':
        x = imageWidth - wmWidth - padding;
        y = (imageHeight + wmHeight) / 2;
        break;
      case 'bottom-left':
        x = padding;
        y = imageHeight - padding;
        break;
      case 'bottom-center':
        x = (imageWidth - wmWidth) / 2;
        y = imageHeight - padding;
        break;
      case 'bottom-right':
      default:
        x = imageWidth - wmWidth - padding;
        y = imageHeight - padding;
        break;
    }

    return { x, y };
  }

  /**
   * Escape XML special characters
   */
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Extract image metadata including EXIF data
   */
  async extractMetadata(input: Buffer): Promise<ImageMetadata> {
    const metadata = await sharp(input).metadata();
    
    const result: ImageMetadata = {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || 'unknown',
      size: input.length,
      hasAlpha: metadata.hasAlpha || false,
    };

    // Try to extract EXIF data
    try {
      if (metadata.exif) {
        const parser = ExifParser.create(input);
        const exifData = parser.parse();
        
        result.exif = {
          make: exifData.tags.Make,
          model: exifData.tags.Model,
          dateTaken: exifData.tags.DateTimeOriginal
            ? new Date(exifData.tags.DateTimeOriginal * 1000).toISOString()
            : undefined,
          exposureTime: exifData.tags.ExposureTime,
          fNumber: exifData.tags.FNumber,
          iso: exifData.tags.ISO,
          focalLength: exifData.tags.FocalLength,
          orientation: exifData.tags.Orientation,
        };

        // Extract GPS data if available
        if (exifData.tags.GPSLatitude !== undefined && exifData.tags.GPSLongitude !== undefined) {
          result.exif.gps = {
            latitude: exifData.tags.GPSLatitude,
            longitude: exifData.tags.GPSLongitude,
            altitude: exifData.tags.GPSAltitude,
          };
        }
      }
    } catch (error) {
      logger.debug('Failed to parse EXIF data', { error });
    }

    return result;
  }

  /**
   * Generate multiple thumbnail variants
   */
  async generateThumbnails(
    input: Buffer,
    variants: Array<{
      name: string;
      width: number;
      height: number;
      fit?: FitMode;
      format?: OutputFormat;
      quality?: number;
    }>
  ): Promise<Array<{ name: string; buffer: Buffer; info: OutputInfo }>> {
    const results = await Promise.all(
      variants.map(async (variant) => {
        const buffer = await this.process(input, {
          width: variant.width,
          height: variant.height,
          fit: variant.fit || 'cover',
          format: variant.format || 'jpeg',
          quality: variant.quality || this.defaultQuality,
        });

        const info = await sharp(buffer).metadata();

        return {
          name: variant.name,
          buffer,
          info: {
            format: info.format || 'jpeg',
            width: info.width || variant.width,
            height: info.height || variant.height,
            size: buffer.length,
          } as OutputInfo,
        };
      })
    );

    return results;
  }

  /**
   * Optimize image for web (auto-select best format and quality)
   */
  async optimize(input: Buffer, targetFormat?: OutputFormat): Promise<Buffer> {
    const metadata = await sharp(input).metadata();
    
    // Determine output format
    let format: OutputFormat = targetFormat || 'webp';
    
    // Use PNG for images with alpha channel if not explicitly specified
    if (!targetFormat && metadata.hasAlpha) {
      format = 'webp'; // WebP supports alpha with better compression
    }

    // Calculate optimal quality based on image dimensions
    const pixels = (metadata.width || 0) * (metadata.height || 0);
    let quality = this.defaultQuality;
    
    // Reduce quality for larger images
    if (pixels > 4000000) {
      quality = Math.max(60, quality - 15);
    } else if (pixels > 2000000) {
      quality = Math.max(70, quality - 10);
    }

    return this.process(input, {
      format,
      quality,
    });
  }

  /**
   * Convert HEIC/HEIF to JPEG
   */
  async convertHeic(input: Buffer): Promise<Buffer> {
    // Sharp now supports HEIC natively with libvips
    return sharp(input)
      .rotate() // Auto-rotate based on EXIF
      .jpeg({ quality: this.defaultQuality, mozjpeg: true })
      .toBuffer();
  }
}

// Export singleton instance
export const imageProcessor = new ImageProcessorService();
