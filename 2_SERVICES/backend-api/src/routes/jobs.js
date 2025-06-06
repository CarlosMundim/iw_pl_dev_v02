const express = require('express');
const { authenticate, restrictTo, optionalAuth } = require('../middleware/auth');
const { query } = require('../config/database');
const { catchAsync } = require('../middleware/errorHandler');

const router = express.Router();

// Get all active jobs (public)
router.get('/', optionalAuth, catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const result = await query(
    `SELECT j.id, j.title, j.description, j.skills_required, j.experience_level,
            j.employment_type, j.location, j.remote_allowed, j.salary_range,
            j.created_at, e.company_name, e.company_size, e.industry
     FROM jobs.postings j
     JOIN users.employers e ON j.employer_id = e.id
     WHERE j.status = 'active' AND j.expires_at > NOW()
     ORDER BY j.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  res.json({
    status: 'success',
    data: { jobs: result.rows }
  });
}));

// Get single job
router.get('/:id', optionalAuth, catchAsync(async (req, res) => {
  const result = await query(
    `SELECT j.*, e.company_name, e.company_description, e.website_url
     FROM jobs.postings j
     JOIN users.employers e ON j.employer_id = e.id
     WHERE j.id = $1 AND j.status = 'active'`,
    [req.params.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({
      status: 'error',
      message: 'Job not found'
    });
  }

  res.json({
    status: 'success',
    data: { job: result.rows[0] }
  });
}));

// Create job (employers only)
router.post('/', authenticate, restrictTo('employer', 'admin'), catchAsync(async (req, res) => {
  const {
    title, description, requirements, skillsRequired, experienceLevel,
    employmentType, location, remoteAllowed, salaryRange, benefits
  } = req.body;

  // Get employer ID
  const employerResult = await query(
    'SELECT id FROM users.employers WHERE profile_id = $1',
    [req.user.id]
  );

  const employerId = employerResult.rows[0].id;

  const result = await query(
    `INSERT INTO jobs.postings 
     (employer_id, title, description, requirements, skills_required,
      experience_level, employment_type, location, remote_allowed,
      salary_range, benefits, status, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'active', NOW() + INTERVAL '30 days')
     RETURNING *`,
    [employerId, title, description, requirements, skillsRequired, experienceLevel,
     employmentType, location, remoteAllowed, salaryRange, benefits]
  );

  res.status(201).json({
    status: 'success',
    data: { job: result.rows[0] }
  });
}));

module.exports = router;