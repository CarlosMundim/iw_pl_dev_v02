const winston = require('winston');
const path = require('path');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston to use our custom colors
winston.addColors(colors);

// Define format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define which files to write to for each environment
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }),
];

// Add file transports for production
if (process.env.NODE_ENV === 'production') {
  transports.push(
    // Error log file
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    // Combined log file
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  );
}

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'iworkz-backend-api',
    environment: process.env.NODE_ENV || 'development'
  },
  transports,
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  ],
  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' })
  ]
});

// Create a stream object for Morgan HTTP request logging
logger.stream = {
  write: function(message, encoding) {
    // Use the 'http' log level so the output will be picked up by both transports
    logger.http(message.trim());
  },
};

// Helper functions for structured logging
const loggerHelpers = {
  // Log API requests
  logRequest: (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.http('HTTP Request', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        userId: req.user?.id || 'anonymous'
      });
    });
    
    next();
  },

  // Log database operations
  logQuery: (query, params, duration, rowCount) => {
    logger.debug('Database Query', {
      query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
      params: params,
      duration: `${duration}ms`,
      rowCount
    });
  },

  // Log authentication events
  logAuth: (event, userId, details = {}) => {
    logger.info('Authentication Event', {
      event,
      userId,
      ...details
    });
  },

  // Log business events
  logBusiness: (event, data = {}) => {
    logger.info('Business Event', {
      event,
      ...data
    });
  },

  // Log security events
  logSecurity: (event, level = 'warn', details = {}) => {
    logger[level]('Security Event', {
      event,
      ...details
    });
  },

  // Log performance metrics
  logPerformance: (operation, duration, metadata = {}) => {
    const level = duration > 1000 ? 'warn' : 'info';
    logger[level]('Performance Metric', {
      operation,
      duration: `${duration}ms`,
      ...metadata
    });
  },

  // Log errors with context
  logError: (error, context = {}) => {
    logger.error('Application Error', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...context
    });
  }
};

// Extend logger with helper functions
Object.assign(logger, loggerHelpers);

module.exports = { logger };