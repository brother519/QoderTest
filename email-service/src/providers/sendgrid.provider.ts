import sgMail from '@sendgrid/mail';
import { ProviderType } from '@prisma/client';
import { BaseEmailProvider, EmailMessage } from './base.provider.js';
import { SendResult } from '../types/email.types.js';
import { config } from '../config/index.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('sendgrid-provider');

export class SendGridProvider extends BaseEmailProvider {
  readonly type = ProviderType.SENDGRID;
  readonly name = 'SendGrid';
  
  constructor() {
    super();
    sgMail.setApiKey(config.sendgrid.apiKey);
  }
  
  async send(message: EmailMessage): Promise<SendResult> {
    try {
      const msg = {
        to: {
          email: message.to,
          name: message.toName,
        },
        from: {
          email: message.from || config.sendgrid.fromEmail,
          name: message.fromName || config.sendgrid.fromName,
        },
        subject: message.subject,
        html: message.html,
        text: message.text,
        headers: message.headers,
      };
      
      logger.debug({ to: message.to, subject: message.subject }, 'Sending email via SendGrid');
      
      const [response] = await sgMail.send(msg);
      
      // SendGrid 返回的 x-message-id 在响应头中
      const messageId = response.headers['x-message-id'] as string | undefined;
      
      logger.info(
        { messageId, statusCode: response.statusCode, to: message.to },
        'Email sent successfully via SendGrid'
      );
      
      return {
        success: true,
        messageId,
        provider: this.type,
      };
    } catch (error) {
      logger.error({ error, to: message.to }, 'Failed to send email via SendGrid');
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const isRetryable = this.isRetryableError(error);
      const errorCode = this.extractErrorCode(error);
      
      // SendGrid 特定错误处理
      if (error && typeof error === 'object' && 'response' in error) {
        const sgError = error as { response?: { body?: { errors?: Array<{ message: string }> } } };
        const errors = sgError.response?.body?.errors;
        if (errors && errors.length > 0) {
          return {
            success: false,
            provider: this.type,
            error: errors.map(e => e.message).join(', '),
            errorCode,
            isRetryable,
          };
        }
      }
      
      return {
        success: false,
        provider: this.type,
        error: errorMessage,
        errorCode,
        isRetryable,
      };
    }
  }
  
  async healthCheck(): Promise<boolean> {
    try {
      // SendGrid 没有专门的健康检查端点
      // 我们可以尝试验证 API key
      // 这里简单返回 true，实际可通过发送测试邮件验证
      return true;
    } catch {
      return false;
    }
  }
  
  async getQuotaUsage(): Promise<{ used: number; limit: number } | null> {
    // SendGrid 的配额信息需要通过 Stats API 获取
    // 这里返回 null 表示不支持配额查询
    return null;
  }
}
