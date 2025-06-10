import { Pool } from 'pg';
import mongoose from 'mongoose';
import Redis from 'redis';
import { logger } from '@/utils/logger';

class DatabaseConfig {
  private pgPool: Pool | null = null;
  private redisClient: any = null;
  private mongoConnection: typeof mongoose | null = null;

  // PostgreSQL Connection
  async connectPostgres(): Promise<Pool> {
    try {
      this.pgPool = new Pool({
        host: process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT || '5432'),
        database: process.env.POSTGRES_DB || 'iworkz_credentials',
        user: process.env.POSTGRES_USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD || 'password',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      // Test connection
      const client = await this.pgPool.connect();
      await client.query('SELECT NOW()');
      client.release();

      logger.info('✅ PostgreSQL connected successfully');
      return this.pgPool;
    } catch (error) {
      logger.error('❌ PostgreSQL connection failed:', error);
      throw error;
    }
  }

  // MongoDB Connection
  async connectMongoDB(): Promise<typeof mongoose> {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/iworkz_credentials';
      
      this.mongoConnection = await mongoose.connect(mongoUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      logger.info('✅ MongoDB connected successfully');
      return this.mongoConnection;
    } catch (error) {
      logger.error('❌ MongoDB connection failed:', error);
      throw error;
    }
  }

  // Redis Connection
  async connectRedis(): Promise<any> {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      
      this.redisClient = Redis.createClient({
        url: redisUrl,
        retry_delay_on_failure: 5000,
        max_retry_delay: 5000,
      });

      this.redisClient.on('error', (err: Error) => {
        logger.error('Redis Client Error:', err);
      });

      this.redisClient.on('connect', () => {
        logger.info('✅ Redis connected successfully');
      });

      await this.redisClient.connect();
      return this.redisClient;
    } catch (error) {
      logger.error('❌ Redis connection failed:', error);
      throw error;
    }
  }

  // Initialize all database connections
  async initializeAll(): Promise<void> {
    try {
      await Promise.all([
        this.connectPostgres(),
        this.connectMongoDB(),
        this.connectRedis()
      ]);
      
      logger.info('🎯 All database connections initialized');
    } catch (error) {
      logger.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  // Getters
  getPostgresPool(): Pool {
    if (!this.pgPool) {
      throw new Error('PostgreSQL not connected');
    }
    return this.pgPool;
  }

  getRedisClient(): any {
    if (!this.redisClient) {
      throw new Error('Redis not connected');
    }
    return this.redisClient;
  }

  getMongoConnection(): typeof mongoose {
    if (!this.mongoConnection) {
      throw new Error('MongoDB not connected');
    }
    return this.mongoConnection;
  }

  // Health checks
  async checkPostgresHealth(): Promise<boolean> {
    try {
      if (!this.pgPool) return false;
      const client = await this.pgPool.connect();
      await client.query('SELECT 1');
      client.release();
      return true;
    } catch {
      return false;
    }
  }

  async checkRedisHealth(): Promise<boolean> {
    try {
      if (!this.redisClient) return false;
      await this.redisClient.ping();
      return true;
    } catch {
      return false;
    }
  }

  async checkMongoHealth(): Promise<boolean> {
    try {
      if (!this.mongoConnection) return false;
      return this.mongoConnection.connection.readyState === 1;
    } catch {
      return false;
    }
  }

  // Graceful shutdown
  async disconnect(): Promise<void> {
    try {
      const promises: Promise<any>[] = [];

      if (this.pgPool) {
        promises.push(this.pgPool.end());
      }

      if (this.redisClient) {
        promises.push(this.redisClient.quit());
      }

      if (this.mongoConnection) {
        promises.push(this.mongoConnection.disconnect());
      }

      await Promise.all(promises);
      logger.info('🔌 All database connections closed');
    } catch (error) {
      logger.error('Error closing database connections:', error);
    }
  }
}

export const database = new DatabaseConfig();