import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('auth-middleware');

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    res.status(401).json({ error: 'API key is required' });
    return;
  }
  
  if (apiKey !== config.api.key) {
    logger.warn({ ip: req.ip }, 'Invalid API key attempt');
    res.status(403).json({ error: 'Invalid API key' });
    return;
  }
  
  next();
}

// 对于 webhook 端点，使用不同的验证
export function webhookAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Webhook 验证在各自的控制器中处理
  next();
}
