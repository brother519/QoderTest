import type { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { autocompleteService } from '../services/elasticsearch/AutocompleteService';
import type { ContentType } from '../types/search.types';

const autocompleteSchema = Joi.object({
  prefix: Joi.string().required().min(1).max(50),
  type: Joi.string().valid('articles', 'products', 'posts').optional(),
  limit: Joi.number().integer().min(1).max(20).default(5),
});

export class AutocompleteController {
  async getSuggestions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { error, value } = autocompleteSchema.validate(req.query);
      if (error) {
        res.status(400).json({
          success: false,
          error: error.details[0].message,
        });
        return;
      }

      const result = await autocompleteService.getSuggestions({
        prefix: value.prefix,
        type: value.type as ContentType | undefined,
        limit: value.limit,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getHotKeywords(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
      const keywords = await autocompleteService.getHotKeywords(limit);
      res.json({
        success: true,
        data: { keywords },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const autocompleteController = new AutocompleteController();
