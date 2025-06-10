export interface NotificationChannel {
  email?: boolean;
  sms?: boolean;
  push?: boolean;
  inApp?: boolean;
}

export interface NotificationRecipient {
  userId: string;
  email?: string;
  phone?: string;
  deviceTokens?: string[];
  firstName?: string;
  lastName?: string;
  locale?: string;
  timezone?: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'in_app';
  subject?: string;
  body: string;
  htmlBody?: string;
  variables: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationData {
  [key: string]: any;
}

export interface NotificationRequest {
  type: 'transactional' | 'marketing' | 'system';
  template: string;
  recipient: NotificationRecipient;
  data: NotificationData;
  channels: NotificationChannel;
  priority: 'high' | 'medium' | 'low';
  scheduledAt?: Date;
  expiresAt?: Date;
  metadata?: {
    campaignId?: string;
    source?: string;
    trackingId?: string;
  };
}

export interface BulkNotificationRequest {
  type: 'marketing' | 'system';
  template: string;
  recipients: NotificationRecipient[];
  data: NotificationData;
  channels: NotificationChannel;
  priority: 'high' | 'medium' | 'low';
  scheduledAt?: Date;
  metadata?: {
    campaignId?: string;
    source?: string;
  };
}

export interface NotificationPreferences {
  userId: string;
  email: {
    jobMatches: boolean;
    applicationUpdates: boolean;
    weeklyDigest: boolean;
    marketing: boolean;
    security: boolean;
  };
  push: {
    jobMatches: boolean;
    messages: boolean;
    applicationUpdates: boolean;
    systemAlerts: boolean;
  };
  sms: {
    security: boolean;
    interviews: boolean;
    urgentJobs: boolean;
  };
  frequency: {
    immediate: boolean;
    daily: boolean;
    weekly: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // "22:00"
    end: string;   // "08:00"
    timezone: string;
  };
  language: string;
  updatedAt: Date;
}

export interface NotificationLog {
  id: string;
  notificationId: string;
  userId: string;
  type: string;
  channel: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced' | 'opened' | 'clicked';
  provider?: string;
  providerMessageId?: string;
  errorMessage?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationStats {
  sent: number;
  delivered: number;
  failed: number;
  opened: number;
  clicked: number;
  unsubscribed: number;
  bounced: number;
}

export interface CampaignStats extends NotificationStats {
  campaignId: string;
  startDate: Date;
  endDate?: Date;
  channels: {
    email: NotificationStats;
    sms: NotificationStats;
    push: NotificationStats;
  };
}

export interface WebhookPayload {
  event: string;
  notificationId: string;
  userId: string;
  timestamp: Date;
  data: any;
}

export interface QueueJob {
  id: string;
  type: 'send_notification' | 'process_webhook' | 'cleanup_logs';
  data: any;
  priority: number;
  attempts: number;
  delay?: number;
}

export interface EmailProviderConfig {
  provider: 'sendgrid' | 'ses' | 'smtp';
  apiKey?: string;
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
}

export interface SMSProviderConfig {
  provider: 'twilio' | 'sns';
  accountSid?: string;
  authToken?: string;
  phoneNumber?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  region?: string;
}

export interface PushProviderConfig {
  provider: 'firebase' | 'apns';
  projectId?: string;
  privateKey?: string;
  clientEmail?: string;
  keyId?: string;
  teamId?: string;
  bundleId?: string;
}