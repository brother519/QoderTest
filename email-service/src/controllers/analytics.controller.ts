import { Request, Response } from 'express';
import { z } from 'zod';
import { analyticsService, queueService } from '../services/index.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('analytics-controller');

export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const bounceAnalysisSchema = z.object({
  type: z.enum(['HARD', 'SOFT']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export class AnalyticsController {
  /**
   * GET /api/v1/analytics/overview - 总体统计
   */
  async getOverview(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query as z.infer<typeof dateRangeSchema>;
      
      const stats = await analyticsService.getOverviewStats(
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );
      
      res.json(stats);
    } catch (error) {
      logger.error({ error }, 'Failed to get overview stats');
      res.status(500).json({ error: 'Failed to get overview stats' });
    }
  }
  
  /**
   * GET /api/v1/analytics/daily - 每日统计
   */
  async getDailyStats(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        res.status(400).json({ error: 'startDate and endDate are required' });
        return;
      }
      
      const stats = await analyticsService.getDailyStats(
        new Date(startDate as string),
        new Date(endDate as string)
      );
      
      res.json({ dailyStats: stats });
    } catch (error) {
      logger.error({ error }, 'Failed to get daily stats');
      res.status(500).json({ error: 'Failed to get daily stats' });
    }
  }
  
  /**
   * GET /api/v1/analytics/template/:templateId - 模板统计
   */
  async getTemplateStats(req: Request, res: Response): Promise<void> {
    try {
      const { templateId } = req.params;
      
      const stats = await analyticsService.getTemplateStats(templateId);
      
      res.json(stats);
    } catch (error) {
      logger.error({ error }, 'Failed to get template stats');
      res.status(500).json({ error: 'Failed to get template stats' });
    }
  }
  
  /**
   * GET /api/v1/analytics/bounces - 退信分析
   */
  async getBounceAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const { type, startDate, endDate } = req.query as z.infer<typeof bounceAnalysisSchema>;
      
      const bounces = await analyticsService.getBounceAnalysis(
        type,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );
      
      res.json({ bounces });
    } catch (error) {
      logger.error({ error }, 'Failed to get bounce analysis');
      res.status(500).json({ error: 'Failed to get bounce analysis' });
    }
  }
  
  /**
   * GET /api/v1/analytics/providers - 提供商统计
   */
  async getProviderStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await analyticsService.getProviderStats();
      
      res.json({ providers: stats });
    } catch (error) {
      logger.error({ error }, 'Failed to get provider stats');
      res.status(500).json({ error: 'Failed to get provider stats' });
    }
  }
  
  /**
   * GET /api/v1/analytics/queue - 队列统计
   */
  async getQueueStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await queueService.getQueueStats();
      
      res.json(stats);
    } catch (error) {
      logger.error({ error }, 'Failed to get queue stats');
      res.status(500).json({ error: 'Failed to get queue stats' });
    }
  }
}

export const analyticsController = new AnalyticsController();
