// Application error codes
export enum ErrorCode {
  // Client errors (4xx)
  BAD_REQUEST = 'BAD_REQUEST',
  INVALID_PARAMS = 'INVALID_PARAMS',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
  IMAGE_NOT_FOUND = 'IMAGE_NOT_FOUND',
  TASK_NOT_FOUND = 'TASK_NOT_FOUND',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  UNAUTHORIZED = 'UNAUTHORIZED',

  // Server errors (5xx)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  PROCESSING_FAILED = 'PROCESSING_FAILED',
  STORAGE_ERROR = 'STORAGE_ERROR',
  QUEUE_ERROR = 'QUEUE_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

// Error messages mapping
export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCode.BAD_REQUEST]: 'Bad request',
  [ErrorCode.INVALID_PARAMS]: 'Invalid parameters provided',
  [ErrorCode.FILE_TOO_LARGE]: 'File size exceeds the maximum allowed limit',
  [ErrorCode.UNSUPPORTED_FORMAT]: 'Unsupported image format',
  [ErrorCode.IMAGE_NOT_FOUND]: 'Image not found',
  [ErrorCode.TASK_NOT_FOUND]: 'Task not found',
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 'Rate limit exceeded',
  [ErrorCode.UNAUTHORIZED]: 'Unauthorized access',
  [ErrorCode.INTERNAL_ERROR]: 'Internal server error',
  [ErrorCode.PROCESSING_FAILED]: 'Image processing failed',
  [ErrorCode.STORAGE_ERROR]: 'Storage operation failed',
  [ErrorCode.QUEUE_ERROR]: 'Queue operation failed',
  [ErrorCode.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable',
};

// HTTP status codes mapping
export const ErrorStatusCodes: Record<ErrorCode, number> = {
  [ErrorCode.BAD_REQUEST]: 400,
  [ErrorCode.INVALID_PARAMS]: 400,
  [ErrorCode.FILE_TOO_LARGE]: 413,
  [ErrorCode.UNSUPPORTED_FORMAT]: 415,
  [ErrorCode.IMAGE_NOT_FOUND]: 404,
  [ErrorCode.TASK_NOT_FOUND]: 404,
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 429,
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.PROCESSING_FAILED]: 500,
  [ErrorCode.STORAGE_ERROR]: 500,
  [ErrorCode.QUEUE_ERROR]: 500,
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,
};

/**
 * Custom application error class
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(code: ErrorCode, message?: string, details?: unknown) {
    super(message || ErrorMessages[code]);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = ErrorStatusCodes[code];
    this.details = details;

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
      },
    };
  }
}
