import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../../common/utils/token';
import { createError } from '../../common/middleware/error-handler';

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError('No token provided', 401, 'NO_TOKEN');
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyAccessToken(token);

  if (!decoded) {
    throw createError('Invalid or expired token', 401, 'INVALID_TOKEN');
  }

  req.user = {
    id: decoded.sub,
    email: decoded.email,
  };

  next();
}

export function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    if (decoded) {
      req.user = {
        id: decoded.sub,
        email: decoded.email,
      };
    }
  }

  next();
}