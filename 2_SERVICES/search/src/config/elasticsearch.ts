import { Client } from '@elastic/elasticsearch';
import { logger } from '../utils/logger';

class ElasticsearchConfig {
  private static instance: ElasticsearchConfig;
  private client: Client;

  private constructor() {
    this.client = this.createClient();
  }

  public static getInstance(): ElasticsearchConfig {
    if (!ElasticsearchConfig.instance) {
      ElasticsearchConfig.instance = new ElasticsearchConfig();
    }
    return ElasticsearchConfig.instance;
  }

  private createClient(): Client {
    const node = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';
    const username = process.env.ELASTICSEARCH_USERNAME;
    const password = process.env.ELASTICSEARCH_PASSWORD;
    const apiKey = process.env.ELASTICSEARCH_API_KEY;

    const clientConfig: any = {
      node,
      requestTimeout: 30000,
      pingTimeout: 3000,
      sniffOnStart: false,
      sniffInterval: false,
      maxRetries: 3,
      resurrectStrategy: 'ping'
    };

    // Authentication
    if (apiKey) {
      clientConfig.auth = {
        apiKey
      };
    } else if (username && password) {
      clientConfig.auth = {
        username,
        password
      };
    }

    // SSL Configuration
    if (process.env.ELASTICSEARCH_SSL === 'true') {
      clientConfig.ssl = {
        rejectUnauthorized: process.env.ELASTICSEARCH_SSL_VERIFY !== 'false'
      };
    }

    const client = new Client(clientConfig);

    // Event listeners
    client.on('response', (err, result) => {
      if (err) {
        logger.warn('Elasticsearch response error:', err);
      }
    });

    client.on('request', (err, result) => {
      if (err) {
        logger.error('Elasticsearch request error:', err);
      }
    });

    client.on('sniff', (err, result) => {
      if (err) {
        logger.warn('Elasticsearch sniff error:', err);
      }
    });

    client.on('resurrect', (err, result) => {
      logger.info('Elasticsearch node resurrected');
    });

    return client;
  }

  public getClient(): Client {
    return this.client;
  }

  public async testConnection(): Promise<boolean> {
    try {
      const response = await this.client.cluster.health();
      logger.info('Elasticsearch connection successful', {
        clusterName: response.cluster_name,
        status: response.status,
        numberOfNodes: response.number_of_nodes
      });
      return true;
    } catch (error) {
      logger.error('Elasticsearch connection failed:', error);
      return false;
    }
  }

  public async waitForConnection(maxRetries: number = 30, interval: number = 2000): Promise<boolean> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const isConnected = await this.testConnection();
        if (isConnected) {
          return true;
        }
      } catch (error) {
        logger.debug(`Connection attempt ${i + 1}/${maxRetries} failed`);
      }

      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }

    logger.error(`Failed to connect to Elasticsearch after ${maxRetries} attempts`);
    return false;
  }

  public async getClusterHealth(): Promise<any> {
    try {
      return await this.client.cluster.health();
    } catch (error) {
      logger.error('Error getting cluster health:', error);
      throw error;
    }
  }

  public async getClusterStats(): Promise<any> {
    try {
      return await this.client.cluster.stats();
    } catch (error) {
      logger.error('Error getting cluster stats:', error);
      throw error;
    }
  }

  public async getIndexStats(index?: string): Promise<any> {
    try {
      const params = index ? { index } : {};
      return await this.client.indices.stats(params);
    } catch (error) {
      logger.error('Error getting index stats:', error);
      throw error;
    }
  }

  public async createIndex(name: string, body: any): Promise<void> {
    try {
      const exists = await this.client.indices.exists({ index: name });
      
      if (!exists) {
        await this.client.indices.create({
          index: name,
          body
        });
        logger.info(`Index created: ${name}`);
      } else {
        logger.info(`Index already exists: ${name}`);
      }
    } catch (error) {
      logger.error(`Error creating index ${name}:`, error);
      throw error;
    }
  }

  public async deleteIndex(name: string): Promise<void> {
    try {
      const exists = await this.client.indices.exists({ index: name });
      
      if (exists) {
        await this.client.indices.delete({ index: name });
        logger.info(`Index deleted: ${name}`);
      } else {
        logger.info(`Index does not exist: ${name}`);
      }
    } catch (error) {
      logger.error(`Error deleting index ${name}:`, error);
      throw error;
    }
  }

  public async updateIndexMapping(name: string, mapping: any): Promise<void> {
    try {
      await this.client.indices.putMapping({
        index: name,
        body: mapping
      });
      logger.info(`Index mapping updated: ${name}`);
    } catch (error) {
      logger.error(`Error updating index mapping ${name}:`, error);
      throw error;
    }
  }

  public async createAlias(index: string, alias: string): Promise<void> {
    try {
      await this.client.indices.putAlias({
        index,
        name: alias
      });
      logger.info(`Alias created: ${alias} -> ${index}`);
    } catch (error) {
      logger.error(`Error creating alias ${alias}:`, error);
      throw error;
    }
  }

  public async reindex(sourceIndex: string, destIndex: string): Promise<void> {
    try {
      const response = await this.client.reindex({
        body: {
          source: { index: sourceIndex },
          dest: { index: destIndex }
        },
        wait_for_completion: false
      });

      logger.info(`Reindex started: ${sourceIndex} -> ${destIndex}`, {
        taskId: response.task
      });
    } catch (error) {
      logger.error(`Error reindexing ${sourceIndex} to ${destIndex}:`, error);
      throw error;
    }
  }

  public async refreshIndex(index: string): Promise<void> {
    try {
      await this.client.indices.refresh({ index });
    } catch (error) {
      logger.error(`Error refreshing index ${index}:`, error);
      throw error;
    }
  }

  public async flushIndex(index: string): Promise<void> {
    try {
      await this.client.indices.flush({ index });
    } catch (error) {
      logger.error(`Error flushing index ${index}:`, error);
      throw error;
    }
  }

  public async getMapping(index: string): Promise<any> {
    try {
      return await this.client.indices.getMapping({ index });
    } catch (error) {
      logger.error(`Error getting mapping for ${index}:`, error);
      throw error;
    }
  }

  public async getSettings(index: string): Promise<any> {
    try {
      return await this.client.indices.getSettings({ index });
    } catch (error) {
      logger.error(`Error getting settings for ${index}:`, error);
      throw error;
    }
  }

  public async updateSettings(index: string, settings: any): Promise<void> {
    try {
      await this.client.indices.putSettings({
        index,
        body: settings
      });
      logger.info(`Settings updated for index: ${index}`);
    } catch (error) {
      logger.error(`Error updating settings for ${index}:`, error);
      throw error;
    }
  }

  public async closeIndex(index: string): Promise<void> {
    try {
      await this.client.indices.close({ index });
      logger.info(`Index closed: ${index}`);
    } catch (error) {
      logger.error(`Error closing index ${index}:`, error);
      throw error;
    }
  }

  public async openIndex(index: string): Promise<void> {
    try {
      await this.client.indices.open({ index });
      logger.info(`Index opened: ${index}`);
    } catch (error) {
      logger.error(`Error opening index ${index}:`, error);
      throw error;
    }
  }

  public async close(): Promise<void> {
    try {
      await this.client.close();
      logger.info('Elasticsearch client closed');
    } catch (error) {
      logger.error('Error closing Elasticsearch client:', error);
    }
  }
}

export const elasticsearchConfig = ElasticsearchConfig.getInstance();