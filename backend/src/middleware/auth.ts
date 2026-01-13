import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { hashString } from '../utils/base62.js';
import { incrementCounter, getCounter } from '../config/redis.js';
import { AppError } from './error.js';
import type { AuthenticatedRequest } from '../types/index.js';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      auth?: AuthenticatedRequest;
    }
  }
}

export async function authenticateApiKey(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Missing or invalid authorization header', 401);
    }
    
    const apiKey = authHeader.substring(7);
    const keyHash = hashString(apiKey);
    
    const apiKeyRecord = await prisma.apiKey.findUnique({
      where: { keyHash },
    });
    
    if (!apiKeyRecord) {
      throw new AppError('Invalid API key', 401);
    }
    
    if (!apiKeyRecord.isActive) {
      throw new AppError('API key is inactive', 401);
    }
    
    if (apiKeyRecord.expiresAt && apiKeyRecord.expiresAt < new Date()) {
      throw new AppError('API key has expired', 401);
    }
    
    // Check rate limit
    const hourKey = Math.floor(Date.now() / 3600000);
    const rateLimitKey = `rate:${keyHash}:${hourKey}`;
    const currentCount = await getCounter(rateLimitKey);
    
    if (currentCount >= apiKeyRecord.rateLimit) {
      throw new AppError('Rate limit exceeded', 429);
    }
    
    // Increment counter
    await incrementCounter(rateLimitKey, 3600);
    
    // Update last used
    await prisma.apiKey.update({
      where: { id: apiKeyRecord.id },
      data: { lastUsedAt: new Date() },
    });
    
    // Set auth info on request
    req.auth = {
      userId: apiKeyRecord.userId,
      apiKeyId: apiKeyRecord.id,
      scopes: apiKeyRecord.scopes as string[],
    };
    
    next();
  } catch (error) {
    next(error);
  }
}

export function requireScope(scope: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth) {
      next(new AppError('Authentication required', 401));
      return;
    }
    
    if (!req.auth.scopes.includes(scope)) {
      next(new AppError(`Missing required scope: ${scope}`, 403));
      return;
    }
    
    next();
  };
}

export function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }
  
  // If auth header present, validate it
  authenticateApiKey(req, _res, next);
}
