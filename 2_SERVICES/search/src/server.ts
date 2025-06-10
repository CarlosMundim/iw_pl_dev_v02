import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { logger } from './utils/logger';
import { elasticsearchConfig } from './config/elasticsearch';
import { SearchService } from './services/searchService';
import { SearchQuery, SearchFilters, SuggestionQuery } from './types';

dotenv.config();

const app = express();
const PORT = process.env.SEARCH_PORT || 8007;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many search requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize services
const searchService = new SearchService();

// Health endpoint
app.get('/health', async (req, res) => {
  try {
    const esHealth = await elasticsearchConfig.getClusterHealth();
    
    res.json({
      status: 'healthy',
      service: 'search-service',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      elasticsearch: {
        status: esHealth.status,
        nodes: esHealth.number_of_nodes
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      service: 'search-service',
      error: 'Elasticsearch connection failed'
    });
  }
});

// Status endpoint
app.get('/status', async (req, res) => {
  try {
    const clusterStats = await elasticsearchConfig.getClusterStats();
    
    res.json({
      service: 'iWORKZ Search Service',
      status: 'operational',
      features: [
        'full-text-search',
        'job-candidate-matching',
        'geo-search',
        'auto-completion',
        'semantic-search',
        'aggregations',
        'bulk-indexing'
      ],
      search_types: ['jobs', 'candidates', 'companies'],
      indices: ['jobs', 'candidates'],
      elasticsearch: {
        version: clusterStats.nodes?.versions || 'unknown',
        cluster_name: clusterStats.cluster_name
      },
      endpoints: [
        '/health',
        '/status',
        '/api/v1/search/jobs',
        '/api/v1/search/candidates',
        '/api/v1/suggest',
        '/api/v1/index'
      ]
    });
  } catch (error) {
    res.status(503).json({
      service: 'iWORKZ Search Service',
      status: 'degraded',
      error: 'Cannot retrieve cluster information'
    });
  }
});

// Search endpoints
app.post('/api/v1/search/jobs', async (req, res) => {
  try {
    const searchQuery: SearchQuery = req.body;
    const results = await searchService.searchJobs(searchQuery);
    
    res.json({
      success: true,
      ...results
    });
  } catch (error) {
    logger.error('Job search error:', error);
    res.status(500).json({
      success: false,
      error: 'Job search failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/v1/search/candidates', async (req, res) => {
  try {
    const searchQuery: SearchQuery = req.body;
    const results = await searchService.searchCandidates(searchQuery);
    
    res.json({
      success: true,
      ...results
    });
  } catch (error) {
    logger.error('Candidate search error:', error);
    res.status(500).json({
      success: false,
      error: 'Candidate search failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/v1/suggest', async (req, res) => {
  try {
    const suggestionQuery: SuggestionQuery = req.body;
    const results = await searchService.getSuggestions(suggestionQuery);
    
    res.json({
      success: true,
      ...results
    });
  } catch (error) {
    logger.error('Suggestion error:', error);
    res.status(500).json({
      success: false,
      error: 'Suggestion failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Indexing endpoints
app.post('/api/v1/index/job', async (req, res) => {
  try {
    const jobDocument = req.body;
    await searchService.indexJob(jobDocument);
    
    res.json({
      success: true,
      message: 'Job indexed successfully',
      job_id: jobDocument.id
    });
  } catch (error) {
    logger.error('Job indexing error:', error);
    res.status(500).json({
      success: false,
      error: 'Job indexing failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/v1/index/candidate', async (req, res) => {
  try {
    const candidateDocument = req.body;
    await searchService.indexCandidate(candidateDocument);
    
    res.json({
      success: true,
      message: 'Candidate indexed successfully',
      candidate_id: candidateDocument.id
    });
  } catch (error) {
    logger.error('Candidate indexing error:', error);
    res.status(500).json({
      success: false,
      error: 'Candidate indexing failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/api/v1/index/bulk', async (req, res) => {
  try {
    const { operations } = req.body;
    await searchService.bulkIndex(operations);
    
    res.json({
      success: true,
      message: 'Bulk indexing completed',
      operations_count: operations.length / 2
    });
  } catch (error) {
    logger.error('Bulk indexing error:', error);
    res.status(500).json({
      success: false,
      error: 'Bulk indexing failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete endpoints
app.delete('/api/v1/index/job/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    await searchService.deleteJob(jobId);
    
    res.json({
      success: true,
      message: 'Job deleted successfully',
      job_id: jobId
    });
  } catch (error) {
    logger.error('Job deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Job deletion failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.delete('/api/v1/index/candidate/:candidateId', async (req, res) => {
  try {
    const { candidateId } = req.params;
    await searchService.deleteCandidate(candidateId);
    
    res.json({
      success: true,
      message: 'Candidate deleted successfully',
      candidate_id: candidateId
    });
  } catch (error) {
    logger.error('Candidate deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Candidate deletion failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    service: 'search-service'
  });
});

// Start server
async function startServer() {
  try {
    // Test Elasticsearch connection
    const isConnected = await elasticsearchConfig.waitForConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to Elasticsearch');
    }
    
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`🔍 Search service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start search service:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await elasticsearchConfig.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await elasticsearchConfig.close();
  process.exit(0);
});

if (require.main === module) {
  startServer();
}

export default app;