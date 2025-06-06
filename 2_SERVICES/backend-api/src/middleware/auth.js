const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { query } = require('../config/database');
const { cache } = require('../config/redis');
const { logger } = require('../utils/logger');
const { AppError, catchAsync } = require('./errorHandler');

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.API_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    issuer: 'iworkz-api',
    audience: 'iworkz-platform'
  });
};

// Verify JWT token
const verifyToken = (token) => {
  return jwt.verify(token, process.env.API_SECRET, {
    issuer: 'iworkz-api',
    audience: 'iworkz-platform'
  });
};

// Hash password
const hashPassword = async (password) => {
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
  return bcrypt.hash(password, saltRounds);
};

// Verify password
const verifyPassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

// Middleware to authenticate JWT token
const authenticate = catchAsync(async (req, res, next) => {
  // Get token from header
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401, 'NO_TOKEN'));
  }

  // Check if token is blacklisted
  const blacklisted = await cache.get(`blacklist:${token}`);
  if (blacklisted) {
    return next(new AppError('Token has been invalidated. Please log in again.', 401, 'BLACKLISTED_TOKEN'));
  }

  // Verify token
  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Your token has expired! Please log in again.', 401, 'EXPIRED_TOKEN'));
    } else if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again!', 401, 'INVALID_TOKEN'));
    } else {
      return next(new AppError('Token verification failed.', 401, 'TOKEN_VERIFICATION_FAILED'));
    }
  }

  // Check if user still exists
  const result = await query(
    'SELECT id, email, first_name, last_name, user_type, is_active, verification_status FROM users.profiles WHERE id = $1',
    [decoded.userId]
  );

  if (result.rows.length === 0) {
    return next(new AppError('The user belonging to this token does no longer exist.', 401, 'USER_NOT_FOUND'));
  }

  const currentUser = result.rows[0];

  // Check if user is active
  if (!currentUser.is_active) {
    return next(new AppError('Your account has been deactivated. Please contact support.', 401, 'ACCOUNT_DEACTIVATED'));
  }

  // Check if user changed password after the token was issued
  // You can implement this check by storing a password_changed_at field
  
  // Grant access to protected route
  req.user = currentUser;
  req.token = token;
  
  // Log authentication success
  logger.logAuth('authentication_success', currentUser.id, {
    userType: currentUser.user_type,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  next();
});

// Middleware to check if user is authenticated (optional)
const optionalAuth = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (token) {
    try {
      const decoded = verifyToken(token);
      const result = await query(
        'SELECT id, email, first_name, last_name, user_type, is_active FROM users.profiles WHERE id = $1',
        [decoded.userId]
      );

      if (result.rows.length > 0 && result.rows[0].is_active) {
        req.user = result.rows[0];
      }
    } catch (error) {
      // Token is invalid, but we continue without authentication
      logger.debug('Optional auth failed:', error.message);
    }
  }

  next();
});

// Middleware to restrict access to specific user types
const restrictTo = (...userTypes) => {
  return (req, res, next) => {
    if (!userTypes.includes(req.user.user_type)) {
      return next(new AppError('You do not have permission to perform this action', 403, 'INSUFFICIENT_PERMISSIONS'));
    }
    next();
  };
};

// Middleware to check if user owns the resource
const checkResourceOwnership = (resourceUserIdField = 'user_id') => {
  return catchAsync(async (req, res, next) => {
    const resourceId = req.params.id;
    
    // For admin users, allow access to all resources
    if (req.user.user_type === 'admin') {
      return next();
    }

    // Check if the resource belongs to the current user
    // This is a generic implementation - you might need to customize per resource type
    if (req.user.id !== req.params.userId && req.user.id !== req.body[resourceUserIdField]) {
      return next(new AppError('You can only access your own resources', 403, 'RESOURCE_ACCESS_DENIED'));
    }

    next();
  });
};

// Rate limiting for login attempts
const loginAttemptLimiter = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const key = `login_attempts:${email}:${req.ip}`;
  
  const attempts = await cache.get(key) || 0;
  
  if (attempts >= 5) {
    const ttl = await cache.get(`${key}:ttl`);
    const remainingTime = Math.ceil(ttl / 60);
    return next(new AppError(
      `Too many login attempts. Please try again in ${remainingTime} minutes.`,
      429,
      'TOO_MANY_LOGIN_ATTEMPTS'
    ));
  }
  
  req.loginAttempts = attempts;
  next();
});

// Track failed login attempts
const trackFailedLogin = async (email, ip) => {
  const key = `login_attempts:${email}:${ip}`;
  const attempts = await cache.get(key) || 0;
  
  await cache.set(key, attempts + 1, 900); // 15 minutes
  await cache.set(`${key}:ttl`, 900, 900);
  
  logger.logSecurity('failed_login_attempt', 'warn', {
    email,
    ip,
    attempts: attempts + 1
  });
};

// Clear login attempts on successful login
const clearLoginAttempts = async (email, ip) => {
  const key = `login_attempts:${email}:${ip}`;
  await cache.del(key);
  await cache.del(`${key}:ttl`);
};

// Logout and blacklist token
const logout = catchAsync(async (req, res, next) => {
  const token = req.token;
  
  if (token) {
    // Blacklist the token
    const decoded = verifyToken(token);
    const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
    
    if (expiresIn > 0) {
      await cache.set(`blacklist:${token}`, true, expiresIn);
    }
    
    logger.logAuth('logout', req.user.id, {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  }

  res.clearCookie('jwt');
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
});

// API key validation middleware (for external integrations)
const validateApiKey = catchAsync(async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return next(new AppError('API key is required', 401, 'API_KEY_REQUIRED'));
  }

  // Check if API key exists in database
  const result = await query(
    'SELECT user_id, permissions, is_active FROM api_keys WHERE key_hash = $1',
    [await hashPassword(apiKey)]
  );

  if (result.rows.length === 0) {
    return next(new AppError('Invalid API key', 401, 'INVALID_API_KEY'));
  }

  const apiKeyData = result.rows[0];
  
  if (!apiKeyData.is_active) {
    return next(new AppError('API key has been deactivated', 401, 'API_KEY_DEACTIVATED'));
  }

  // Get user data
  const userResult = await query(
    'SELECT id, email, user_type, is_active FROM users.profiles WHERE id = $1',
    [apiKeyData.user_id]
  );

  if (userResult.rows.length === 0 || !userResult.rows[0].is_active) {
    return next(new AppError('Associated user account is not active', 401, 'USER_ACCOUNT_INACTIVE'));
  }

  req.user = userResult.rows[0];
  req.apiKey = apiKeyData;
  
  next();
});

module.exports = {
  generateToken,
  verifyToken,
  hashPassword,
  verifyPassword,
  authenticate,
  optionalAuth,
  restrictTo,
  checkResourceOwnership,
  loginAttemptLimiter,
  trackFailedLogin,
  clearLoginAttempts,
  logout,
  validateApiKey
};