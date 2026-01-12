import Joi from 'joi';

// Transform parameters validation schema
export const transformParamsSchema = Joi.object({
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
}).options({ stripUnknown: true });

// Thumbnail variants validation schema
export const thumbnailVariantsSchema = Joi.object({
  variants: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required().max(50),
        width: Joi.number().integer().required().min(1).max(8192),
        height: Joi.number().integer().required().min(1).max(8192),
        fit: Joi.string().valid('cover', 'contain', 'fill', 'inside', 'outside'),
        format: Joi.string().valid('jpeg', 'png', 'webp', 'avif'),
        quality: Joi.number().integer().min(1).max(100),
      })
    )
    .min(1)
    .max(10)
    .required(),
});

// Image upload options validation schema
export const uploadOptionsSchema = Joi.object({
  userId: Joi.string().max(100),
  tags: Joi.array().items(Joi.string().max(50)).max(20),
  watermarkTemplate: Joi.string().max(100),
  generateThumbnails: Joi.boolean().default(true),
});

// Validate transform parameters
export function validateTransformParams(params: Record<string, unknown>): {
  error?: string;
  value?: Record<string, unknown>;
} {
  const { error, value } = transformParamsSchema.validate(params, { convert: true });
  
  if (error) {
    return { error: error.message };
  }

  return { value };
}

// Validate thumbnail variants
export function validateThumbnailVariants(body: unknown): {
  error?: string;
  value?: { variants: Array<{ name: string; width: number; height: number; fit?: string; format?: string; quality?: number }> };
} {
  const { error, value } = thumbnailVariantsSchema.validate(body);
  
  if (error) {
    return { error: error.message };
  }

  return { value };
}

// Validate upload options
export function validateUploadOptions(body: Record<string, unknown>): {
  error?: string;
  value?: { userId?: string; tags?: string[]; watermarkTemplate?: string; generateThumbnails: boolean };
} {
  const { error, value } = uploadOptionsSchema.validate(body, { convert: true });
  
  if (error) {
    return { error: error.message };
  }

  return { value };
}
