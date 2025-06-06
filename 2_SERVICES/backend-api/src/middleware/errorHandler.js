const { logger } = require('../utils/logger');

// Custom error class
class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Development error response
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
    code: err.code
  });
};

// Production error response
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      code: err.code
    });
  } else {
    // Programming or other unknown error: don't leak error details
    logger.error('Unexpected error:', err);
    
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Handle specific error types
const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400, 'INVALID_INPUT');
};

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg?.match(/(["'])(\\?.)*?\1/)?.[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400, 'DUPLICATE_VALUE');
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400, 'VALIDATION_ERROR');
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401, 'INVALID_TOKEN');

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401, 'EXPIRED_TOKEN');

const handlePostgresError = (err) => {
  switch (err.code) {
    case '23505': // unique_violation
      return new AppError('Resource already exists', 409, 'DUPLICATE_RESOURCE');
    case '23503': // foreign_key_violation
      return new AppError('Referenced resource does not exist', 400, 'INVALID_REFERENCE');
    case '23502': // not_null_violation
      return new AppError('Required field is missing', 400, 'MISSING_REQUIRED_FIELD');
    case '23514': // check_violation
      return new AppError('Invalid data format', 400, 'INVALID_DATA_FORMAT');
    case '42703': // undefined_column
      return new AppError('Invalid field specified', 400, 'INVALID_FIELD');
    case '42P01': // undefined_table
      return new AppError('Resource not found', 404, 'RESOURCE_NOT_FOUND');
    default:
      return new AppError('Database operation failed', 500, 'DATABASE_ERROR');
  }
};

// Main error handling middleware
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error with context
  logger.error('Error occurred:', {
    error: err.message,
    statusCode: err.statusCode,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    body: req.body,
    params: req.params,
    query: req.query
  });

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Handle specific error types
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    
    // Handle PostgreSQL errors
    if (error.code && error.code.length === 5) {
      error = handlePostgresError(error);
    }

    sendErrorProd(error, res);
  }
};

// 404 handler
const notFoundHandler = (req, res, next) => {
  const err = new AppError(`Can't find ${req.originalUrl} on this server!`, 404, 'ROUTE_NOT_FOUND');
  next(err);
};

// Async error wrapper
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// Validation error handler
const handleValidationError = (errors) => {
  const message = errors.map(err => err.msg).join('. ');
  return new AppError(message, 400, 'VALIDATION_ERROR');
};

module.exports = {
  AppError,
  errorHandler,
  notFoundHandler,
  catchAsync,
  handleValidationError
};