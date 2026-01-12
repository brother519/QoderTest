import { v4 as uuidv4 } from 'uuid';
import * as cheerio from 'cheerio';
import { EmailStatus, EmailType, EmailEventType } from '@prisma/client';
import { prisma } from '../config/database.js';
import { config } from '../config/index.js';
import { createLogger } from '../utils/logger.js';
import { templateService } from './template.service.js';
import { queueService } from './queue.service.js';
import { unsubscribeService } from './unsubscribe.service.js';
import {
  SendEmailOptions,
  SendBatchOptions,
  EmailJobResult,
  BatchResult,
  EmailJobData,
} from '../types/email.types.js';

const logger = createLogger('email-service');

export class EmailService {
  /**
   * 发送单封邮件
   */
  async sendEmail(options: SendEmailOptions): Promise<EmailJobResult> {
    // 检查退订状态（仅营销邮件）
    if (options.emailType === EmailType.MARKETING) {
      const isUnsubscribed = await unsubscribeService.isUnsubscribed(options.to);
      if (isUnsubscribed) {
        throw new Error(`Recipient ${options.to} has unsubscribed from marketing emails`);
      }
    }
    
    // 如果提供了模板ID，渲染模板
    let subject = options.subject;
    let htmlBody = options.html;
    let textBody = options.text;
    
    if (options.templateId) {
      const rendered = await templateService.render(
        options.templateId,
        options.variables || {}
      );
      subject = rendered.subject;
      htmlBody = rendered.htmlBody;
      textBody = rendered.textBody;
    }
    
    // 创建邮件任务记录
    const emailJob = await prisma.emailJob.create({
      data: {
        templateId: options.templateId,
        recipientEmail: options.to,
        recipientName: options.toName,
        fromEmail: options.from,
        fromName: options.fromName,
        subject,
        htmlBody,
        textBody,
        variables: options.variables || {},
        emailType: options.emailType || EmailType.TRANSACTIONAL,
        priority: options.priority || 3,
        scheduledAt: options.scheduledAt,
        batchId: options.batchId,
        status: EmailStatus.PENDING,
      },
    });
    
    // 创建追踪记录
    const tracking = await prisma.emailTracking.create({
      data: {
        emailJobId: emailJob.id,
        trackingId: uuidv4(),
      },
    });
    
    // 注入追踪像素和链接重写
    const processedHtml = this.processEmailHtml(
      htmlBody,
      tracking.trackingId,
      options.emailType || EmailType.TRANSACTIONAL,
      options.to
    );
    
    // 准备队列任务数据
    const jobData: EmailJobData = {
      jobId: emailJob.id,
      to: options.to,
      toName: options.toName,
      from: options.from || config.sendgrid.fromEmail,
      fromName: options.fromName || config.sendgrid.fromName,
      subject,
      html: processedHtml,
      text: textBody,
      trackingId: tracking.trackingId,
      emailType: options.emailType || EmailType.TRANSACTIONAL,
      attempt: 0,
    };
    
    // 计算延迟时间
    const delay = options.scheduledAt
      ? Math.max(0, options.scheduledAt.getTime() - Date.now())
      : undefined;
    
    // 添加到队列
    await queueService.addEmailJob(jobData, {
      priority: options.priority,
      delay,
    });
    
    logger.info(
      { jobId: emailJob.id, to: options.to, emailType: options.emailType },
      'Email job created and queued'
    );
    
    return {
      jobId: emailJob.id,
      status: EmailStatus.QUEUED,
      trackingId: tracking.trackingId,
    };
  }
  
  /**
   * 发送批量邮件
   */
  async sendBatch(options: SendBatchOptions): Promise<BatchResult> {
    // 获取模板
    const template = await templateService.getById(options.templateId);
    if (!template) {
      throw new Error(`Template not found: ${options.templateId}`);
    }
    
    // 创建批次记录
    const batch = await prisma.emailBatch.create({
      data: {
        name: options.batchName,
        templateId: options.templateId,
        totalRecipients: options.recipients.length,
        status: EmailStatus.PENDING,
      },
    });
    
    // 过滤已退订的收件人（仅营销邮件）
    let filteredRecipients = options.recipients;
    if (template.emailType === EmailType.MARKETING) {
      const emails = options.recipients.map(r => r.email);
      const unsubscribedEmails = await unsubscribeService.getUnsubscribedEmails(emails);
      const unsubscribedSet = new Set(unsubscribedEmails);
      
      filteredRecipients = options.recipients.filter(
        r => !unsubscribedSet.has(r.email)
      );
      
      if (filteredRecipients.length < options.recipients.length) {
        logger.info(
          {
            batchId: batch.id,
            total: options.recipients.length,
            filtered: filteredRecipients.length,
          },
          'Some recipients filtered due to unsubscribe'
        );
      }
    }
    
    // 创建邮件任务
    const jobs: Array<{ data: EmailJobData; options: { priority: number; delay?: number } }> = [];
    
    for (const recipient of filteredRecipients) {
      // 渲染模板
      const variables = recipient.variables || {};
      const rendered = templateService.renderTemplate(template, variables);
      
      // 创建邮件任务记录
      const emailJob = await prisma.emailJob.create({
        data: {
          templateId: options.templateId,
          recipientEmail: recipient.email,
          recipientName: recipient.name,
          subject: rendered.subject,
          htmlBody: rendered.htmlBody,
          textBody: rendered.textBody,
          variables,
          emailType: template.emailType,
          priority: options.priority || 4, // 批量邮件默认低优先级
          scheduledAt: options.scheduledAt,
          batchId: batch.id,
          status: EmailStatus.PENDING,
        },
      });
      
      // 创建追踪记录
      const tracking = await prisma.emailTracking.create({
        data: {
          emailJobId: emailJob.id,
          trackingId: uuidv4(),
        },
      });
      
      // 处理 HTML
      const processedHtml = this.processEmailHtml(
        rendered.htmlBody,
        tracking.trackingId,
        template.emailType,
        recipient.email
      );
      
      jobs.push({
        data: {
          jobId: emailJob.id,
          to: recipient.email,
          toName: recipient.name,
          from: config.sendgrid.fromEmail,
          fromName: config.sendgrid.fromName,
          subject: rendered.subject,
          html: processedHtml,
          text: rendered.textBody,
          trackingId: tracking.trackingId,
          emailType: template.emailType,
          attempt: 0,
        },
        options: {
          priority: options.priority || 4,
          delay: options.scheduledAt
            ? Math.max(0, options.scheduledAt.getTime() - Date.now())
            : undefined,
        },
      });
    }
    
    // 批量添加到队列
    await queueService.addBulkEmailJobs(jobs);
    
    // 更新批次状态
    await prisma.emailBatch.update({
      where: { id: batch.id },
      data: {
        status: EmailStatus.QUEUED,
        startedAt: new Date(),
      },
    });
    
    logger.info(
      { batchId: batch.id, totalCount: filteredRecipients.length },
      'Batch email jobs created and queued'
    );
    
    return {
      batchId: batch.id,
      totalCount: filteredRecipients.length,
      queuedCount: jobs.length,
    };
  }
  
  /**
   * 获取邮件任务状态
   */
  async getJobStatus(jobId: string): Promise<{
    job: {
      id: string;
      status: EmailStatus;
      recipientEmail: string;
      subject: string;
      sentAt: Date | null;
      deliveredAt: Date | null;
      attempts: number;
      lastError: string | null;
    };
    tracking: {
      opened: boolean;
      openCount: number;
      clicked: boolean;
      clickCount: number;
    } | null;
    events: Array<{
      eventType: EmailEventType;
      timestamp: Date;
    }>;
  } | null> {
    const job = await prisma.emailJob.findUnique({
      where: { id: jobId },
      include: {
        tracking: true,
        events: {
          orderBy: { timestamp: 'desc' },
          take: 20,
        },
      },
    });
    
    if (!job) {
      return null;
    }
    
    return {
      job: {
        id: job.id,
        status: job.status,
        recipientEmail: job.recipientEmail,
        subject: job.subject,
        sentAt: job.sentAt,
        deliveredAt: job.deliveredAt,
        attempts: job.attempts,
        lastError: job.lastError,
      },
      tracking: job.tracking
        ? {
            opened: job.tracking.opened,
            openCount: job.tracking.openCount,
            clicked: job.tracking.clicked,
            clickCount: job.tracking.clickCount,
          }
        : null,
      events: job.events.map(e => ({
        eventType: e.eventType,
        timestamp: e.timestamp,
      })),
    };
  }
  
  /**
   * 取消邮件任务
   */
  async cancelJob(jobId: string): Promise<boolean> {
    return queueService.cancelJob(jobId);
  }
  
  /**
   * 处理邮件 HTML：注入追踪像素和重写链接
   */
  private processEmailHtml(
    html: string,
    trackingId: string,
    emailType: EmailType,
    recipientEmail: string
  ): string {
    const $ = cheerio.load(html);
    
    // 注入追踪像素
    const trackingPixelUrl = `${config.apiBaseUrl}/api/v1/tracking/pixel/${trackingId}`;
    const pixelImg = `<img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" alt="" />`;
    $('body').append(pixelImg);
    
    // 重写链接用于点击追踪
    $('a[href]').each((_, element) => {
      const $el = $(element);
      const originalUrl = $el.attr('href');
      
      // 跳过特殊链接
      if (
        !originalUrl ||
        originalUrl.startsWith('mailto:') ||
        originalUrl.startsWith('tel:') ||
        originalUrl.startsWith('#') ||
        originalUrl.includes('unsubscribe') // 退订链接不追踪
      ) {
        return;
      }
      
      const trackingUrl = `${config.apiBaseUrl}/api/v1/tracking/click/${trackingId}?url=${encodeURIComponent(originalUrl)}`;
      $el.attr('href', trackingUrl);
    });
    
    // 为营销邮件添加退订链接
    if (emailType === EmailType.MARKETING) {
      const unsubscribeToken = unsubscribeService.generateToken(recipientEmail);
      const unsubscribeUrl = `${config.apiBaseUrl}/api/v1/unsubscribe/${unsubscribeToken}`;
      
      const unsubscribeHtml = `
        <div style="text-align: center; margin-top: 20px; padding: 10px; font-size: 12px; color: #666;">
          <p>如果您不想再收到此类邮件，请点击 <a href="${unsubscribeUrl}" style="color: #666;">取消订阅</a></p>
        </div>
      `;
      
      $('body').append(unsubscribeHtml);
    }
    
    return $.html();
  }
}

export const emailService = new EmailService();
