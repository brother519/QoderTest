import crypto from 'crypto';
import Joi from 'joi';
import { TransformParams, FitMode, OutputFormat } from '../types/image.types';

// Validation schema for transform parameters
const transformSchema = Joi.object({
  w: Joi.number().integer().min(1).max(8192),
  width: Joi.number().integer().min(1).max(8192),
  h: Joi.number().integer().min(1).max(8192),
  height: Joi.number().integer().min(1).max(8192),
  fit: Joi.string().valid('cover', 'contain', 'fill', 'inside', 'outside'),
  f: Joi.string().valid('jpeg', 'jpg', 'png', 'webp', 'avif'),
  format: Joi.string().valid('jpeg', 'jpg', 'png', 'webp', 'avif'),
  q: Joi.number().integer().min(1).max(100),
  quality: Joi.number().integer().min(1).max(100),
  wm: Joi.string().max(100),
  watermark: Joi.string().max(100),
  blur: Joi.number().min(0).max(100),
  sharpen: Joi.boolean(),
  grayscale: Joi.boolean(),
  auto: Joi.string().valid('format', 'quality', 'all'),
});

/**
 * Parse URL query parameters into transform params
 */
export function parseTransformParams(query: Record<string, unknown>): TransformParams {
  // Validate query parameters
  const { error, value } = transformSchema.validate(query, {
    stripUnknown: true,
    convert: true,
  });

  if (error) {
    throw new Error(`Invalid transform parameters: ${error.message}`);
  }

  const params: TransformParams = {};

  // Parse width (support both 'w' and 'width')
  if (value.w !== undefined || value.width !== undefined) {
    params.width = value.w ?? value.width;
  }

  // Parse height (support both 'h' and 'height')
  if (value.h !== undefined || value.height !== undefined) {
    params.height = value.h ?? value.height;
  }

  // Parse fit mode
  if (value.fit) {
    params.fit = value.fit as FitMode;
  }

  // Parse format (support both 'f' and 'format', normalize 'jpg' to 'jpeg')
  const format = value.f ?? value.format;
  if (format) {
    params.format = (format === 'jpg' ? 'jpeg' : format) as OutputFormat;
  }

  // Parse quality (support both 'q' and 'quality')
  if (value.q !== undefined || value.quality !== undefined) {
    params.quality = value.q ?? value.quality;
  }

  // Parse watermark (support both 'wm' and 'watermark')
  if (value.wm || value.watermark) {
    params.watermark = value.wm ?? value.watermark;
  }

  // Parse blur
  if (value.blur !== undefined) {
    params.blur = value.blur;
  }

  // Parse sharpen
  if (value.sharpen !== undefined) {
    params.sharpen = value.sharpen;
  }

  // Parse grayscale
  if (value.grayscale !== undefined) {
    params.grayscale = value.grayscale;
  }

  return params;
}

/**
 * Generate a hash for transform parameters (used as cache key)
 */
export function generateParamsHash(params: TransformParams): string {
  // Sort parameters to ensure consistent hash
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      const value = params[key as keyof TransformParams];
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, unknown>);

  const paramsString = JSON.stringify(sortedParams);
  return crypto.createHash('md5').update(paramsString).digest('hex').substring(0, 8);
}

/**
 * Build cache key for transformed image
 */
export function buildCacheKey(imageId: string, params: TransformParams): string {
  const hash = generateParamsHash(params);
  return `image:url:${imageId}:${hash}`;
}

/**
 * Parse path-based transform parameters (alternative URL format)
 * Example: /images/{id}/w_300,h_200,f_webp.webp
 */
export function parsePathParams(pathSegment: string): TransformParams {
  const params: TransformParams = {};
  
  // Remove file extension if present
  const cleanSegment = pathSegment.replace(/\.[a-z]+$/i, '');
  
  // Split by comma and parse each parameter
  const parts = cleanSegment.split(',');
  
  for (const part of parts) {
    const [key, value] = part.split('_');
    
    switch (key) {
      case 'w':
        params.width = parseInt(value, 10);
        break;
      case 'h':
        params.height = parseInt(value, 10);
        break;
      case 'fit':
        params.fit = value as FitMode;
        break;
      case 'f':
        params.format = (value === 'jpg' ? 'jpeg' : value) as OutputFormat;
        break;
      case 'q':
        params.quality = parseInt(value, 10);
        break;
      case 'wm':
        params.watermark = value;
        break;
      case 'blur':
        params.blur = parseInt(value, 10);
        break;
      case 'sharpen':
        params.sharpen = value === 'true' || value === '1';
        break;
      case 'gray':
        params.grayscale = value === 'true' || value === '1';
        break;
    }
  }

  return params;
}

/**
 * Determine best output format based on Accept header
 */
export function getBestFormat(acceptHeader: string | undefined): OutputFormat | undefined {
  if (!acceptHeader) return undefined;

  // Prefer AVIF if supported
  if (acceptHeader.includes('image/avif')) {
    return 'avif';
  }

  // Then WebP
  if (acceptHeader.includes('image/webp')) {
    return 'webp';
  }

  // Default: let the processor decide
  return undefined;
}
