import { create, IPFSHTTPClient } from 'ipfs-http-client';
import { logger } from '@/utils/logger';

class IPFSConfig {
  private client: IPFSHTTPClient | null = null;
  private gatewayUrl: string;

  constructor() {
    this.gatewayUrl = process.env.IPFS_GATEWAY || 'https://gateway.ipfs.io';
  }

  async initialize(): Promise<void> {
    try {
      const apiUrl = process.env.IPFS_API_URL || 'http://localhost:5001';
      const auth = process.env.IPFS_PROJECT_ID && process.env.IPFS_PROJECT_SECRET 
        ? `${process.env.IPFS_PROJECT_ID}:${process.env.IPFS_PROJECT_SECRET}`
        : undefined;

      this.client = create({
        url: apiUrl,
        headers: auth ? {
          authorization: `Basic ${Buffer.from(auth).toString('base64')}`
        } : undefined
      });

      // Test connection
      const version = await this.client.version();
      logger.info(`✅ IPFS connected - Version: ${version.version}`);
    } catch (error) {
      logger.error('❌ IPFS initialization failed:', error);
      // For development, create a mock client
      this.createMockClient();
    }
  }

  private createMockClient(): void {
    logger.warn('🔄 Using mock IPFS client for development');
    
    this.client = {
      add: async (data: any) => {
        const mockHash = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
        logger.info(`📦 Mock IPFS upload: ${mockHash}`);
        return { path: mockHash, size: Buffer.isBuffer(data) ? data.length : JSON.stringify(data).length };
      },
      cat: async (hash: string) => {
        logger.info(`📥 Mock IPFS fetch: ${hash}`);
        return Buffer.from('Mock file content');
      },
      pin: {
        add: async (hash: string) => {
          logger.info(`📌 Mock IPFS pin: ${hash}`);
          return { pins: [hash] };
        },
        rm: async (hash: string) => {
          logger.info(`📌 Mock IPFS unpin: ${hash}`);
          return { pins: [hash] };
        }
      },
      version: async () => {
        return { version: 'mock-0.1.0' };
      }
    } as any;
  }

  async uploadFile(file: Buffer, options?: { pin?: boolean }): Promise<{ hash: string; size: number; url: string }> {
    try {
      if (!this.client) {
        throw new Error('IPFS client not initialized');
      }

      const result = await this.client.add(file);
      const hash = result.path;
      const size = result.size;

      // Pin file if requested
      if (options?.pin) {
        await this.client.pin.add(hash);
        logger.info(`📌 File pinned to IPFS: ${hash}`);
      }

      const url = `${this.gatewayUrl}/ipfs/${hash}`;
      
      logger.info(`📦 File uploaded to IPFS: ${hash} (${size} bytes)`);
      
      return { hash, size, url };
    } catch (error) {
      logger.error('❌ IPFS upload failed:', error);
      throw error;
    }
  }

  async uploadJSON(data: any, options?: { pin?: boolean }): Promise<{ hash: string; size: number; url: string }> {
    try {
      const jsonBuffer = Buffer.from(JSON.stringify(data));
      return await this.uploadFile(jsonBuffer, options);
    } catch (error) {
      logger.error('❌ IPFS JSON upload failed:', error);
      throw error;
    }
  }

  async fetchFile(hash: string): Promise<Buffer> {
    try {
      if (!this.client) {
        throw new Error('IPFS client not initialized');
      }

      const chunks: Uint8Array[] = [];
      for await (const chunk of this.client.cat(hash)) {
        chunks.push(chunk);
      }

      const buffer = Buffer.concat(chunks);
      logger.info(`📥 File fetched from IPFS: ${hash} (${buffer.length} bytes)`);
      
      return buffer;
    } catch (error) {
      logger.error(`❌ IPFS fetch failed for ${hash}:`, error);
      throw error;
    }
  }

  async fetchJSON(hash: string): Promise<any> {
    try {
      const buffer = await this.fetchFile(hash);
      const data = JSON.parse(buffer.toString('utf8'));
      
      logger.info(`📥 JSON fetched from IPFS: ${hash}`);
      return data;
    } catch (error) {
      logger.error(`❌ IPFS JSON fetch failed for ${hash}:`, error);
      throw error;
    }
  }

  async pinFile(hash: string): Promise<void> {
    try {
      if (!this.client) {
        throw new Error('IPFS client not initialized');
      }

      await this.client.pin.add(hash);
      logger.info(`📌 File pinned: ${hash}`);
    } catch (error) {
      logger.error(`❌ IPFS pin failed for ${hash}:`, error);
      throw error;
    }
  }

  async unpinFile(hash: string): Promise<void> {
    try {
      if (!this.client) {
        throw new Error('IPFS client not initialized');
      }

      await this.client.pin.rm(hash);
      logger.info(`📌 File unpinned: ${hash}`);
    } catch (error) {
      logger.error(`❌ IPFS unpin failed for ${hash}:`, error);
      throw error;
    }
  }

  getGatewayUrl(hash: string): string {
    return `${this.gatewayUrl}/ipfs/${hash}`;
  }

  async checkHealth(): Promise<boolean> {
    try {
      if (!this.client) return false;
      
      await this.client.version();
      return true;
    } catch {
      return false;
    }
  }

  async getNodeInfo(): Promise<any> {
    try {
      if (!this.client) {
        throw new Error('IPFS client not initialized');
      }

      const version = await this.client.version();
      
      return {
        version: version.version,
        gatewayUrl: this.gatewayUrl,
        status: 'connected'
      };
    } catch (error) {
      logger.error('❌ Failed to get IPFS node info:', error);
      return {
        version: 'unknown',
        gatewayUrl: this.gatewayUrl,
        status: 'disconnected'
      };
    }
  }
}

export const ipfs = new IPFSConfig();