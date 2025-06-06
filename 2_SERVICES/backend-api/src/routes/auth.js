const express = require('express');
const { body, validationResult } = require('express-validator');
const { 
  generateToken, 
  hashPassword, 
  verifyPassword, 
  authenticate, 
  loginAttemptLimiter,
  trackFailedLogin,
  clearLoginAttempts,
  logout
} = require('../middleware/auth');
const { query } = require('../config/database');
const { cache } = require('../config/redis');
const { logger } = require('../utils/logger');
const { AppError, catchAsync, handleValidationError } = require('../middleware/errorHandler');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('First name must be between 2 and 100 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Last name must be between 2 and 100 characters'),
  body('userType')
    .isIn(['talent', 'employer', 'agency'])
    .withMessage('User type must be either talent, employer, or agency'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('countryCode')
    .optional()
    .isLength({ min: 2, max: 2 })
    .withMessage('Country code must be exactly 2 characters'),
  body('termsAccepted')
    .equals('true')
    .withMessage('You must accept the terms and conditions'),
  body('privacyAccepted')
    .equals('true')
    .withMessage('You must accept the privacy policy')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

// Register endpoint
router.post('/register', registerValidation, catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(handleValidationError(errors.array()));
  }

  const { 
    email, 
    password, 
    firstName, 
    lastName, 
    userType, 
    phone, 
    countryCode,
    languagePreference = 'en'
  } = req.body;

  // Check if user already exists
  const existingUser = await query(
    'SELECT id FROM users.profiles WHERE email = $1',
    [email]
  );

  if (existingUser.rows.length > 0) {
    return next(new AppError('User with this email already exists', 409, 'USER_EXISTS'));
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user profile
  const userResult = await query(
    `INSERT INTO users.profiles 
     (email, password_hash, first_name, last_name, user_type, phone, country_code, language_preference, terms_accepted_at, privacy_accepted_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
     RETURNING id, email, first_name, last_name, user_type, created_at, verification_status`,
    [email, passwordHash, firstName, lastName, userType, phone, countryCode, languagePreference]
  );

  const user = userResult.rows[0];

  // Create type-specific profile
  if (userType === 'talent') {
    await query(
      'INSERT INTO users.talents (profile_id) VALUES ($1)',
      [user.id]
    );
  } else if (userType === 'employer') {
    await query(
      'INSERT INTO users.employers (profile_id, company_name) VALUES ($1, $2)',
      [user.id, `${firstName} ${lastName}'s Company`] // Default company name
    );
  }

  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    userType: user.user_type
  });

  // Log registration
  logger.logAuth('user_registered', user.id, {
    userType: user.user_type,
    email: user.email,
    ip: req.ip
  });

  // Send welcome email (implement email service)
  // await sendWelcomeEmail(user.email, user.first_name);

  res.status(201).json({
    status: 'success',
    message: 'User registered successfully',
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        userType: user.user_type,
        verificationStatus: user.verification_status,
        createdAt: user.created_at
      },
      token
    }
  });
}));

// Login endpoint
router.post('/login', loginValidation, loginAttemptLimiter, catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(handleValidationError(errors.array()));
  }

  const { email, password } = req.body;

  // Find user with password
  const result = await query(
    `SELECT id, email, password_hash, first_name, last_name, user_type, is_active, verification_status
     FROM users.profiles WHERE email = $1`,
    [email]
  );

  if (result.rows.length === 0) {
    await trackFailedLogin(email, req.ip);
    return next(new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS'));
  }

  const user = result.rows[0];

  // Check if account is active
  if (!user.is_active) {
    await trackFailedLogin(email, req.ip);
    return next(new AppError('Your account has been deactivated. Please contact support.', 401, 'ACCOUNT_DEACTIVATED'));
  }

  // Verify password
  const isValidPassword = await verifyPassword(password, user.password_hash);
  if (!isValidPassword) {
    await trackFailedLogin(email, req.ip);
    return next(new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS'));
  }

  // Clear login attempts on successful login
  await clearLoginAttempts(email, req.ip);

  // Update last login
  await query(
    'UPDATE users.profiles SET last_login = NOW() WHERE id = $1',
    [user.id]
  );

  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    userType: user.user_type
  });

  // Set secure cookie
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res.cookie('jwt', token, cookieOptions);

  // Log successful login
  logger.logAuth('user_login', user.id, {
    userType: user.user_type,
    email: user.email,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(200).json({
    status: 'success',
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        userType: user.user_type,
        verificationStatus: user.verification_status
      },
      token
    }
  });
}));

// Logout endpoint
router.post('/logout', authenticate, logout);

// Get current user
router.get('/me', authenticate, catchAsync(async (req, res, next) => {
  // Get detailed user information
  let userQuery = `
    SELECT p.id, p.email, p.first_name, p.last_name, p.user_type, p.phone, 
           p.country_code, p.language_preference, p.verification_status, 
           p.avatar_url, p.timezone, p.created_at, p.last_login
    FROM users.profiles p 
    WHERE p.id = $1
  `;

  const userResult = await query(userQuery, [req.user.id]);
  const userData = userResult.rows[0];

  // Get type-specific data
  let typeSpecificData = {};
  
  if (userData.user_type === 'talent') {
    const talentResult = await query(
      `SELECT skills, experience_years, education, certifications, 
              availability_status, preferred_locations, salary_expectations, 
              bio, remote_preference
       FROM users.talents WHERE profile_id = $1`,
      [req.user.id]
    );
    typeSpecificData = talentResult.rows[0] || {};
  } else if (userData.user_type === 'employer') {
    const employerResult = await query(
      `SELECT company_name, company_size, industry, company_description, 
              website_url, headquarters_location, company_logo_url
       FROM users.employers WHERE profile_id = $1`,
      [req.user.id]
    );
    typeSpecificData = employerResult.rows[0] || {};
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        ...userData,
        ...typeSpecificData
      }
    }
  });
}));

// Change password
router.patch('/change-password', authenticate, changePasswordValidation, catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(handleValidationError(errors.array()));
  }

  const { currentPassword, newPassword } = req.body;

  // Get current password hash
  const result = await query(
    'SELECT password_hash FROM users.profiles WHERE id = $1',
    [req.user.id]
  );

  const user = result.rows[0];

  // Verify current password
  const isValidPassword = await verifyPassword(currentPassword, user.password_hash);
  if (!isValidPassword) {
    return next(new AppError('Current password is incorrect', 400, 'INVALID_CURRENT_PASSWORD'));
  }

  // Hash new password
  const newPasswordHash = await hashPassword(newPassword);

  // Update password
  await query(
    'UPDATE users.profiles SET password_hash = $1, updated_at = NOW() WHERE id = $2',
    [newPasswordHash, req.user.id]
  );

  // Log password change
  logger.logAuth('password_changed', req.user.id, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(200).json({
    status: 'success',
    message: 'Password changed successfully'
  });
}));

// Forgot password
router.post('/forgot-password', forgotPasswordValidation, catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(handleValidationError(errors.array()));
  }

  const { email } = req.body;

  // Check if user exists
  const result = await query(
    'SELECT id, first_name FROM users.profiles WHERE email = $1 AND is_active = true',
    [email]
  );

  // Always return success to prevent email enumeration
  if (result.rows.length === 0) {
    return res.status(200).json({
      status: 'success',
      message: 'If an account with that email exists, we have sent a password reset link.'
    });
  }

  const user = result.rows[0];

  // Generate reset token
  const resetToken = uuidv4();
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Store reset token in cache
  await cache.set(`password_reset:${resetToken}`, {
    userId: user.id,
    email: email,
    expiresAt: resetTokenExpiry
  }, 3600); // 1 hour TTL

  // Send password reset email (implement email service)
  // await sendPasswordResetEmail(email, user.first_name, resetToken);

  logger.logAuth('password_reset_requested', user.id, {
    email: email,
    ip: req.ip
  });

  res.status(200).json({
    status: 'success',
    message: 'If an account with that email exists, we have sent a password reset link.'
  });
}));

// Reset password
router.post('/reset-password', resetPasswordValidation, catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(handleValidationError(errors.array()));
  }

  const { token, password } = req.body;

  // Get reset token data from cache
  const resetData = await cache.get(`password_reset:${token}`);
  
  if (!resetData || new Date() > new Date(resetData.expiresAt)) {
    return next(new AppError('Password reset token is invalid or has expired', 400, 'INVALID_RESET_TOKEN'));
  }

  // Hash new password
  const passwordHash = await hashPassword(password);

  // Update password
  await query(
    'UPDATE users.profiles SET password_hash = $1, updated_at = NOW() WHERE id = $2',
    [passwordHash, resetData.userId]
  );

  // Remove reset token from cache
  await cache.del(`password_reset:${token}`);

  // Log password reset
  logger.logAuth('password_reset_completed', resetData.userId, {
    email: resetData.email,
    ip: req.ip
  });

  res.status(200).json({
    status: 'success',
    message: 'Password has been reset successfully'
  });
}));

// Verify email (placeholder for email verification system)
router.post('/verify-email', catchAsync(async (req, res, next) => {
  // Implementation for email verification
  res.status(200).json({
    status: 'success',
    message: 'Email verification feature will be implemented'
  });
}));

// Refresh token
router.post('/refresh-token', authenticate, catchAsync(async (req, res, next) => {
  // Generate new token
  const newToken = generateToken({
    userId: req.user.id,
    email: req.user.email,
    userType: req.user.user_type
  });

  // Set new cookie
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res.cookie('jwt', newToken, cookieOptions);

  res.status(200).json({
    status: 'success',
    data: {
      token: newToken
    }
  });
}));

module.exports = router;