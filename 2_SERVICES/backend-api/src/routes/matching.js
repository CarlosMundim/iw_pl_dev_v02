const express = require('express');
const { authenticate, restrictTo } = require('../middleware/auth');
const { query } = require('../config/database');
const { catchAsync } = require('../middleware/errorHandler');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get job matches for talent
router.get('/jobs', restrictTo('talent'), catchAsync(async (req, res) => {
  const talentResult = await query(
    'SELECT id FROM users.talents WHERE profile_id = $1',
    [req.user.id]
  );

  if (talentResult.rows.length === 0) {
    return res.status(404).json({
      status: 'error',
      message: 'Talent profile not found'
    });
  }

  const talentId = talentResult.rows[0].id;
  const limit = parseInt(req.query.limit) || 10;

  const result = await query(
    `SELECT jts.overall_score, jts.skills_score, jts.experience_score,
            j.id, j.title, j.description, j.employment_type, j.location,
            j.salary_range, e.company_name
     FROM matching.job_talent_scores jts
     JOIN jobs.postings j ON jts.job_id = j.id
     JOIN users.employers e ON j.employer_id = e.id
     WHERE jts.talent_id = $1 AND j.status = 'active'
     ORDER BY jts.overall_score DESC
     LIMIT $2`,
    [talentId, limit]
  );

  res.json({
    status: 'success',
    data: { matches: result.rows }
  });
}));

// Get talent matches for job
router.get('/talents/:jobId', restrictTo('employer', 'admin'), catchAsync(async (req, res) => {
  const { jobId } = req.params;
  const limit = parseInt(req.query.limit) || 10;

  const result = await query(
    `SELECT jts.overall_score, jts.skills_score, jts.experience_score,
            t.id, t.skills, t.experience_years, t.availability_status,
            p.first_name, p.last_name, p.email
     FROM matching.job_talent_scores jts
     JOIN users.talents t ON jts.talent_id = t.id
     JOIN users.profiles p ON t.profile_id = p.id
     WHERE jts.job_id = $1 AND t.availability_status = 'available'
     ORDER BY jts.overall_score DESC
     LIMIT $2`,
    [jobId, limit]
  );

  res.json({
    status: 'success',
    data: { matches: result.rows }
  });
}));

module.exports = router;