import twilio from 'twilio';
import { SNS } from 'aws-sdk';
import { logger } from '../utils/logger';
import { NotificationRecipient, NotificationData } from '../types';

export class SMSService {
  private provider: string;
  private twilioClient?: any;
  private snsClient?: SNS;
  private twilioPhoneNumber?: string;

  constructor() {
    this.provider = process.env.SMS_PROVIDER || 'twilio';
    this.initializeProvider();
  }

  private initializeProvider(): void {
    switch (this.provider) {
      case 'twilio':
        this.initializeTwilio();
        break;
      case 'sns':
        this.initializeSNS();
        break;
      default:
        throw new Error(`Unsupported SMS provider: ${this.provider}`);
    }
  }

  private initializeTwilio(): void {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !this.twilioPhoneNumber) {
      throw new Error('Twilio credentials and phone number are required');
    }

    this.twilioClient = twilio(accountSid, authToken);
    logger.info('Twilio SMS service initialized');
  }

  private initializeSNS(): void {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION || 'us-east-1';

    if (!accessKeyId || !secretAccessKey) {
      throw new Error('AWS credentials are required for SNS provider');
    }

    this.snsClient = new SNS({
      accessKeyId,
      secretAccessKey,
      region
    });
    logger.info('AWS SNS SMS service initialized');
  }

  public async sendSMS(
    recipient: NotificationRecipient,
    message: string,
    options: {
      template?: string;
      data?: NotificationData;
      mediaUrls?: string[];
    } = {}
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!recipient.phone) {
        throw new Error('Phone number is required for SMS');
      }

      // Validate phone number format
      const phoneNumber = this.formatPhoneNumber(recipient.phone);
      if (!phoneNumber) {
        throw new Error('Invalid phone number format');
      }

      switch (this.provider) {
        case 'twilio':
          return await this.sendWithTwilio(phoneNumber, message, options);
        case 'sns':
          return await this.sendWithSNS(phoneNumber, message, options);
        default:
          throw new Error(`Provider ${this.provider} not implemented`);
      }
    } catch (error) {
      logger.error('SMS sending error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async sendWithTwilio(
    phoneNumber: string,
    message: string,
    options: any
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const messageOptions: any = {
      body: message,
      from: this.twilioPhoneNumber,
      to: phoneNumber
    };

    // Add media URLs if provided (for MMS)
    if (options.mediaUrls && options.mediaUrls.length > 0) {
      messageOptions.mediaUrl = options.mediaUrls;
    }

    const result = await this.twilioClient.messages.create(messageOptions);
    
    return {
      success: true,
      messageId: result.sid
    };
  }

  private async sendWithSNS(
    phoneNumber: string,
    message: string,
    options: any
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const params = {
      Message: message,
      PhoneNumber: phoneNumber,
      MessageAttributes: {
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String',
          StringValue: 'Transactional' // or 'Promotional'
        }
      }
    };

    const result = await this.snsClient!.publish(params).promise();
    
    return {
      success: true,
      messageId: result.MessageId
    };
  }

  public async sendBulkSMS(
    recipients: NotificationRecipient[],
    message: string,
    options: any = {}
  ): Promise<{
    success: boolean;
    sent: number;
    failed: number;
    results: Array<{ phone: string; success: boolean; messageId?: string; error?: string }>;
  }> {
    const results = [];
    let sent = 0;
    let failed = 0;

    for (const recipient of recipients) {
      try {
        const result = await this.sendSMS(recipient, message, options);
        
        if (result.success) {
          sent++;
        } else {
          failed++;
        }

        results.push({
          phone: recipient.phone || '',
          success: result.success,
          messageId: result.messageId,
          error: result.error
        });

        // Rate limiting - delay between SMS sends
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        failed++;
        results.push({
          phone: recipient.phone || '',
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

  public async sendOTP(
    recipient: NotificationRecipient,
    code: string,
    expiryMinutes: number = 10
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const message = `Your iWORKZ verification code is: ${code}. This code expires in ${expiryMinutes} minutes. Do not share this code with anyone.`;
    
    return await this.sendSMS(recipient, message, {
      template: 'otp_verification'
    });
  }

  public async sendSecurityAlert(
    recipient: NotificationRecipient,
    alertType: string,
    details: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const message = `iWORKZ Security Alert: ${alertType}. ${details}. If this wasn't you, please contact support immediately.`;
    
    return await this.sendSMS(recipient, message, {
      template: 'security_alert'
    });
  }

  public async sendInterviewReminder(
    recipient: NotificationRecipient,
    interviewDetails: {
      company: string;
      position: string;
      datetime: Date;
      location?: string;
      meetingLink?: string;
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const formattedDate = interviewDetails.datetime.toLocaleDateString();
    const formattedTime = interviewDetails.datetime.toLocaleTimeString();
    
    let message = `Interview Reminder: ${interviewDetails.position} at ${interviewDetails.company} on ${formattedDate} at ${formattedTime}`;
    
    if (interviewDetails.location) {
      message += `. Location: ${interviewDetails.location}`;
    }
    
    if (interviewDetails.meetingLink) {
      message += `. Meeting link: ${interviewDetails.meetingLink}`;
    }
    
    return await this.sendSMS(recipient, message, {
      template: 'interview_reminder'
    });
  }

  private formatPhoneNumber(phone: string): string | null {
    // Remove all non-numeric characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check if it's a valid international format
    if (cleanPhone.length >= 10 && cleanPhone.length <= 15) {
      // Add + if not present for international format
      return cleanPhone.startsWith('1') || cleanPhone.length > 10 
        ? `+${cleanPhone}`
        : `+1${cleanPhone}`; // Assume US number if 10 digits
    }
    
    return null;
  }

  public async validatePhoneNumber(phone: string): Promise<{ valid: boolean; formatted?: string; country?: string }> {
    try {
      const formattedPhone = this.formatPhoneNumber(phone);
      
      if (!formattedPhone) {
        return { valid: false };
      }

      if (this.provider === 'twilio' && this.twilioClient) {
        // Use Twilio's lookup service if available
        try {
          const lookup = await this.twilioClient.lookups.v1.phoneNumbers(formattedPhone).fetch();
          return {
            valid: true,
            formatted: lookup.phoneNumber,
            country: lookup.countryCode
          };
        } catch {
          // If lookup fails, still consider the basic format valid
          return { valid: true, formatted: formattedPhone };
        }
      }

      return { valid: true, formatted: formattedPhone };
    } catch (error) {
      logger.error('Phone validation error:', error);
      return { valid: false };
    }
  }

  public async getDeliveryStatus(messageId: string): Promise<any> {
    try {
      if (this.provider === 'twilio' && this.twilioClient) {
        const message = await this.twilioClient.messages(messageId).fetch();
        return {
          messageId,
          status: message.status,
          errorCode: message.errorCode,
          errorMessage: message.errorMessage,
          dateCreated: message.dateCreated,
          dateSent: message.dateSent,
          dateUpdated: message.dateUpdated
        };
      }

      // For other providers, this would need to be implemented based on their APIs
      return {
        messageId,
        status: 'sent',
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Error fetching delivery status:', error);
      return {
        messageId,
        status: 'unknown',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}