const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const matchingService = require('./services/matchingService');
const { logger } = require('./utils/logger');

const app = express();
const PORT = process.env.MATCHING_PORT || 3003;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'matching-engine',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/status', (req, res) => {
  res.json({
    service: 'iWORKZ Matching Engine',
    status: 'operational',
    features: [
      'job-matching', 
      'candidate-matching', 
      'skill-analysis', 
      'ai-scoring',
      'bulk-matching',
      'comprehensive-analysis'
    ],
    algorithms: [
      'skill-based',
      'experience-based', 
      'ai-hybrid',
      'comprehensive'
    ],
    endpoints: [
      '/health', 
      '/status', 
      '/api/v1/match',
      '/api/v1/match/candidate-to-job',
      '/api/v1/match/job-to-candidates',
      '/api/v1/match/candidate-to-jobs',
      '/api/v1/match/bulk'
    ]
  });
});

// Enhanced Matching API endpoints
app.post('/api/v1/match/candidate-to-job', async (req, res) => {
  try {
    const { candidate, job, algorithm = 'ai-hybrid' } = req.body;
    
    if (!candidate || !job) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: candidate and job'
      });
    }

    const result = await matchingService.matchCandidateToJob(candidate, job, algorithm);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error('Candidate-to-job matching error:', error);
    res.status(500).json({
      success: false,
      error: 'Matching service error',
      message: error.message
    });
  }
});

app.post('/api/v1/match/job-to-candidates', async (req, res) => {
  try {
    const { job, candidates, limit = 10, algorithm = 'ai-hybrid' } = req.body;
    
    if (!job || !candidates || !Array.isArray(candidates)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: job and candidates array'
      });
    }

    const result = await matchingService.findBestCandidates(job, candidates, limit, algorithm);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error('Job-to-candidates matching error:', error);
    res.status(500).json({
      success: false,
      error: 'Matching service error',
      message: error.message
    });
  }
});

app.post('/api/v1/match/candidate-to-jobs', async (req, res) => {
  try {
    const { candidate, jobs, limit = 10, algorithm = 'ai-hybrid' } = req.body;
    
    if (!candidate || !jobs || !Array.isArray(jobs)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: candidate and jobs array'
      });
    }

    const result = await matchingService.findBestJobs(candidate, jobs, limit, algorithm);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error('Candidate-to-jobs matching error:', error);
    res.status(500).json({
      success: false,
      error: 'Matching service error',
      message: error.message
    });
  }
});

app.post('/api/v1/match/bulk', async (req, res) => {
  try {
    const { jobs, candidates, algorithm = 'ai-hybrid', threshold = 50 } = req.body;
    
    if (!jobs || !candidates || !Array.isArray(jobs) || !Array.isArray(candidates)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: jobs and candidates arrays'
      });
    }

    const bulkResults = [];
    
    for (const job of jobs) {
      const result = await matchingService.findBestCandidates(job, candidates, 5, algorithm);
      
      // Filter by threshold
      const qualifiedMatches = result.matches.filter(match => match.match.score >= threshold);
      
      if (qualifiedMatches.length > 0) {
        bulkResults.push({
          job: result.job,
          matches: qualifiedMatches,
          totalQualified: qualifiedMatches.length
        });
      }
    }
    
    res.json({
      success: true,
      results: bulkResults,
      summary: {
        totalJobs: jobs.length,
        jobsWithMatches: bulkResults.length,
        totalCandidates: candidates.length,
        algorithm,
        threshold
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Bulk matching error:', error);
    res.status(500).json({
      success: false,
      error: 'Bulk matching service error',
      message: error.message
    });
  }
});

// Legacy endpoint for backward compatibility
app.post('/api/v1/match', async (req, res) => {
  try {
    const { jobId, candidateProfile, job, candidate } = req.body;
    
    // Support both old and new format
    const jobData = job || { id: jobId };
    const candidateData = candidate || candidateProfile;
    
    if (!jobData || !candidateData) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const result = await matchingService.matchCandidateToJob(candidateData, jobData, 'ai-hybrid');
    
    res.json({
      success: true,
      matchScore: result.score,
      confidence: result.confidence,
      reasons: result.reasons,
      recommendations: result.recommendations,
      breakdown: result.breakdown,
      details: result.details
    });
  } catch (error) {
    logger.error('Legacy matching error:', error);
    res.status(500).json({
      success: false,
      error: 'Matching service error',
      message: error.message
    });
  }
});

app.get('/api/v1/match/algorithms', (req, res) => {
  res.json({
    available: [
      { 
        name: 'skill-based', 
        description: 'Matches based on technical skills and competencies',
        weights: { skills: 1.0, experience: 0, location: 0, education: 0, preferences: 0 }
      },
      { 
        name: 'experience-based', 
        description: 'Matches based on work experience and role history',
        weights: { skills: 0.3, experience: 0.7, location: 0, education: 0, preferences: 0 }
      },
      { 
        name: 'ai-hybrid', 
        description: 'AI-powered comprehensive matching with dynamic weighting',
        weights: { skills: 0.35, experience: 0.30, location: 0.15, education: 0.10, preferences: 0.10 }
      },
      { 
        name: 'comprehensive', 
        description: 'Complete analysis including cultural fit and career growth',
        weights: { skills: 0.25, experience: 0.25, location: 0.15, education: 0.10, preferences: 0.10, cultural: 0.15 }
      }
    ],
    default: 'ai-hybrid'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    service: 'matching-engine'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎯 Matching Engine service running on port ${PORT}`);
});

module.exports = app;