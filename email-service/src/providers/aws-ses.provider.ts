import { SESClient, SendEmailCommand, GetSendQuotaCommand } from '@aws-sdk/client-ses';
import { ProviderType } from '@prisma/client';
import { BaseEmailProvider, EmailMessage } from './base.provider.js';
import { SendResult } from '../types/email.types.js';
import { config } from '../config/index.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('aws-ses-provider');

export class AWSSESProvider extends BaseEmailProvider {
  readonly type = ProviderType.AWS_SES;
  readonly name = 'AWS SES';
  
  private client: SESClient;
  
  constructor() {
    super();
    this.client = new SESClient({
      region: config.awsSes.region,
      credentials: {
        accessKeyId: config.awsSes.accessKeyId,
        secretAccessKey: config.awsSes.secretAccessKey,
      },
    });
  }
  
  async send(message: EmailMessage): Promise<SendResult> {
    try {
      const fromAddress = message.fromName
        ? `${message.fromName} <${message.from || config.awsSes.fromEmail}>`
        : message.from || config.awsSes.fromEmail;
      
      const toAddress = message.toName
        ? `${message.toName} <${message.to}>`
        : message.to;
      
      const command = new SendEmailCommand({
        Source: fromAddress,
        Destination: {
          ToAddresses: [toAddress],
        },
        Message: {
          Subject: {
            Data: message.subject,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: message.html,
              Charset: 'UTF-8',
            },
            ...(message.text && {
              Text: {
                Data: message.text,
                Charset: 'UTF-8',
              },
            }),
          },
        },
      });
      
      logger.debug({ to: message.to, subject: message.subject }, 'Sending email via AWS SES');
      
      const response = await this.client.send(command);
      const messageId = response.MessageId;
      
      logger.info(
        { messageId, to: message.to },
        'Email sent successfully via AWS SES'
      );
      
      return {
        success: true,
        messageId,
        provider: this.type,
      };
    } catch (error) {
      logger.error({ error, to: message.to }, 'Failed to send email via AWS SES');
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const isRetryable = this.isRetryableError(error);
      const errorCode = this.extractErrorCode(error);
      
      // AWS SES 特定错误处理
      if (error && typeof error === 'object' && 'name' in error) {
        const awsError = error as { name: string; $metadata?: { httpStatusCode?: number } };
        
        // 检查是否是限流或临时错误
        if (awsError.name === 'Throttling' || awsError.name === 'ServiceUnavailable') {
          return {
            success: false,
            provider: this.type,
            error: errorMessage,
            errorCode: awsError.name,
            isRetryable: true,
          };
        }
        
        // 检查 HTTP 状态码
        const statusCode = awsError.$metadata?.httpStatusCode;
        if (statusCode === 429 || statusCode === 503) {
          return {
            success: false,
            provider: this.type,
            error: errorMessage,
            errorCode: String(statusCode),
            isRetryable: true,
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
      const command = new GetSendQuotaCommand({});
      await this.client.send(command);
      return true;
    } catch (error) {
      logger.error({ error }, 'AWS SES health check failed');
      return false;
    }
  }
  
  async getQuotaUsage(): Promise<{ used: number; limit: number } | null> {
    try {
      const command = new GetSendQuotaCommand({});
      const response = await this.client.send(command);
      
      return {
        used: response.SentLast24Hours || 0,
        limit: response.Max24HourSend || 0,
      };
    } catch (error) {
      logger.error({ error }, 'Failed to get AWS SES quota');
      return null;
    }
  }
}
