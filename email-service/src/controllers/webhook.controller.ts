import { Request, Response } from 'express';
import crypto from 'crypto';
import { ProviderType, EmailEventType, BounceType, UnsubscribeSource } from '@prisma/client';
import { prisma } from '../config/database.js';
import { unsubscribeService } from '../services/index.js';
import { createLogger } from '../utils/logger.js';
import { config } from '../config/index.js';

const logger = createLogger('webhook-controller');

export class WebhookController {
  /**
   * POST /api/v1/webhooks/sendgrid - SendGrid webhook
   */
  async handleSendGrid(req: Request, res: Response): Promise<void> {
    try {
      // SendGrid 发送事件数组
      const events = req.body;
      
      if (!Array.isArray(events)) {
        res.status(400).json({ error: 'Invalid payload' });
        return;
      }
      
      // 立即响应 200，避免超时
      res.status(200).json({ received: true });
      
      // 异步处理事件
      this.processSendGridEvents(events).catch(err => {
        logger.error({ error: err }, 'Failed to process SendGrid events');
      });
    } catch (error) {
      logger.error({ error }, 'SendGrid webhook error');
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  private async processSendGridEvents(events: Array<Record<string, unknown>>): Promise<void> {
    for (const event of events) {
      try {
        const messageId = event.sg_message_id as string;
        const eventType = event.event as string;
        const email = event.email as string;
        const timestamp = new Date((event.timestamp as number) * 1000);
        
        // 查找对应的邮件任务
        const emailJob = messageId
          ? await prisma.emailJob.findFirst({
              where: { messageId: { contains: messageId.split('.')[0] } },
            })
          : null;
        
        // 映射事件类型
        let mappedEventType: EmailEventType | null = null;
        
        switch (eventType) {
          case 'delivered':
            mappedEventType = EmailEventType.DELIVERED;
            if (emailJob) {
              await prisma.emailJob.update({
                where: { id: emailJob.id },
                data: { status: 'DELIVERED', deliveredAt: timestamp },
              });
            }
            break;
            
          case 'bounce':
            mappedEventType = EmailEventType.BOUNCED;
            if (emailJob) {
              await prisma.emailJob.update({
                where: { id: emailJob.id },
                data: { status: 'BOUNCED' },
              });
            }
            // 记录退信
            const bounceType = (event.type as string) === 'blocked' ? BounceType.SOFT : BounceType.HARD;
            await prisma.bounce.create({
              data: {
                emailJobId: emailJob?.id,
                email,
                bounceType,
                bounceSubType: event.type as string,
                diagnosticCode: event.reason as string,
                provider: ProviderType.SENDGRID,
                timestamp,
              },
            });
            // 硬退信添加到退订列表
            if (bounceType === BounceType.HARD) {
              await unsubscribeService.addToUnsubscribeList(
                email,
                'Hard bounce',
                UnsubscribeSource.BOUNCE
              );
            }
            break;
            
          case 'spamreport':
            mappedEventType = EmailEventType.COMPLAINED;
            await prisma.complaint.create({
              data: {
                email,
                emailJobId: emailJob?.id,
                complaintType: 'spam',
                provider: ProviderType.SENDGRID,
                timestamp,
              },
            });
            // 自动退订
            await unsubscribeService.addToUnsubscribeList(
              email,
              'Spam complaint',
              UnsubscribeSource.COMPLAINT
            );
            break;
            
          case 'open':
            mappedEventType = EmailEventType.OPENED;
            break;
            
          case 'click':
            mappedEventType = EmailEventType.CLICKED;
            break;
            
          case 'dropped':
            mappedEventType = EmailEventType.FAILED;
            if (emailJob) {
              await prisma.emailJob.update({
                where: { id: emailJob.id },
                data: { status: 'FAILED', lastError: event.reason as string },
              });
            }
            break;
        }
        
        // 记录事件
        if (mappedEventType && emailJob) {
          await prisma.emailEvent.create({
            data: {
              emailJobId: emailJob.id,
              eventType: mappedEventType,
              provider: ProviderType.SENDGRID,
              timestamp,
              webhookPayload: event,
            },
          });
        }
        
        logger.debug({ eventType, email, messageId }, 'Processed SendGrid event');
      } catch (error) {
        logger.error({ error, event }, 'Failed to process SendGrid event');
      }
    }
  }
  
  /**
   * POST /api/v1/webhooks/aws-ses - AWS SES webhook (via SNS)
   */
  async handleAWSSES(req: Request, res: Response): Promise<void> {
    try {
      const message = req.body;
      
      // 处理 SNS 订阅确认
      if (message.Type === 'SubscriptionConfirmation') {
        logger.info({ subscribeUrl: message.SubscribeURL }, 'SNS subscription confirmation');
        // 自动确认订阅
        if (message.SubscribeURL) {
          fetch(message.SubscribeURL).catch(err => {
            logger.error({ error: err }, 'Failed to confirm SNS subscription');
          });
        }
        res.status(200).json({ received: true });
        return;
      }
      
      // 处理通知
      if (message.Type === 'Notification') {
        res.status(200).json({ received: true });
        
        // 异步处理
        this.processAWSSESNotification(message).catch(err => {
          logger.error({ error: err }, 'Failed to process AWS SES notification');
        });
        return;
      }
      
      res.status(200).json({ received: true });
    } catch (error) {
      logger.error({ error }, 'AWS SES webhook error');
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  private async processAWSSESNotification(message: Record<string, unknown>): Promise<void> {
    try {
      const notification = JSON.parse(message.Message as string);
      const notificationType = notification.notificationType;
      
      switch (notificationType) {
        case 'Bounce':
          await this.handleSESBounce(notification);
          break;
          
        case 'Complaint':
          await this.handleSESComplaint(notification);
          break;
          
        case 'Delivery':
          await this.handleSESDelivery(notification);
          break;
      }
    } catch (error) {
      logger.error({ error }, 'Failed to parse AWS SES notification');
    }
  }
  
  private async handleSESBounce(notification: Record<string, unknown>): Promise<void> {
    const bounce = notification.bounce as Record<string, unknown>;
    const mail = notification.mail as Record<string, unknown>;
    const messageId = mail.messageId as string;
    const timestamp = new Date(bounce.timestamp as string);
    
    const emailJob = messageId
      ? await prisma.emailJob.findFirst({ where: { messageId } })
      : null;
    
    const bounceType = (bounce.bounceType as string) === 'Permanent' 
      ? BounceType.HARD 
      : BounceType.SOFT;
    
    const recipients = bounce.bouncedRecipients as Array<{ emailAddress: string; diagnosticCode?: string }>;
    
    for (const recipient of recipients) {
      await prisma.bounce.create({
        data: {
          emailJobId: emailJob?.id,
          email: recipient.emailAddress,
          bounceType,
          bounceSubType: bounce.bounceSubType as string,
          diagnosticCode: recipient.diagnosticCode,
          provider: ProviderType.AWS_SES,
          timestamp,
        },
      });
      
      // 硬退信添加到退订列表
      if (bounceType === BounceType.HARD) {
        await unsubscribeService.addToUnsubscribeList(
          recipient.emailAddress,
          'Hard bounce',
          UnsubscribeSource.BOUNCE
        );
      }
    }
    
    if (emailJob) {
      await prisma.emailJob.update({
        where: { id: emailJob.id },
        data: { status: 'BOUNCED' },
      });
      
      await prisma.emailEvent.create({
        data: {
          emailJobId: emailJob.id,
          eventType: EmailEventType.BOUNCED,
          provider: ProviderType.AWS_SES,
          timestamp,
          webhookPayload: notification,
        },
      });
    }
    
    logger.info({ messageId, bounceType }, 'Processed AWS SES bounce');
  }
  
  private async handleSESComplaint(notification: Record<string, unknown>): Promise<void> {
    const complaint = notification.complaint as Record<string, unknown>;
    const mail = notification.mail as Record<string, unknown>;
    const messageId = mail.messageId as string;
    const timestamp = new Date(complaint.timestamp as string);
    
    const emailJob = messageId
      ? await prisma.emailJob.findFirst({ where: { messageId } })
      : null;
    
    const recipients = complaint.complainedRecipients as Array<{ emailAddress: string }>;
    
    for (const recipient of recipients) {
      await prisma.complaint.create({
        data: {
          email: recipient.emailAddress,
          emailJobId: emailJob?.id,
          complaintType: complaint.complaintFeedbackType as string,
          feedbackId: complaint.feedbackId as string,
          provider: ProviderType.AWS_SES,
          timestamp,
        },
      });
      
      // 自动退订
      await unsubscribeService.addToUnsubscribeList(
        recipient.emailAddress,
        'Spam complaint',
        UnsubscribeSource.COMPLAINT
      );
    }
    
    if (emailJob) {
      await prisma.emailEvent.create({
        data: {
          emailJobId: emailJob.id,
          eventType: EmailEventType.COMPLAINED,
          provider: ProviderType.AWS_SES,
          timestamp,
          webhookPayload: notification,
        },
      });
    }
    
    logger.info({ messageId }, 'Processed AWS SES complaint');
  }
  
  private async handleSESDelivery(notification: Record<string, unknown>): Promise<void> {
    const delivery = notification.delivery as Record<string, unknown>;
    const mail = notification.mail as Record<string, unknown>;
    const messageId = mail.messageId as string;
    const timestamp = new Date(delivery.timestamp as string);
    
    const emailJob = messageId
      ? await prisma.emailJob.findFirst({ where: { messageId } })
      : null;
    
    if (emailJob) {
      await prisma.emailJob.update({
        where: { id: emailJob.id },
        data: { status: 'DELIVERED', deliveredAt: timestamp },
      });
      
      await prisma.emailEvent.create({
        data: {
          emailJobId: emailJob.id,
          eventType: EmailEventType.DELIVERED,
          provider: ProviderType.AWS_SES,
          timestamp,
          webhookPayload: notification,
        },
      });
    }
    
    logger.debug({ messageId }, 'Processed AWS SES delivery');
  }
}

export const webhookController = new WebhookController();
