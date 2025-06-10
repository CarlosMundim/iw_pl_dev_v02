import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import dotenv from 'dotenv';

import { logger } from '@/utils/logger';
import { database } from '@/config/database';
import { blockchain } from '@/config/blockchain';
import { ipfs } from '@/config/ipfs';
import { CredentialService } from '@/services/credentialService';
import { 
  CredentialRequest, 
  VerificationRequest, 
  CredentialType,
  APIResponse 
} from '@/types';

dotenv.config();

const app = express();
const PORT = process.env.CREDENTIAL_PORT || 8008;

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common document formats
    const allowedMimes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/tiff',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, images, and Word documents are allowed.'));
    }
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize services
const credentialService = new CredentialService();

// Health endpoint
app.get('/health', async (req, res) => {
  try {
    const dbHealth = {
      postgres: await database.checkPostgresHealth(),
      redis: await database.checkRedisHealth(),
      mongodb: await database.checkMongoHealth()
    };
    
    const blockchainHealth = await blockchain.checkHealth();
    const ipfsHealth = await ipfs.checkHealth();

    const overallHealth = Object.values(dbHealth).some(h => h) && ipfsHealth;

    res.status(overallHealth ? 200 : 503).json({
      status: overallHealth ? 'healthy' : 'unhealthy',
      service: 'credential-engine',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      components: {
        database: dbHealth,
        blockchain: blockchainHealth,
        ipfs: ipfsHealth
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      service: 'credential-engine',
      error: 'Health check failed'
    });
  }
});

// Status endpoint
app.get('/status', async (req, res) => {
  try {
    const supportedChains = blockchain.getSupportedChains();
    const ipfsInfo = await ipfs.getNodeInfo();

    res.json({
      service: 'iWORKZ Credential Engine',
      status: 'operational',
      features: [
        'blockchain-credentials',
        'ipfs-storage',
        'verification-service',
        'multi-chain-support',
        'zero-knowledge-proofs',
        'document-validation'
      ],
      supported_credential_types: Object.values(CredentialType),
      blockchain: {
        supported_chains: supportedChains,
        default_chain: process.env.DEFAULT_CHAIN || 'sepolia'
      },
      ipfs: ipfsInfo,
      endpoints: [
        '/health',
        '/status',
        '/api/v1/credentials/issue',
        '/api/v1/credentials/verify',
        '/api/v1/credentials/:id',
        '/api/v1/credentials/revoke',
        '/api/v1/credentials/holder/:holderId'
      ]
    });
  } catch (error) {
    res.status(503).json({
      service: 'iWORKZ Credential Engine',
      status: 'degraded',
      error: 'Cannot retrieve full status information'
    });
  }
});

// Issue credential endpoint
app.post('/api/v1/credentials/issue', upload.single('document'), async (req, res) => {
  try {
    const request: CredentialRequest = {
      holderId: req.body.holderId,
      credentialType: req.body.credentialType as CredentialType,
      title: req.body.title,
      description: req.body.description,
      metadata: JSON.parse(req.body.metadata || '{}'),
      expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : undefined,
      documentFile: req.file
    };

    // Validate required fields
    if (!request.holderId || !request.credentialType || !request.title) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: holderId, credentialType, title',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      });
    }

    const result = await credentialService.issueCredential(request);
    
    res.status(result.success ? 201 : 400).json(result);
  } catch (error) {
    logger.error('Credential issuance error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown'
    });
  }
});

// Verify credential endpoint
app.post('/api/v1/credentials/verify', async (req, res) => {
  try {
    const request: VerificationRequest = {
      credentialId: req.body.credentialId,
      requesterId: req.body.requesterId,
      purpose: req.body.purpose,
      includeDetails: req.body.includeDetails || false
    };

    if (!request.credentialId || !request.requesterId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: credentialId, requesterId',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      });
    }

    const result = await credentialService.verifyCredential(request);
    
    res.json(result);
  } catch (error) {
    logger.error('Credential verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown'
    });
  }
});

// Get credential by ID
app.get('/api/v1/credentials/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const verificationRequest: VerificationRequest = {
      credentialId: id,
      requesterId: req.query.requesterId as string || 'anonymous',
      purpose: 'credential_lookup',
      includeDetails: true
    };

    const result = await credentialService.verifyCredential(verificationRequest);
    
    res.json(result);
  } catch (error) {
    logger.error('Credential lookup error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown'
    });
  }
});

// Revoke credential endpoint
app.post('/api/v1/credentials/revoke', async (req, res) => {
  try {
    const { credentialId, reason } = req.body;

    if (!credentialId || !reason) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: credentialId, reason',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
      });
    }

    const result = await credentialService.revokeCredential(credentialId, reason);
    
    res.json(result);
  } catch (error) {
    logger.error('Credential revocation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown'
    });
  }
});

// Get credentials by holder
app.get('/api/v1/credentials/holder/:holderId', async (req, res) => {
  try {
    const { holderId } = req.params;

    const result = await credentialService.getCredentialsByHolder(holderId);
    
    res.json(result);
  } catch (error) {
    logger.error('Credentials lookup error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown'
    });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large',
        message: 'File size must be less than 10MB'
      });
    }
  }

  res.status(500).json({
    success: false,
    error: 'Internal server error',
    service: 'credential-engine'
  });
});

// Start server
async function startServer() {
  try {
    // Initialize all configurations
    await database.initializeAll();
    await blockchain.initialize();
    await ipfs.initialize();
    
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`🏛️ Credential engine running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start credential engine:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await database.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await database.disconnect();
  process.exit(0);
});

if (require.main === module) {
  startServer();
}

export default app;