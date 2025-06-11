const express = require('express');
const { spawn } = require('child_process');
const k8s = require('@kubernetes/client-node');
const winston = require('winston');
const router = express.Router();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'deployment-service' }
});

// Initialize Kubernetes client
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const k8sAppsV1Api = kc.makeApiClient(k8s.AppsV1Api);
const k8sCoreV1Api = kc.makeApiClient(k8s.CoreV1Api);

/**
 * Deploy service to Kubernetes
 */
router.post('/deploy', async (req, res) => {
  try {
    const { service, version, environment = 'production' } = req.body;
    
    if (!service) {
      return res.status(400).json({ error: 'Service name is required' });
    }

    logger.info(`Deploying ${service} version ${version} to ${environment}`);

    // Execute deployment script
    const deployScript = spawn('kubectl', [
      'apply', 
      '-f', 
      `k8s/deployments/${service}.yaml`
    ]);

    let output = '';
    let errorOutput = '';

    deployScript.stdout.on('data', (data) => {
      output += data.toString();
    });

    deployScript.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    deployScript.on('close', (code) => {
      if (code === 0) {
        logger.info(`Successfully deployed ${service}`);
        res.json({
          success: true,
          message: `${service} deployed successfully`,
          output,
          timestamp: new Date().toISOString()
        });
      } else {
        logger.error(`Failed to deploy ${service}: ${errorOutput}`);
        res.status(500).json({
          success: false,
          message: `Failed to deploy ${service}`,
          error: errorOutput,
          timestamp: new Date().toISOString()
        });
      }
    });

  } catch (error) {
    logger.error('Deployment error:', error);
    res.status(500).json({
      success: false,
      message: 'Deployment failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Get deployment status
 */
router.get('/status', async (req, res) => {
  try {
    const { service } = req.query;
    const namespace = process.env.K8S_NAMESPACE || 'default';

    if (service) {
      // Get specific service status
      const deployment = await k8sAppsV1Api.readNamespacedDeployment(service, namespace);
      res.json({
        service,
        status: deployment.body.status,
        timestamp: new Date().toISOString()
      });
    } else {
      // Get all deployments status
      const deployments = await k8sAppsV1Api.listNamespacedDeployment(namespace);
      const statuses = deployments.body.items.map(deployment => ({
        name: deployment.metadata.name,
        namespace: deployment.metadata.namespace,
        replicas: deployment.status.replicas,
        readyReplicas: deployment.status.readyReplicas,
        availableReplicas: deployment.status.availableReplicas,
        conditions: deployment.status.conditions
      }));

      res.json({
        deployments: statuses,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    logger.error('Status check error:', error);
    res.status(500).json({
      error: 'Failed to get deployment status',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Scale deployment
 */
router.post('/scale', async (req, res) => {
  try {
    const { service, replicas } = req.body;
    const namespace = process.env.K8S_NAMESPACE || 'default';

    if (!service || replicas === undefined) {
      return res.status(400).json({ error: 'Service name and replicas count are required' });
    }

    logger.info(`Scaling ${service} to ${replicas} replicas`);

    // Scale the deployment
    const patch = {
      spec: {
        replicas: parseInt(replicas)
      }
    };

    await k8sAppsV1Api.patchNamespacedDeployment(
      service, 
      namespace, 
      patch,
      undefined,
      undefined,
      undefined,
      undefined,
      {
        headers: { 'Content-Type': 'application/merge-patch+json' }
      }
    );

    logger.info(`Successfully scaled ${service} to ${replicas} replicas`);
    res.json({
      success: true,
      message: `${service} scaled to ${replicas} replicas`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Scaling error:', error);
    res.status(500).json({
      success: false,
      message: 'Scaling failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Rollback deployment
 */
router.post('/rollback', async (req, res) => {
  try {
    const { service, revision } = req.body;
    
    if (!service) {
      return res.status(400).json({ error: 'Service name is required' });
    }

    logger.info(`Rolling back ${service} to revision ${revision || 'previous'}`);

    const rollbackCmd = revision 
      ? ['rollout', 'undo', `deployment/${service}`, `--to-revision=${revision}`]
      : ['rollout', 'undo', `deployment/${service}`];

    const rollback = spawn('kubectl', rollbackCmd);

    let output = '';
    let errorOutput = '';

    rollback.stdout.on('data', (data) => {
      output += data.toString();
    });

    rollback.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    rollback.on('close', (code) => {
      if (code === 0) {
        logger.info(`Successfully rolled back ${service}`);
        res.json({
          success: true,
          message: `${service} rolled back successfully`,
          output,
          timestamp: new Date().toISOString()
        });
      } else {
        logger.error(`Failed to rollback ${service}: ${errorOutput}`);
        res.status(500).json({
          success: false,
          message: `Failed to rollback ${service}`,
          error: errorOutput,
          timestamp: new Date().toISOString()
        });
      }
    });

  } catch (error) {
    logger.error('Rollback error:', error);
    res.status(500).json({
      success: false,
      message: 'Rollback failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Get deployment logs
 */
router.get('/logs/:service', async (req, res) => {
  try {
    const { service } = req.params;
    const { lines = 100, follow = false } = req.query;
    const namespace = process.env.K8S_NAMESPACE || 'default';

    logger.info(`Getting logs for ${service}`);

    if (follow === 'true') {
      // Stream logs
      res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Transfer-Encoding': 'chunked'
      });

      const logsStream = spawn('kubectl', [
        'logs', 
        '-f', 
        `deployment/${service}`,
        '-n', namespace,
        '--tail', lines.toString()
      ]);

      logsStream.stdout.on('data', (data) => {
        res.write(data);
      });

      logsStream.on('close', () => {
        res.end();
      });

      req.on('close', () => {
        logsStream.kill();
      });

    } else {
      // Get static logs
      const logs = spawn('kubectl', [
        'logs', 
        `deployment/${service}`,
        '-n', namespace,
        '--tail', lines.toString()
      ]);

      let output = '';
      let errorOutput = '';

      logs.stdout.on('data', (data) => {
        output += data.toString();
      });

      logs.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      logs.on('close', (code) => {
        if (code === 0) {
          res.json({
            service,
            logs: output.split('\n'),
            timestamp: new Date().toISOString()
          });
        } else {
          res.status(500).json({
            error: 'Failed to get logs',
            message: errorOutput,
            timestamp: new Date().toISOString()
          });
        }
      });
    }

  } catch (error) {
    logger.error('Logs error:', error);
    res.status(500).json({
      error: 'Failed to get logs',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;