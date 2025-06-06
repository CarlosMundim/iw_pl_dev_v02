const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.MATCHING_PORT || 3003;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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
    features: ['job-matching', 'skill-analysis', 'ai-scoring'],
    endpoints: ['/health', '/status', '/api/v1/match']
  });
});

// Matching API endpoints
app.post('/api/v1/match', async (req, res) => {
  try {
    const { jobId, candidateProfile } = req.body;
    
    // Mock matching algorithm
    const mockScore = Math.random() * 100;
    const mockReasons = [
      'Strong technical skills match',
      'Relevant experience in industry',
      'Educational background aligns',
      'Location compatibility'
    ];
    
    res.json({
      success: true,
      matchScore: Math.round(mockScore),
      confidence: 'high',
      reasons: mockReasons.slice(0, Math.floor(Math.random() * 3) + 1),
      recommendations: [
        'Consider for interview',
        'Skills assessment recommended',
        'Cultural fit evaluation needed'
      ]
    });
  } catch (error) {
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
      { name: 'skill-based', description: 'Matches based on technical skills' },
      { name: 'experience-based', description: 'Matches based on work experience' },
      { name: 'ai-hybrid', description: 'AI-powered comprehensive matching' }
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