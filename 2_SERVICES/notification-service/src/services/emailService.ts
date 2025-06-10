import sgMail from '@sendgrid/mail';
import { SES } from 'aws-sdk';
import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';
import { NotificationRecipient, NotificationData, EmailProviderConfig } from '../types';

export class EmailService {
  private provider: string;
  private sendGridClient?: any;
  private sesClient?: SES;
  private smtpTransporter?: any;

  constructor() {
    this.provider = process.env.EMAIL_PROVIDER || 'sendgrid';
    this.initializeProvider();
  }

  private initializeProvider(): void {
    switch (this.provider) {
      case 'sendgrid':
        this.initializeSendGrid();
        break;
      case 'ses':
        this.initializeSES();
        break;
      case 'smtp':
        this.initializeSMTP();
        break;
      default:
        throw new Error(`Unsupported email provider: ${this.provider}`);
    }
  }

  private initializeSendGrid(): void {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      throw new Error('SENDGRID_API_KEY is required for SendGrid provider');
    }
    
    sgMail.setApiKey(apiKey);
    this.sendGridClient = sgMail;
    logger.info('SendGrid email service initialized');
  }

  private initializeSES(): void {
    const accessKeyId = process.env.SES_ACCESS_KEY_ID;
    const secretAccessKey = process.env.SES_SECRET_ACCESS_KEY;
    const region = process.env.SES_REGION || 'us-east-1';

    if (!accessKeyId || !secretAccessKey) {
      throw new Error('SES credentials are required for SES provider');
    }

    this.sesClient = new SES({
      accessKeyId,
      secretAccessKey,
      region
    });
    logger.info('Amazon SES email service initialized');
  }

  private initializeSMTP(): void {
    const smtpConfig = {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    };

    this.smtpTransporter = nodemailer.createTransporter(smtpConfig);
    logger.info('SMTP email service initialized');
  }

  public async sendEmail(
    recipient: NotificationRecipient,
    template: string,
    data: NotificationData,
    options: {
      subject?: string;
      htmlContent?: string;
      textContent?: string;
      attachments?: any[];
    } = {}
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      switch (this.provider) {
        case 'sendgrid':
          return await this.sendWithSendGrid(recipient, template, data, options);
        case 'ses':
          return await this.sendWithSES(recipient, template, data, options);
        case 'smtp':
          return await this.sendWithSMTP(recipient, template, data, options);
        default:
          throw new Error(`Provider ${this.provider} not implemented`);
      }
    } catch (error) {
      logger.error('Email sending error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async sendWithSendGrid(
    recipient: NotificationRecipient,
    template: string,
    data: NotificationData,
    options: any
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!recipient.email) {
      throw new Error('Email address is required');
    }

    const msg = {
      to: {
        email: recipient.email,
        name: `${recipient.firstName || ''} ${recipient.lastName || ''}`.trim()
      },
      from: {
        email: process.env.FROM_EMAIL || 'noreply@iworkz.com',
        name: process.env.FROM_NAME || 'iWORKZ Platform'
      },
      templateId: template,
      dynamicTemplateData: {
        ...data,
        user: {
          firstName: recipient.firstName,
          lastName: recipient.lastName,
          email: recipient.email
        }
      },
      trackingSettings: {
        clickTracking: { enable: true },
        openTracking: { enable: true },
        subscriptionTracking: { enable: false }
      },
      mailSettings: {
        bypassListManagement: { enable: false }
      }
    };

    if (options.subject) {
      msg.subject = options.subject;
    }

    const response = await this.sendGridClient.send(msg);
    
    return {
      success: true,
      messageId: response[0]?.headers?.['x-message-id']
    };
  }

  private async sendWithSES(
    recipient: NotificationRecipient,
    template: string,
    data: NotificationData,
    options: any
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!recipient.email) {
      throw new Error('Email address is required');
    }

    const params = {
      Source: process.env.FROM_EMAIL || 'noreply@iworkz.com',
      Destination: {
        ToAddresses: [recipient.email]
      },
      Message: {
        Subject: {
          Data: options.subject || 'Notification from iWORKZ',
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: options.htmlContent || '<p>No content provided</p>',
            Charset: 'UTF-8'
          },
          Text: {
            Data: options.textContent || 'No content provided',
            Charset: 'UTF-8'
          }
        }
      },
      Tags: [
        {
          Name: 'Template',
          Value: template
        },
        {
          Name: 'UserId',
          Value: recipient.userId
        }
      ]
    };

    const result = await this.sesClient!.sendEmail(params).promise();
    
    return {
      success: true,
      messageId: result.MessageId
    };
  }

  private async sendWithSMTP(
    recipient: NotificationRecipient,
    template: string,
    data: NotificationData,
    options: any
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!recipient.email) {
      throw new Error('Email address is required');
    }

    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'iWORKZ Platform'}" <${process.env.FROM_EMAIL || 'noreply@iworkz.com'}>`,
      to: recipient.email,
      subject: options.subject || 'Notification from iWORKZ',
      text: options.textContent,
      html: options.htmlContent,
      attachments: options.attachments || []
    };

    const result = await this.smtpTransporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: result.messageId
    };
  }

  public async sendBulkEmail(
    recipients: NotificationRecipient[],
    template: string,
    data: NotificationData,
    options: any = {}
  ): Promise<{
    success: boolean;
    sent: number;
    failed: number;
    results: Array<{ email: string; success: boolean; messageId?: string; error?: string }>;
  }> {
    const results = [];
    let sent = 0;
    let failed = 0;

    for (const recipient of recipients) {
      try {
        const result = await this.sendEmail(recipient, template, data, options);
        
        if (result.success) {
          sent++;
        } else {
          failed++;
        }

        results.push({
          email: recipient.email || '',
          success: result.success,
          messageId: result.messageId,
          error: result.error
        });

        // Rate limiting - small delay between emails
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        failed++;
        results.push({
          email: recipient.email || '',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return {
      success: failed === 0,
      sent,
      failed,
      results
    };
  }

  public async verifyEmailAddress(email: string): Promise<boolean> {
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return false;
    }

    // Provider-specific verification if available
    if (this.provider === 'ses' && this.sesClient) {
      try {
        await this.sesClient.getIdentityVerificationAttributes({
          Identities: [email]
        }).promise();
        return true;
      } catch {
        return false;
      }
    }

    return true; // Default to true for other providers
  }

  public async getDeliveryStats(messageId: string): Promise<any> {
    // Implementation would depend on the email provider's API
    // This is a placeholder for webhook-based delivery tracking
    return {
      messageId,
      status: 'delivered',
      timestamp: new Date()
    };
  }
}