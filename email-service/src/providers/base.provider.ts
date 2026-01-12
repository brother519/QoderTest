import { ProviderType } from '@prisma/client';
import { SendResult } from '../types/email.types.js';

export interface EmailMessage {
  to: string;
  toName?: string;
  from: string;
  fromName?: string;
  subject: string;
  html: string;
  text?: string;
  headers?: Record<string, string>;
}

export abstract class BaseEmailProvider {
  abstract readonly type: ProviderType;
  abstract readonly name: string;
  
  /**
   * 发送单封邮件
   */
  abstract send(message: EmailMessage): Promise<SendResult>;
  
  /**
   * 健康检查
   */
  abstract healthCheck(): Promise<boolean>;
  
  /**
   * 获取当前配额使用情况
   */
  abstract getQuotaUsage(): Promise<{ used: number; limit: number } | null>;
  
  /**
   * 判断错误是否可重试
   */
  protected isRetryableError(error: unknown): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      // 网络错误、超时、服务暂时不可用等
      return (
        message.includes('timeout') ||
        message.includes('network') ||
        message.includes('econnrefused') ||
        message.includes('econnreset') ||
        message.includes('503') ||
        message.includes('429') ||
        message.includes('rate limit')
      );
    }
    return false;
  }
  
  /**
   * 从错误中提取错误码
   */
  protected extractErrorCode(error: unknown): string | undefined {
    if (error && typeof error === 'object') {
      const err = error as Record<string, unknown>;
      if ('code' in err) return String(err.code);
      if ('statusCode' in err) return String(err.statusCode);
    }
    return undefined;
  }
}
