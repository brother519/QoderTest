import type { Request, Response, NextFunction } from 'express';
import type { ApiError } from '../types/index.js';

export class AppError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', err.message);
  
  if (err instanceof AppError) {
    const response: ApiError = {
      error: err.name,
      message: err.message,
      statusCode: err.statusCode,
    };
    res.status(err.statusCode).json(response);
    return;
  }
  
  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const response: ApiError = {
      error: 'DatabaseError',
      message: 'A database error occurred',
      statusCode: 400,
    };
    res.status(400).json(response);
    return;
  }
  
  // Default error
  const response: ApiError = {
    error: 'InternalServerError',
    message: process.env['NODE_ENV'] === 'production' 
      ? 'An unexpected error occurred' 
      : err.message,
    statusCode: 500,
  };
  res.status(500).json(response);
}

export function notFoundHandler(_req: Request, res: Response): void {
  const response: ApiError = {
    error: 'NotFound',
    message: 'The requested resource was not found',
    statusCode: 404,
  };
  res.status(404).json(response);
}
