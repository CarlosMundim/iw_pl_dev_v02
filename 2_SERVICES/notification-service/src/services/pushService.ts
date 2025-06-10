import admin from 'firebase-admin';
import { logger } from '../utils/logger';
import { NotificationRecipient, NotificationData } from '../types';

export class PushService {
  private firebaseApp: admin.app.App;
  private messaging: admin.messaging.Messaging;

  constructor() {
    this.initializeFirebase();
    this.messaging = admin.messaging();
  }

  private initializeFirebase(): void {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

    if (!projectId || !privateKey || !clientEmail) {
      throw new Error('Firebase credentials are required for push notifications');
    }

    // Check if Firebase app is already initialized
    try {
      this.firebaseApp = admin.app();
    } catch {
      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          privateKey,
          clientEmail
        }),
        projectId
      });
    }

    logger.info('Firebase push notification service initialized');
  }

  public async sendPushNotification(
    recipient: NotificationRecipient,
    title: string,
    body: string,
    options: {
      data?: NotificationData;
      imageUrl?: string;
      clickAction?: string;
      badge?: number;
      sound?: string;
      priority?: 'high' | 'normal';
      ttl?: number;
      topic?: string;
    } = {}
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!recipient.deviceTokens || recipient.deviceTokens.length === 0) {
        throw new Error('Device tokens are required for push notifications');
      }

      const message: admin.messaging.MulticastMessage = {
        notification: {
          title,
          body,
          imageUrl: options.imageUrl
        },
        data: {
          ...(options.data || {}),
          userId: recipient.userId,
          timestamp: new Date().toISOString()
        },
        android: {
          priority: options.priority === 'high' ? 'high' : 'normal',
          ttl: options.ttl || 86400000, // 24 hours default
          notification: {
            title,
            body,
            imageUrl: options.imageUrl,
            clickAction: options.clickAction,
            sound: options.sound || 'default',
            channelId: 'iworkz_notifications'
          }
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title,
                body
              },
              badge: options.badge,
              sound: options.sound || 'default',
              category: options.clickAction
            }
          },
          headers: {
            'apns-priority': options.priority === 'high' ? '10' : '5',
            'apns-expiration': options.ttl 
              ? Math.floor(Date.now() / 1000) + Math.floor(options.ttl / 1000)
              : Math.floor(Date.now() / 1000) + 86400
          }
        },
        webpush: {
          notification: {
            title,
            body,
            icon: '/icons/notification-icon.png',
            image: options.imageUrl,
            badge: '/icons/badge-icon.png',
            actions: options.clickAction ? [
              {
                action: 'view',
                title: 'View Details'
              }
            ] : undefined
          },
          fcmOptions: {
            link: options.clickAction
          }
        },
        tokens: recipient.deviceTokens
      };

      const response = await this.messaging.sendMulticast(message);

      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(recipient.deviceTokens![idx]);
          }
        });

        // Clean up invalid tokens
        await this.cleanupInvalidTokens(recipient.userId, failedTokens);

        logger.warn(`Push notification partially failed`, {
          userId: recipient.userId,
          successCount: response.successCount,
          failureCount: response.failureCount,
          failedTokens
        });
      }

      return {
        success: response.successCount > 0,
        messageId: response.responses[0]?.messageId
      };
    } catch (error) {
      logger.error('Push notification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  public async sendToTopic(
    topic: string,
    title: string,
    body: string,
    options: {
      data?: NotificationData;
      imageUrl?: string;
      clickAction?: string;
      condition?: string;
    } = {}
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const message: admin.messaging.Message = {
        notification: {
          title,
          body,
          imageUrl: options.imageUrl
        },
        data: options.data || {},
        android: {
          notification: {
            title,
            body,
            imageUrl: options.imageUrl,
            clickAction: options.clickAction,
            channelId: 'iworkz_notifications'
          }
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title,
                body
              },
              sound: 'default'
            }
          }
        },
        webpush: {
          notification: {
            title,
            body,
            icon: '/icons/notification-icon.png',
            image: options.imageUrl
          }
        }
      };

      if (options.condition) {
        message.condition = options.condition;
      } else {
        message.topic = topic;
      }

      const response = await this.messaging.send(message);

      return {
        success: true,
        messageId: response
      };
    } catch (error) {
      logger.error('Topic push notification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  public async subscribeTo Topic(
    deviceTokens: string[],
    topic: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.messaging.subscribeToTopic(deviceTokens, topic);
      
      logger.info(`Subscribed ${deviceTokens.length} devices to topic: ${topic}`);
      
      return { success: true };
    } catch (error) {
      logger.error('Topic subscription error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  public async unsubscribeFromTopic(
    deviceTokens: string[],
    topic: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.messaging.unsubscribeFromTopic(deviceTokens, topic);
      
      logger.info(`Unsubscribed ${deviceTokens.length} devices from topic: ${topic}`);
      
      return { success: true };
    } catch (error) {
      logger.error('Topic unsubscription error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  public async sendJobMatchNotification(
    recipient: NotificationRecipient,
    jobData: {
      title: string;
      company: string;
      location: string;
      matchScore: number;
      jobId: string;
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const title = `New Job Match! 🎯`;
    const body = `${jobData.title} at ${jobData.company} - ${jobData.matchScore}% match`;

    return await this.sendPushNotification(recipient, title, body, {
      data: {
        type: 'job_match',
        jobId: jobData.jobId,
        matchScore: jobData.matchScore.toString()
      },
      clickAction: `/jobs/${jobData.jobId}`,
      priority: 'high'
    });
  }

  public async sendMessageNotification(
    recipient: NotificationRecipient,
    messageData: {
      senderName: string;
      preview: string;
      conversationId: string;
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const title = `New Message from ${messageData.senderName}`;
    const body = messageData.preview;

    return await this.sendPushNotification(recipient, title, body, {
      data: {
        type: 'message',
        conversationId: messageData.conversationId
      },
      clickAction: `/messages/${messageData.conversationId}`,
      priority: 'high'
    });
  }

  public async sendApplicationStatusNotification(
    recipient: NotificationRecipient,
    applicationData: {
      company: string;
      position: string;
      status: string;
      applicationId: string;
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const title = `Application Update`;
    const body = `Your application for ${applicationData.position} at ${applicationData.company} is now ${applicationData.status}`;

    return await this.sendPushNotification(recipient, title, body, {
      data: {
        type: 'application_status',
        applicationId: applicationData.applicationId,
        status: applicationData.status
      },
      clickAction: `/applications/${applicationData.applicationId}`,
      priority: 'normal'
    });
  }

  public async sendBulkPushNotification(
    recipients: NotificationRecipient[],
    title: string,
    body: string,
    options: any = {}
  ): Promise<{
    success: boolean;
    sent: number;
    failed: number;
    results: Array<{ userId: string; success: boolean; messageId?: string; error?: string }>;
  }> {
    const results = [];
    let sent = 0;
    let failed = 0;

    // Group recipients by batch for efficient sending
    const batchSize = 500; // Firebase FCM limit
    const batches = this.chunkArray(recipients, batchSize);

    for (const batch of batches) {
      const batchResults = await Promise.allSettled(
        batch.map(recipient => 
          this.sendPushNotification(recipient, title, body, options)
        )
      );

      batchResults.forEach((result, index) => {
        const recipient = batch[index];
        
        if (result.status === 'fulfilled' && result.value.success) {
          sent++;
          results.push({
            userId: recipient.userId,
            success: true,
            messageId: result.value.messageId
          });
        } else {
          failed++;
          results.push({
            userId: recipient.userId,
            success: false,
            error: result.status === 'fulfilled' 
              ? result.value.error 
              : 'Promise rejected'
          });
        }
      });

      // Rate limiting between batches
      if (batches.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return {
      success: failed === 0,
      sent,
      failed,
      results
    };
  }

  private async cleanupInvalidTokens(userId: string, invalidTokens: string[]): Promise<void> {
    // This would typically update the user's device tokens in the database
    logger.info(`Cleaning up ${invalidTokens.length} invalid tokens for user ${userId}`);
    
    // Implementation would depend on your user management system
    // For example, you might call an API to remove these tokens from the user's profile
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  public async validateDeviceToken(token: string): Promise<boolean> {
    try {
      // Send a test message to validate the token
      const message: admin.messaging.Message = {
        data: { test: 'true' },
        token
      };

      await this.messaging.send(message, true); // dry run
      return true;
    } catch (error) {
      logger.debug(`Invalid device token: ${token}`);
      return false;
    }
  }
}