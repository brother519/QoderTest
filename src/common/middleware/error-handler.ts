import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'An unexpected error occurred';

  if (process.env.NODE_ENV !== 'production') {
    console.error('Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message: statusCode === 500 && process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : message,
    },
  });
}

export function createError(message: string, statusCode: number, code: string): AppError {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}
