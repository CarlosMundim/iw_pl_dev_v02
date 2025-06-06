const { Pool } = require('pg');
const { logger } = require('../utils/logger');

// Database configuration
const dbConfig = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'iworkz_dev',
  user: process.env.POSTGRES_USER || 'iworkz_user',
  password: process.env.POSTGRES_PASSWORD,
  max: parseInt(process.env.DB_POOL_MAX) || 20,
  min: parseInt(process.env.DB_POOL_MIN) || 2,
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000,
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 5000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  application_name: 'iworkz-backend-api'
};

// Create connection pool
const pool = new Pool(dbConfig);

// Pool event handlers
pool.on('connect', (client) => {
  logger.debug('New database client connected');
});

pool.on('acquire', (client) => {
  logger.debug('Client acquired from pool');
});

pool.on('error', (err, client) => {
  logger.error('Unexpected error on idle database client:', err);
});

pool.on('remove', (client) => {
  logger.debug('Client removed from pool');
});

// Database connection function
async function connectDB() {
  try {
    // Test the connection
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    logger.info('Database connection test successful:', result.rows[0]);
    client.release();
    
    // Set up connection monitoring
    setInterval(async () => {
      try {
        const poolStats = {
          totalCount: pool.totalCount,
          idleCount: pool.idleCount,
          waitingCount: pool.waitingCount
        };
        logger.debug('Database pool stats:', poolStats);
      } catch (error) {
        logger.error('Error getting pool stats:', error);
      }
    }, 60000); // Every minute

    return pool;
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
}

// Helper function for transactions
async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Helper function for safe queries with error handling
async function query(text, params = []) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    if (duration > 1000) { // Log slow queries
      logger.warn('Slow query detected:', {
        query: text,
        duration: `${duration}ms`,
        rows: result.rowCount
      });
    }
    
    return result;
  } catch (error) {
    logger.error('Database query error:', {
      query: text,
      params: params,
      error: error.message
    });
    throw error;
  }
}

// Helper function to check database health
async function checkHealth() {
  try {
    const result = await query('SELECT 1 as health_check');
    return {
      status: 'healthy',
      connected: true,
      poolStats: {
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount
      }
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
async function closeDB() {
  try {
    await pool.end();
    logger.info('Database pool closed successfully');
  } catch (error) {
    logger.error('Error closing database pool:', error);
    throw error;
  }
}

module.exports = {
  pool,
  connectDB,
  withTransaction,
  query,
  checkHealth,
  closeDB
};