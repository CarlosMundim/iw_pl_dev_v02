import Bull from 'bull';
import { logger } from '../utils/logger';

class QueueConfig {
  private static instance: QueueConfig;
  private notificationQueue: Bull.Queue;
  private webhookQueue: Bull.Queue;
  private cleanupQueue: Bull.Queue;

  private constructor() {
    this.initializeQueues();
  }

  public static getInstance(): QueueConfig {
    if (!QueueConfig.instance) {
      QueueConfig.instance = new QueueConfig();
    }
    return QueueConfig.instance;
  }

  private initializeQueues(): void {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    const concurrency = parseInt(process.env.QUEUE_CONCURRENCY || '5');

    // Main notification queue
    this.notificationQueue = new Bull('notification-queue', redisUrl, {
      defaultJobOptions: {
        attempts: parseInt(process.env.QUEUE_MAX_RETRIES || '3'),
        backoff: {
          type: 'exponential',
          delay: parseInt(process.env.QUEUE_RETRY_DELAY || '2000')
        },
        removeOnComplete: 100,
        removeOnFail: 50
      },
      settings: {
        stalledInterval: 30 * 1000,
        maxStalledCount: 1
      }
    });

    // Webhook processing queue
    this.webhookQueue = new Bull('webhook-queue', redisUrl, {
      defaultJobOptions: {
        attempts: 2,
        backoff: {
          type: 'exponential',
          delay: 1000
        },
        removeOnComplete: 50,
        removeOnFail: 25
      }
    });

    // Cleanup queue for old data
    this.cleanupQueue = new Bull('cleanup-queue', redisUrl, {
      defaultJobOptions: {
        attempts: 1,
        removeOnComplete: 10,
        removeOnFail: 5
      }
    });

    // Set up queue event listeners
    this.setupEventListeners();

    logger.info('Queue system initialized');
  }

  private setupEventListeners(): void {
    // Notification queue events
    this.notificationQueue.on('completed', (job) => {
      logger.info(`Notification job ${job.id} completed`, {
        jobId: job.id,
        type: job.data.type,
        recipient: job.data.recipient?.userId
      });
    });

    this.notificationQueue.on('failed', (job, err) => {
      logger.error(`Notification job ${job.id} failed:`, {
        jobId: job.id,
        error: err.message,
        type: job.data.type,
        recipient: job.data.recipient?.userId
      });
    });

    this.notificationQueue.on('stalled', (job) => {
      logger.warn(`Notification job ${job.id} stalled`, {
        jobId: job.id,
        type: job.data.type
      });
    });

    // Webhook queue events
    this.webhookQueue.on('completed', (job) => {
      logger.info(`Webhook job ${job.id} completed`);
    });

    this.webhookQueue.on('failed', (job, err) => {
      logger.error(`Webhook job ${job.id} failed:`, err.message);
    });

    // Global error handling
    this.notificationQueue.on('error', (error) => {
      logger.error('Notification queue error:', error);
    });

    this.webhookQueue.on('error', (error) => {
      logger.error('Webhook queue error:', error);
    });

    this.cleanupQueue.on('error', (error) => {
      logger.error('Cleanup queue error:', error);
    });
  }

  // Queue job methods
  public async addNotificationJob(
    type: string, 
    data: any, 
    options: Bull.JobOptions = {}
  ): Promise<Bull.Job> {
    const priority = this.getPriority(data.priority || 'medium');
    
    const jobOptions: Bull.JobOptions = {
      priority,
      delay: options.delay || 0,
      ...options
    };

    return await this.notificationQueue.add(type, data, jobOptions);
  }

  public async addWebhookJob(data: any, options: Bull.JobOptions = {}): Promise<Bull.Job> {
    return await this.webhookQueue.add('process-webhook', data, options);
  }

  public async addCleanupJob(data: any, options: Bull.JobOptions = {}): Promise<Bull.Job> {
    return await this.cleanupQueue.add('cleanup', data, options);
  }

  // Schedule recurring cleanup jobs
  public async scheduleCleanupJobs(): Promise<void> {
    // Clean old notification logs daily at 2 AM
    await this.cleanupQueue.add(
      'cleanup-logs',
      { type: 'notification_logs', olderThan: '30d' },
      {
        repeat: { cron: '0 2 * * *' },
        removeOnComplete: 1,
        removeOnFail: 1
      }
    );

    // Clean old user preferences cache weekly
    await this.cleanupQueue.add(
      'cleanup-cache',
      { type: 'user_preferences', olderThan: '7d' },
      {
        repeat: { cron: '0 3 * * 0' },
        removeOnComplete: 1,
        removeOnFail: 1
      }
    );

    logger.info('Cleanup jobs scheduled');
  }

  private getPriority(priority: string): number {
    switch (priority) {
      case 'high':
        return 1;
      case 'medium':
        return 5;
      case 'low':
        return 10;
      default:
        return 5;
    }
  }

  // Getters for queues
  public getNotificationQueue(): Bull.Queue {
    return this.notificationQueue;
  }

  public getWebhookQueue(): Bull.Queue {
    return this.webhookQueue;
  }

  public getCleanupQueue(): Bull.Queue {
    return this.cleanupQueue;
  }

  // Queue monitoring
  public async getQueueStats(): Promise<any> {
    const [notificationStats, webhookStats, cleanupStats] = await Promise.all([
      this.getQueueStatus(this.notificationQueue),
      this.getQueueStatus(this.webhookQueue),
      this.getQueueStatus(this.cleanupQueue)
    ]);

    return {
      notification: notificationStats,
      webhook: webhookStats,
      cleanup: cleanupStats
    };
  }

  private async getQueueStatus(queue: Bull.Queue): Promise<any> {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaiting(),
      queue.getActive(),
      queue.getCompleted(),
      queue.getFailed(),
      queue.getDelayed()
    ]);

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length
    };
  }

  // Graceful shutdown
  public async shutdown(): Promise<void> {
    try {
      await Promise.all([
        this.notificationQueue.close(),
        this.webhookQueue.close(),
        this.cleanupQueue.close()
      ]);
      logger.info('All queues closed successfully');
    } catch (error) {
      logger.error('Error closing queues:', error);
    }
  }
}

export const queueConfig = QueueConfig.getInstance();