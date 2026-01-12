import { EmailStatus, EmailType, ProviderType, EmailEventType, BounceType } from '@prisma/client';

export interface SendEmailOptions {
  to: string;
  toName?: string;
  from?: string;
  fromName?: string;
  subject: string;
  html: string;
  text?: string;
  templateId?: string;
  variables?: Record<string, unknown>;
  priority?: number;
  scheduledAt?: Date;
  emailType?: EmailType;
  batchId?: string;
}

export interface SendBatchOptions {
  templateId: string;
  recipients: Array<{
    email: string;
    name?: string;
    variables?: Record<string, unknown>;
  }>;
  batchName?: string;
  priority?: number;
  scheduledAt?: Date;
}

export interface EmailJobData {
  jobId: string;
  to: string;
  toName?: string;
  from: string;
  fromName: string;
  subject: string;
  html: string;
  text?: string;
  trackingId: string;
  emailType: EmailType;
  attempt: number;
}

export interface SendResult {
  success: boolean;
  messageId?: string;
  provider: ProviderType;
  error?: string;
  errorCode?: string;
  isRetryable?: boolean;
}

export interface EmailJobResult {
  jobId: string;
  status: EmailStatus;
  trackingId: string;
  messageId?: string;
}

export interface BatchResult {
  batchId: string;
  totalCount: number;
  queuedCount: number;
}

export interface EmailStats {
  totalSent: number;
  totalDelivered: number;
  totalBounced: number;
  totalComplaints: number;
  totalOpened: number;
  totalClicked: number;
  totalFailed: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
}

export interface TrackingEvent {
  trackingId: string;
  eventType: 'open' | 'click';
  userAgent?: string;
  ipAddress?: string;
  url?: string;
  timestamp: Date;
}

export interface WebhookEvent {
  provider: ProviderType;
  eventType: EmailEventType;
  messageId?: string;
  email?: string;
  timestamp: Date;
  bounceType?: BounceType;
  bounceSubType?: string;
  diagnosticCode?: string;
  complaintType?: string;
  feedbackId?: string;
  rawPayload: unknown;
}

export { EmailStatus, EmailType, ProviderType, EmailEventType, BounceType };
