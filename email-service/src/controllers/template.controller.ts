import { Request, Response } from 'express';
import { z } from 'zod';
import { EmailType } from '@prisma/client';
import { templateService } from '../services/index.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('template-controller');

// 请求验证 Schema
export const createTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  subject: z.string().min(1).max(500),
  htmlBody: z.string().min(1),
  textBody: z.string().optional(),
  category: z.string().optional(),
  emailType: z.nativeEnum(EmailType).optional(),
  variables: z.array(z.string()).optional(),
});

export const updateTemplateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  subject: z.string().min(1).max(500).optional(),
  htmlBody: z.string().min(1).optional(),
  textBody: z.string().optional(),
  category: z.string().optional(),
  emailType: z.nativeEnum(EmailType).optional(),
  variables: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export const previewTemplateSchema = z.object({
  variables: z.record(z.unknown()),
});

export const listTemplatesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  category: z.string().optional(),
  emailType: z.nativeEnum(EmailType).optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

export class TemplateController {
  /**
   * POST /api/v1/templates - 创建模板
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as z.infer<typeof createTemplateSchema>;
      
      const template = await templateService.create(data);
      
      res.status(201).json(template);
    } catch (error) {
      logger.error({ error }, 'Failed to create template');
      
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        res.status(400).json({ error: 'Template name already exists' });
        return;
      }
      
      res.status(500).json({ error: 'Failed to create template' });
    }
  }
  
  /**
   * GET /api/v1/templates - 列出模板
   */
  async list(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query as unknown as z.infer<typeof listTemplatesSchema>;
      
      const result = await templateService.list({
        page: query.page,
        limit: query.limit,
        category: query.category,
        emailType: query.emailType,
        isActive: query.isActive,
        search: query.search,
      });
      
      res.json({
        templates: result.templates,
        total: result.total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(result.total / query.limit),
      });
    } catch (error) {
      logger.error({ error }, 'Failed to list templates');
      res.status(500).json({ error: 'Failed to list templates' });
    }
  }
  
  /**
   * GET /api/v1/templates/:id - 获取单个模板
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const template = await templateService.getById(id);
      
      if (!template) {
        res.status(404).json({ error: 'Template not found' });
        return;
      }
      
      res.json(template);
    } catch (error) {
      logger.error({ error }, 'Failed to get template');
      res.status(500).json({ error: 'Failed to get template' });
    }
  }
  
  /**
   * PUT /api/v1/templates/:id - 更新模板
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body as z.infer<typeof updateTemplateSchema>;
      
      const template = await templateService.update(id, data);
      
      res.json(template);
    } catch (error) {
      logger.error({ error }, 'Failed to update template');
      
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ error: 'Template not found' });
        return;
      }
      
      res.status(500).json({ error: 'Failed to update template' });
    }
  }
  
  /**
   * DELETE /api/v1/templates/:id - 删除模板
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      await templateService.delete(id);
      
      res.json({ success: true, message: 'Template deleted' });
    } catch (error) {
      logger.error({ error }, 'Failed to delete template');
      res.status(500).json({ error: 'Failed to delete template' });
    }
  }
  
  /**
   * POST /api/v1/templates/:id/preview - 预览模板
   */
  async preview(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { variables } = req.body as z.infer<typeof previewTemplateSchema>;
      
      const result = await templateService.preview(id, variables);
      
      res.json(result);
    } catch (error) {
      logger.error({ error }, 'Failed to preview template');
      
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ error: 'Template not found' });
        return;
      }
      
      res.status(500).json({ error: 'Failed to preview template' });
    }
  }
}

export const templateController = new TemplateController();
