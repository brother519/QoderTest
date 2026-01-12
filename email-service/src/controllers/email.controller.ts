import { Request, Response } from 'express';
import { z } from 'zod';
import { EmailType } from '@prisma/client';
import { emailService } from '../services/index.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('email-controller');

// 请求验证 Schema
export const sendEmailSchema = z.object({
  templateId: z.string().uuid().optional(),
  to: z.string().email(),
  toName: z.string().optional(),
  from: z.string().email().optional(),
  fromName: z.string().optional(),
  subject: z.string().min(1).max(500),
  html: z.string().min(1),
  text: z.string().optional(),
  variables: z.record(z.unknown()).optional(),
  priority: z.number().int().min(1).max(4).optional(),
  scheduledAt: z.string().datetime().optional(),
  emailType: z.nativeEnum(EmailType).optional(),
});

export const sendBatchSchema = z.object({
  templateId: z.string().uuid(),
  recipients: z.array(z.object({
    email: z.string().email(),
    name: z.string().optional(),
    variables: z.record(z.unknown()).optional(),
  })).min(1).max(10000),
  batchName: z.string().optional(),
  priority: z.number().int().min(1).max(4).optional(),
  scheduledAt: z.string().datetime().optional(),
});

export class EmailController {
  /**
   * POST /api/v1/emails/send - 发送单封邮件
   */
  async sendEmail(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as z.infer<typeof sendEmailSchema>;
      
      const result = await emailService.sendEmail({
        templateId: data.templateId,
        to: data.to,
        toName: data.toName,
        from: data.from,
        fromName: data.fromName,
        subject: data.subject,
        html: data.html,
        text: data.text,
        variables: data.variables,
        priority: data.priority,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
        emailType: data.emailType,
      });
      
      res.status(201).json(result);
    } catch (error) {
      logger.error({ error }, 'Failed to send email');
      
      if (error instanceof Error && error.message.includes('unsubscribed')) {
        res.status(400).json({ error: error.message });
        return;
      }
      
      res.status(500).json({ error: 'Failed to send email' });
    }
  }
  
  /**
   * POST /api/v1/emails/send-batch - 发送批量邮件
   */
  async sendBatch(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as z.infer<typeof sendBatchSchema>;
      
      const result = await emailService.sendBatch({
        templateId: data.templateId,
        recipients: data.recipients,
        batchName: data.batchName,
        priority: data.priority,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
      });
      
      res.status(201).json(result);
    } catch (error) {
      logger.error({ error }, 'Failed to send batch emails');
      res.status(500).json({ error: 'Failed to send batch emails' });
    }
  }
  
  /**
   * GET /api/v1/emails/:jobId - 获取邮件状态
   */
  async getJobStatus(req: Request, res: Response): Promise<void> {
    try {
      const { jobId } = req.params;
      
      const result = await emailService.getJobStatus(jobId);
      
      if (!result) {
        res.status(404).json({ error: 'Email job not found' });
        return;
      }
      
      res.json(result);
    } catch (error) {
      logger.error({ error }, 'Failed to get job status');
      res.status(500).json({ error: 'Failed to get job status' });
    }
  }
  
  /**
   * POST /api/v1/emails/:jobId/cancel - 取消邮件任务
   */
  async cancelJob(req: Request, res: Response): Promise<void> {
    try {
      const { jobId } = req.params;
      
      const success = await emailService.cancelJob(jobId);
      
      if (!success) {
        res.status(400).json({ error: 'Cannot cancel job in current state' });
        return;
      }
      
      res.json({ success: true, message: 'Job cancelled' });
    } catch (error) {
      logger.error({ error }, 'Failed to cancel job');
      res.status(500).json({ error: 'Failed to cancel job' });
    }
  }
}

export const emailController = new EmailController();
