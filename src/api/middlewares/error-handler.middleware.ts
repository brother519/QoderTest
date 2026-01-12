import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode } from '../../utils/error-codes';
import logger from '../../utils/logger';

/**
 * Global error handler middleware
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log the error
  logger.error('Request error', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  // Handle AppError
  if (error instanceof AppError) {
    res.status(error.statusCode).json(error.toJSON());
    return;
  }

  // Handle Multer errors
  if (error.name === 'MulterError') {
    const multerError = error as { code: string; message: string };
    
    if (multerError.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({
        error: {
          code: ErrorCode.FILE_TOO_LARGE,
          message: 'File size exceeds the maximum allowed limit',
        },
      });
      return;
    }

    res.status(400).json({
      error: {
        code: ErrorCode.BAD_REQUEST,
        message: multerError.message,
      },
    });
    return;
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    res.status(400).json({
      error: {
        code: ErrorCode.INVALID_PARAMS,
        message: error.message,
      },
    });
    return;
  }

  // Handle unknown errors
  res.status(500).json({
    error: {
      code: ErrorCode.INTERNAL_ERROR,
      message: 'Internal server error',
    },
  });
}

/**
 * Not found handler middleware
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
}
