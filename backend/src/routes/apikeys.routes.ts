import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { createApiKey, listApiKeys, revokeApiKey } from '../services/apikey.service.js';
import { authenticateApiKey } from '../middleware/auth.js';
import { AppError } from '../middleware/error.js';
import type { CreateApiKeyRequest } from '../types/index.js';

const router = Router();

router.use(authenticateApiKey);

// Create API key
router.post(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: CreateApiKeyRequest = req.body;
      const userId = req.auth!.userId;
      
      if (!data.name) {
        throw new AppError('Name is required', 400);
      }
      
      const result = await createApiKey(data, userId);
      
      res.status(201).json({
        ...result.apiKey,
        key: result.key, // Only shown once
      });
    } catch (error) {
      next(error);
    }
  }
);

// List API keys
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.auth!.userId;
      const apiKeys = await listApiKeys(userId);
      res.json(apiKeys);
    } catch (error) {
      next(error);
    }
  }
);

// Revoke API key
router.delete(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.auth!.userId;
      const { id } = req.params;
      
      const revoked = await revokeApiKey(id!, userId);
      
      if (!revoked) {
        throw new AppError('API key not found', 404);
      }
      
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
