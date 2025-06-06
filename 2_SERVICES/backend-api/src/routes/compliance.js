const express = require('express');
const { authenticate, restrictTo } = require('../middleware/auth');
const { query } = require('../config/database');
const { catchAsync } = require('../middleware/errorHandler');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Check job compliance
router.post('/check-job/:jobId', restrictTo('employer', 'admin'), catchAsync(async (req, res) => {
  const { jobId } = req.params;
  const { jurisdiction } = req.body;

  // This would integrate with compliance engine service
  // For now, return a mock response
  const result = {
    jobId,
    jurisdiction,
    status: 'compliant',
    checks: [
      {
        type: 'discrimination_check',
        status: 'passed',
        message: 'No discriminatory language detected'
      },
      {
        type: 'wage_compliance',
        status: 'passed',
        message: 'Salary range meets minimum wage requirements'
      }
    ],
    checkedAt: new Date()
  };

  res.json({
    status: 'success',
    data: { compliance: result }
  });
}));

// Get compliance rules for jurisdiction
router.get('/rules/:jurisdiction', catchAsync(async (req, res) => {
  const { jurisdiction } = req.params;

  const result = await query(
    `SELECT rule_category, rule_name, rule_description, severity
     FROM compliance.regulatory_rules
     WHERE jurisdiction = $1 AND is_active = true
     ORDER BY severity DESC, rule_category`,
    [jurisdiction.toUpperCase()]
  );

  res.json({
    status: 'success',
    data: { rules: result.rows }
  });
}));

module.exports = router;