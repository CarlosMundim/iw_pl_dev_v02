const express = require('express');
const { authenticate, restrictTo } = require('../middleware/auth');
const { query } = require('../config/database');
const { catchAsync } = require('../middleware/errorHandler');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get user profile
router.get('/profile', catchAsync(async (req, res) => {
  const userResult = await query(
    `SELECT p.id, p.email, p.first_name, p.last_name, p.user_type, 
            p.phone, p.country_code, p.verification_status, p.created_at
     FROM users.profiles p WHERE p.id = $1`,
    [req.user.id]
  );

  res.json({
    status: 'success',
    data: { user: userResult.rows[0] }
  });
}));

// Update user profile
router.patch('/profile', catchAsync(async (req, res) => {
  const { firstName, lastName, phone, countryCode } = req.body;
  
  const result = await query(
    `UPDATE users.profiles 
     SET first_name = COALESCE($1, first_name),
         last_name = COALESCE($2, last_name),
         phone = COALESCE($3, phone),
         country_code = COALESCE($4, country_code),
         updated_at = NOW()
     WHERE id = $5
     RETURNING id, first_name, last_name, phone, country_code`,
    [firstName, lastName, phone, countryCode, req.user.id]
  );

  res.json({
    status: 'success',
    data: { user: result.rows[0] }
  });
}));

// Get all users (admin only)
router.get('/', restrictTo('admin'), catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const result = await query(
    `SELECT id, email, first_name, last_name, user_type, 
            verification_status, is_active, created_at
     FROM users.profiles 
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  res.json({
    status: 'success',
    data: { users: result.rows }
  });
}));

module.exports = router;