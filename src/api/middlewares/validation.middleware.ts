import { Request, Response, NextFunction } from 'express';
import { validateTransformParams, validateThumbnailVariants } from '../validators/transform-params.validator';
import { AppError, ErrorCode } from '../../utils/error-codes';

/**
 * Validate transform parameters middleware
 */
export function validateTransform(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const { error, value } = validateTransformParams(req.query as Record<string, unknown>);

  if (error) {
    next(new AppError(ErrorCode.INVALID_PARAMS, error));
    return;
  }

  // Attach validated params to request
  req.query = value as Record<string, string>;
  next();
}

/**
 * Validate thumbnail variants middleware
 */
export function validateThumbnails(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const { error, value } = validateThumbnailVariants(req.body);

  if (error) {
    next(new AppError(ErrorCode.INVALID_PARAMS, error));
    return;
  }

  // Attach validated body to request
  req.body = value;
  next();
}

/**
 * Validate image ID parameter middleware
 */
export function validateImageId(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const { id } = req.params;

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  if (!id || !uuidRegex.test(id)) {
    next(new AppError(ErrorCode.INVALID_PARAMS, 'Invalid image ID format'));
    return;
  }

  next();
}
