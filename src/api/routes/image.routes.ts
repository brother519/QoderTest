import { Router } from 'express';
import multer from 'multer';
import { imageController } from '../controllers/image.controller';
import { transformController } from '../controllers/transform.controller';
import { metadataController } from '../controllers/metadata.controller';
import { validateTransform, validateThumbnails, validateImageId } from '../middlewares/validation.middleware';
import { uploadLimiter, transformLimiter } from '../middlewares/rate-limit.middleware';
import { config } from '../../config';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.processing.maxFileSize,
  },
  fileFilter: (_req, file, cb) => {
    // Accept common image formats
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/bmp',
      'image/heic',
      'image/heif',
      'image/avif',
      'image/tiff',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

// Upload new image
router.post(
  '/',
  uploadLimiter,
  upload.single('file'),
  (req, res, next) => imageController.upload(req, res, next)
);

// Transform image with URL parameters
router.get(
  '/:id/transform',
  transformLimiter,
  validateImageId,
  validateTransform,
  (req, res, next) => transformController.transform(req, res, next)
);

// Generate thumbnails
router.post(
  '/:id/thumbnails',
  validateImageId,
  validateThumbnails,
  (req, res, next) => transformController.generateThumbnails(req, res, next)
);

// Get image metadata
router.get(
  '/:id/metadata',
  validateImageId,
  (req, res, next) => metadataController.getMetadata(req, res, next)
);

// Refresh image metadata
router.post(
  '/:id/metadata/refresh',
  validateImageId,
  (req, res, next) => metadataController.refreshMetadata(req, res, next)
);

// Delete image
router.delete(
  '/:id',
  validateImageId,
  (req, res, next) => imageController.delete(req, res, next)
);

export default router;
