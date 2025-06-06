const redis = require('redis');
const { logger } = require('../utils/logger');

// Redis configuration
const redisConfig = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  enableReadyCheck: true,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
  db: 0
};

// Create Redis client
let redisClient;

// Redis connection function
async function connectRedis() {
  try {
    redisClient = redis.createClient(redisConfig);

    // Error handling
    redisClient.on('error', (err) => {
      logger.error('Redis client error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    redisClient.on('ready', () => {
      logger.info('Redis client ready');
    });

    redisClient.on('end', () => {
      logger.info('Redis client disconnected');
    });

    redisClient.on('reconnecting', () => {
      logger.info('Redis client reconnecting...');
    });

    // Connect to Redis
    await redisClient.connect();
    
    // Test the connection
    await redisClient.ping();
    logger.info('Redis connection test successful');

    return redisClient;
  } catch (error) {
    logger.error('Redis connection failed:', error);
    throw error;
  }
}

// Cache helper functions
const cache = {
  // Get value from cache
  async get(key) {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  },

  // Set value in cache with optional TTL
  async set(key, value, ttl = 3600) {
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await redisClient.setEx(key, ttl, serialized);
      } else {
        await redisClient.set(key, serialized);
      }
      return true;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  },

  // Delete value from cache
  async del(key) {
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  },

  // Check if key exists
  async exists(key) {
    try {
      return await redisClient.exists(key);
    } catch (error) {
      logger.error('Cache exists error:', error);
      return false;
    }
  },

  // Set value with expiration time
  async expire(key, seconds) {
    try {
      await redisClient.expire(key, seconds);
      return true;
    } catch (error) {
      logger.error('Cache expire error:', error);
      return false;
    }
  },

  // Increment value
  async incr(key) {
    try {
      return await redisClient.incr(key);
    } catch (error) {
      logger.error('Cache increment error:', error);
      return null;
    }
  },

  // Set multiple values
  async mset(keyValuePairs) {
    try {
      const serializedPairs = {};
      for (const [key, value] of Object.entries(keyValuePairs)) {
        serializedPairs[key] = JSON.stringify(value);
      }
      await redisClient.mSet(serializedPairs);
      return true;
    } catch (error) {
      logger.error('Cache mset error:', error);
      return false;
    }
  },

  // Get multiple values
  async mget(keys) {
    try {
      const values = await redisClient.mGet(keys);
      return values.map(value => value ? JSON.parse(value) : null);
    } catch (error) {
      logger.error('Cache mget error:', error);
      return new Array(keys.length).fill(null);
    }
  },

  // Hash operations
  async hget(hash, field) {
    try {
      const value = await redisClient.hGet(hash, field);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache hget error:', error);
      return null;
    }
  },

  async hset(hash, field, value) {
    try {
      await redisClient.hSet(hash, field, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('Cache hset error:', error);
      return false;
    }
  },

  async hgetall(hash) {
    try {
      const result = await redisClient.hGetAll(hash);
      const parsed = {};
      for (const [field, value] of Object.entries(result)) {
        parsed[field] = JSON.parse(value);
      }
      return parsed;
    } catch (error) {
      logger.error('Cache hgetall error:', error);
      return {};
    }
  },

  // List operations
  async lpush(key, ...values) {
    try {
      const serialized = values.map(v => JSON.stringify(v));
      return await redisClient.lPush(key, serialized);
    } catch (error) {
      logger.error('Cache lpush error:', error);
      return null;
    }
  },

  async rpop(key) {
    try {
      const value = await redisClient.rPop(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache rpop error:', error);
      return null;
    }
  },

  // Set operations
  async sadd(key, ...members) {
    try {
      const serialized = members.map(m => JSON.stringify(m));
      return await redisClient.sAdd(key, serialized);
    } catch (error) {
      logger.error('Cache sadd error:', error);
      return null;
    }
  },

  async smembers(key) {
    try {
      const members = await redisClient.sMembers(key);
      return members.map(m => JSON.parse(m));
    } catch (error) {
      logger.error('Cache smembers error:', error);
      return [];
    }
  }
};

// Session store for express-session
function createSessionStore() {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  
  const RedisStore = require('connect-redis')(require('express-session'));
  return new RedisStore({ client: redisClient });
}

// Rate limiting store
function createRateLimitStore() {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  
  const RedisStore = require('rate-limit-redis');
  return new RedisStore({
    client: redisClient,
    prefix: 'rl:',
    expiry: 15 * 60 // 15 minutes
  });
}

// Health check
async function checkRedisHealth() {
  try {
    await redisClient.ping();
    const info = await redisClient.info('memory');
    return {
      status: 'healthy',
      connected: true,
      info: info
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      connected: false,
      error: error.message
    };
  }
}

// Graceful shutdown
async function closeRedis() {
  try {
    if (redisClient) {
      await redisClient.quit();
      logger.info('Redis connection closed successfully');
    }
  } catch (error) {
    logger.error('Error closing Redis connection:', error);
    throw error;
  }
}

module.exports = {
  redisClient,
  connectRedis,
  cache,
  createSessionStore,
  createRateLimitStore,
  checkRedisHealth,
  closeRedis
};