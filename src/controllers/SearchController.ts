import type { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { searchService } from '../services/elasticsearch/SearchService';
import type { SearchParams, ContentType } from '../types/search.types';

const searchSchema = Joi.object({
  query: Joi.string().required().min(1).max(200),
  types: Joi.array().items(Joi.string().valid('articles', 'products', 'posts')).optional(),
  filters: Joi.object({
    category: Joi.string().optional(),
    author: Joi.string().optional(),
    brand: Joi.string().optional(),
    topic: Joi.string().optional(),
    status: Joi.string().optional(),
    dateRange: Joi.object({
      start: Joi.string().isoDate().required(),
      end: Joi.string().isoDate().required(),
    }).optional(),
    priceRange: Joi.object({
      min: Joi.number().min(0).required(),
      max: Joi.number().min(0).required(),
    }).optional(),
  }).optional(),
  sort: Joi.object({
    field: Joi.string().required(),
    order: Joi.string().valid('asc', 'desc').required(),
  }).optional(),
  page: Joi.number().integer().min(1).default(1),
  size: Joi.number().integer().min(1).max(100).default(10),
  highlight: Joi.boolean().default(true),
});

export class SearchController {
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { error, value } = searchSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          error: error.details[0].message,
        });
        return;
      }

      const params: SearchParams = {
        query: value.query,
        types: value.types as ContentType[] | undefined,
        filters: value.filters,
        sort: value.sort,
        page: value.page,
        size: value.size,
        highlight: value.highlight,
      };

      const result = await searchService.search(params);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const searchController = new SearchController();
