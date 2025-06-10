import Redis from 'redis';
import { logger } from '../utils/logger';

class DatabaseConfig {
  private static instance: DatabaseConfig;
  private redisClient: any;

  private constructor() {}

  public static getInstance(): DatabaseConfig {
    if (!DatabaseConfig.instance) {
      DatabaseConfig.instance = new DatabaseConfig();
    }
    return DatabaseConfig.instance;
  }

  public async connectRedis(): Promise<void> {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      
      this.redisClient = Redis.createClient({
        url: redisUrl,
        retry_unfulfilled_commands: true,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              return new Error('Redis connection failed after 10 retries');
            }
            return Math.min(retries * 50, 1000);
          }
        }
      });

      this.redisClient.on('error', (err: Error) => {
        logger.error('Redis connection error:', err);
      });

      this.redisClient.on('connect', () => {
        logger.info('Connected to Redis');
      });

      this.redisClient.on('ready', () => {
        logger.info('Redis client ready');
      });

      this.redisClient.on('end', () => {
        logger.warn('Redis connection ended');
      });

      await this.redisClient.connect();
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  public getRedisClient() {
    if (!this.redisClient) {
      throw new Error('Redis client not initialized. Call connectRedis() first.');
    }
    return this.redisClient;
  }

  public async disconnect(): Promise<void> {
    try {
      if (this.redisClient) {
        await this.redisClient.quit();
        logger.info('Disconnected from Redis');
      }
    } catch (error) {
      logger.error('Error disconnecting from Redis:', error);
    }
  }

  // Cache operations for notification data
  public async setCache(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      const client = this.getRedisClient();
      await client.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      logger.error('Cache set error:', error);
      throw error;
    }
  }

  public async getCache(key: string): Promise<any> {
    try {
      const client = this.getRedisClient();
      const value = await client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  public async deleteCache(key: string): Promise<void> {
    try {
      const client = this.getRedisClient();
      await client.del(key);
    } catch (error) {
      logger.error('Cache delete error:', error);
    }
  }

  public async incrementCounter(key: string, increment: number = 1): Promise<number> {
    try {
      const client = this.getRedisClient();
      return await client.incrBy(key, increment);
    } catch (error) {
      logger.error('Counter increment error:', error);
      throw error;
    }
  }

  // User preferences cache
  public async getUserPreferences(userId: string): Promise<any> {
    const key = `user_preferences:${userId}`;
    return await this.getCache(key);
  }

  public async setUserPreferences(userId: string, preferences: any, ttl: number = 86400): Promise<void> {
    const key = `user_preferences:${userId}`;
    await this.setCache(key, preferences, ttl);
  }

  // Template cache
  public async getTemplate(templateId: string): Promise<any> {
    const key = `template:${templateId}`;
    return await this.getCache(key);
  }

  public async setTemplate(templateId: string, template: any, ttl: number = 3600): Promise<void> {
    const key = `template:${templateId}`;
    await this.setCache(key, template, ttl);
  }

  // Rate limiting
  public async checkRateLimit(key: string, limit: number, windowMs: number): Promise<{ allowed: boolean; remaining: number }> {
    try {
      const client = this.getRedisClient();
      const current = await client.incr(key);
      
      if (current === 1) {
        await client.expire(key, Math.floor(windowMs / 1000));
      }
      
      const remaining = Math.max(0, limit - current);
      const allowed = current <= limit;
      
      return { allowed, remaining };
    } catch (error) {
      logger.error('Rate limit check error:', error);
      return { allowed: true, remaining: limit };
    }
  }

  // Notification tracking
  public async trackNotification(notificationId: string, data: any): Promise<void> {
    const key = `notification:${notificationId}`;
    await this.setCache(key, data, 604800); // 7 days
  }

  public async getNotificationTracking(notificationId: string): Promise<any> {
    const key = `notification:${notificationId}`;
    return await this.getCache(key);
  }
}

export const database = DatabaseConfig.getInstance();