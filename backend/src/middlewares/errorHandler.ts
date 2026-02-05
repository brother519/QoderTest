import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error
  logger.error(`${req.method} ${req.path} - ${message}`, {
    statusCode,
    stack: err.stack,
    body: req.body,
    query: req.query,
  });

  // Don't expose internal error details in production
  const responseMessage =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Internal Server Error'
      : message;

  res.status(statusCode).json({
    success: false,
    error: responseMessage,
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
  });
}

export class HttpError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string = 'Bad Request') {
    super(message, 400);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string = 'Not Found') {
    super(message, 404);
  }
}

export class ConflictError extends HttpError {
  constructor(message: string = 'Conflict') {
    super(message, 409);
  }
}
