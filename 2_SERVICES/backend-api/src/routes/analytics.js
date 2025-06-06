const express = require('express');
const { authenticate, restrictTo } = require('../middleware/auth');
const { query } = require('../config/database');
const { catchAsync } = require('../middleware/errorHandler');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get platform analytics (admin only)
router.get('/platform', restrictTo('admin'), catchAsync(async (req, res) => {
  const stats = await query(`
    SELECT 
      (SELECT COUNT(*) FROM users.profiles WHERE user_type = 'talent' AND is_active = true) as active_talents,
      (SELECT COUNT(*) FROM users.profiles WHERE user_type = 'employer' AND is_active = true) as active_employers,
      (SELECT COUNT(*) FROM jobs.postings WHERE status = 'active') as active_jobs,
      (SELECT COUNT(*) FROM jobs.applications WHERE created_at > NOW() - INTERVAL '30 days') as recent_applications
  `);

  res.json({
    status: 'success',
    data: { analytics: stats.rows[0] }
  });
}));

// Track user event
router.post('/events', catchAsync(async (req, res) => {
  const { eventType, eventCategory, eventData } = req.body;

  await query(
    `INSERT INTO analytics.user_events 
     (user_id, event_type, event_category, event_data, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [req.user.id, eventType, eventCategory, eventData, req.ip, req.get('User-Agent')]
  );

  res.json({
    status: 'success',
    message: 'Event tracked successfully'
  });
}));

module.exports = router;