const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cron = require('node-cron');
const winston = require('winston');
const prometheus = require('prometheus-client');
require('dotenv').config();

const deploymentRoutes = require('./routes/deployment');
const monitoringRoutes = require('./routes/monitoring');
const infrastructureRoutes = require('./routes/infrastructure');
const backupRoutes = require('./routes/backup');
const healthRoutes = require('./routes/health');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3010;

// Logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'devops-service' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Prometheus metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const httpRequestTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(morgan('combined', {
  stream: { write: message => logger.info(message.trim()) }
}));

// Metrics middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const labels = {
      method: req.method,
      route: req.route?.path || req.path,
      status: res.statusCode
    };
    
    httpRequestDuration.observe(labels, duration);
    httpRequestTotal.inc(labels);
  });
  
  next();
});

// Routes
app.use('/api/v1/deployment', deploymentRoutes);
app.use('/api/v1/monitoring', monitoringRoutes);
app.use('/api/v1/infrastructure', infrastructureRoutes);
app.use('/api/v1/backup', backupRoutes);
app.use('/health', healthRoutes);

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(prometheus.register.metrics());
});

// API Documentation
app.get('/api/docs', (req, res) => {
  res.json({
    name: 'iWORKZ DevOps Service',
    version: '1.0.0',
    description: 'Infrastructure automation and deployment management',
    endpoints: {
      'GET /health': 'Service health check',
      'GET /metrics': 'Prometheus metrics',
      'POST /api/v1/deployment/deploy': 'Deploy services to Kubernetes',
      'GET /api/v1/deployment/status': 'Get deployment status',
      'POST /api/v1/infrastructure/provision': 'Provision AWS infrastructure',
      'GET /api/v1/monitoring/metrics': 'Get platform metrics',
      'POST /api/v1/backup/create': 'Create system backup',
      'GET /api/v1/backup/list': 'List available backups'
    },
    authors: [
      'Carlos Mundim - Project Lead & Technical Architect',
      'Prof. Jeanette Dennisson - AI-Integration Architecture Leader',
      'Claude Code (Anthropic) - AI Development Partner'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message,
    timestamp: new Date().toISOString(),
    path: req.path
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Scheduled tasks
cron.schedule('0 2 * * *', () => {
  logger.info('Running daily backup...');
  // Backup logic will be implemented in backup service
});

cron.schedule('*/5 * * * *', () => {
  logger.info('Running health checks...');
  // Health check logic will be implemented in monitoring service
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  logger.info(`DevOps Service running on port ${PORT}`);
  logger.info(`API Documentation: http://localhost:${PORT}/api/docs`);
  logger.info(`Health Check: http://localhost:${PORT}/health`);
  logger.info(`Metrics: http://localhost:${PORT}/metrics`);
});

module.exports = app;