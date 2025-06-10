import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { logger } from './utils/logger';
import { database } from './config/database';
import { queueConfig } from './config/queue';
import { TemplateService } from './services/templateService';
import { EmailService } from './services/emailService';
import { SMSService } from './services/smsService';
import { PushService } from './services/pushService';
import { NotificationRequest, BulkNotificationRequest } from './types';

dotenv.config();

const app = express();
const PORT = process.env.NOTIFICATION_PORT || 8006;

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
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
const templateService = new TemplateService();
const emailService = new EmailService();
const smsService = new SMSService();
const pushService = new PushService();

// Health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'notification-service',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Status endpoint
app.get('/status', (req, res) => {
  res.json({
    service: 'iWORKZ Notification Service',
    status: 'operational',
    features: [
      'multi-channel-notifications',
      'email-sms-push-in-app',
      'template-engine',
      'queue-processing',
      'delivery-tracking',
      'user-preferences'
    ],
    providers: {
      email: ['sendgrid', 'ses', 'smtp'],
      sms: ['twilio', 'sns'],
      push: ['firebase']
    },
    endpoints: [
      '/health',
      '/status',
      '/api/v1/send',
      '/api/v1/bulk-send',
      '/api/v1/templates',
      '/api/v1/preferences'
    ]
  });
});

// Start server
async function startServer() {
  try {
    // Initialize database connection
    await database.connectRedis();
    
    // Initialize queue system
    await queueConfig.scheduleCleanupJobs();
    
    // Load templates
    await templateService.loadTemplates();
    
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`🔔 Notification service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start notification service:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await database.disconnect();
  await queueConfig.shutdown();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await database.disconnect();
  await queueConfig.shutdown();
  process.exit(0);
});

if (require.main === module) {
  startServer();
}

export default app;