import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { 
  Credential, 
  CredentialRequest, 
  CredentialStatus, 
  CredentialType,
  VerificationRequest,
  VerificationResult,
  APIResponse
} from '@/types';
import { database } from '@/config/database';
import { blockchain } from '@/config/blockchain';
import { ipfs } from '@/config/ipfs';
import { logger } from '@/utils/logger';

export class CredentialService {
  
  async issueCredential(request: CredentialRequest): Promise<APIResponse<Credential>> {
    try {
      const credentialId = uuidv4();
      const timestamp = new Date();

      // Generate document hash
      let dataHash = '';
      let ipfsHash = '';
      
      if (request.documentFile) {
        dataHash = crypto.createHash('sha256').update(request.documentFile.buffer).digest('hex');
        
        // Upload to IPFS
        const ipfsResult = await ipfs.uploadFile(request.documentFile.buffer, { pin: true });
        ipfsHash = ipfsResult.hash;
      } else {
        // Hash metadata if no file
        dataHash = crypto.createHash('sha256').update(JSON.stringify(request.metadata)).digest('hex');
      }

      // Create credential object
      const credential: Credential = {
        id: credentialId,
        holderId: request.holderId,
        issuerId: process.env.ISSUER_ADDRESS || '0x1234567890abcdef1234567890abcdef12345678',
        credentialType: request.credentialType,
        title: request.title,
        description: request.description,
        dataHash,
        ipfsHash,
        issuedAt: timestamp,
        expiresAt: request.expiresAt,
        revoked: false,
        metadata: request.metadata,
        status: CredentialStatus.PENDING
      };

      // Store in database
      await this.storeCredentialInDB(credential);

      // Issue on blockchain (mock for development)
      try {
        const chain = process.env.DEFAULT_CHAIN || 'sepolia';
        const txHash = await this.issueOnBlockchain(credential, chain);
        credential.blockchainTxHash = txHash;
        credential.status = CredentialStatus.VERIFIED;
        
        // Update database with blockchain info
        await this.updateCredentialStatus(credentialId, CredentialStatus.VERIFIED, txHash);
      } catch (blockchainError) {
        logger.error('Blockchain issuance failed, keeping credential in pending status:', blockchainError);
      }

      logger.info(`✅ Credential issued: ${credentialId}`);

      return {
        success: true,
        data: credential,
        message: 'Credential issued successfully',
        timestamp: new Date().toISOString(),
        requestId: uuidv4()
      };

    } catch (error) {
      logger.error('❌ Credential issuance failed:', error);
      return {
        success: false,
        error: 'Failed to issue credential',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        requestId: uuidv4()
      };
    }
  }

  async verifyCredential(request: VerificationRequest): Promise<APIResponse<VerificationResult>> {
    try {
      // Fetch credential from database
      const credential = await this.getCredentialFromDB(request.credentialId);
      
      if (!credential) {
        return {
          success: false,
          error: 'Credential not found',
          timestamp: new Date().toISOString(),
          requestId: uuidv4()
        };
      }

      // Check basic validity
      const isExpired = credential.expiresAt && new Date() > credential.expiresAt;
      const isRevoked = credential.revoked;
      
      let isValid = !isExpired && !isRevoked;
      let blockchainVerified = false;
      let ipfsVerified = false;

      // Verify on blockchain if transaction hash exists
      if (credential.blockchainTxHash && isValid) {
        try {
          blockchainVerified = await this.verifyOnBlockchain(credential);
        } catch (error) {
          logger.warn('Blockchain verification failed:', error);
        }
      }

      // Verify IPFS integrity if hash exists
      if (credential.ipfsHash && isValid) {
        try {
          ipfsVerified = await this.verifyIPFSIntegrity(credential);
        } catch (error) {
          logger.warn('IPFS verification failed:', error);
        }
      }

      const result: VerificationResult = {
        credentialId: request.credentialId,
        isValid,
        status: credential.status,
        verifiedAt: new Date(),
        details: request.includeDetails ? {
          issuer: credential.issuerId,
          holder: credential.holderId,
          issuedAt: credential.issuedAt,
          expiresAt: credential.expiresAt,
          blockchainVerified,
          ipfsVerified
        } : undefined,
        reason: !isValid ? (
          isRevoked ? 'Credential has been revoked' :
          isExpired ? 'Credential has expired' :
          'Invalid credential'
        ) : undefined
      };

      logger.info(`🔍 Credential verified: ${request.credentialId} - Valid: ${isValid}`);

      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
        requestId: uuidv4()
      };

    } catch (error) {
      logger.error('❌ Credential verification failed:', error);
      return {
        success: false,
        error: 'Failed to verify credential',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        requestId: uuidv4()
      };
    }
  }

  async revokeCredential(credentialId: string, reason: string): Promise<APIResponse<boolean>> {
    try {
      const credential = await this.getCredentialFromDB(credentialId);
      
      if (!credential) {
        return {
          success: false,
          error: 'Credential not found',
          timestamp: new Date().toISOString(),
          requestId: uuidv4()
        };
      }

      if (credential.revoked) {
        return {
          success: false,
          error: 'Credential already revoked',
          timestamp: new Date().toISOString(),
          requestId: uuidv4()
        };
      }

      // Update database
      await this.updateCredentialRevocation(credentialId, reason);

      // Revoke on blockchain (mock for development)
      try {
        const chain = process.env.DEFAULT_CHAIN || 'sepolia';
        await this.revokeOnBlockchain(credentialId, chain);
      } catch (blockchainError) {
        logger.warn('Blockchain revocation failed:', blockchainError);
      }

      logger.info(`❌ Credential revoked: ${credentialId}`);

      return {
        success: true,
        data: true,
        message: 'Credential revoked successfully',
        timestamp: new Date().toISOString(),
        requestId: uuidv4()
      };

    } catch (error) {
      logger.error('❌ Credential revocation failed:', error);
      return {
        success: false,
        error: 'Failed to revoke credential',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        requestId: uuidv4()
      };
    }
  }

  async getCredentialsByHolder(holderId: string): Promise<APIResponse<Credential[]>> {
    try {
      const credentials = await this.getCredentialsFromDBByHolder(holderId);

      return {
        success: true,
        data: credentials,
        timestamp: new Date().toISOString(),
        requestId: uuidv4()
      };

    } catch (error) {
      logger.error('❌ Failed to get credentials by holder:', error);
      return {
        success: false,
        error: 'Failed to retrieve credentials',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        requestId: uuidv4()
      };
    }
  }

  // Private methods for database operations
  private async storeCredentialInDB(credential: Credential): Promise<void> {
    const pool = database.getPostgresPool();
    const query = `
      INSERT INTO credentials (
        id, holder_id, issuer_id, credential_type, title, description,
        data_hash, ipfs_hash, blockchain_tx_hash, issued_at, expires_at,
        revoked, status, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    `;
    
    await pool.query(query, [
      credential.id,
      credential.holderId,
      credential.issuerId,
      credential.credentialType,
      credential.title,
      credential.description,
      credential.dataHash,
      credential.ipfsHash,
      credential.blockchainTxHash,
      credential.issuedAt,
      credential.expiresAt,
      credential.revoked,
      credential.status,
      JSON.stringify(credential.metadata)
    ]);
  }

  private async getCredentialFromDB(credentialId: string): Promise<Credential | null> {
    const pool = database.getPostgresPool();
    const query = 'SELECT * FROM credentials WHERE id = $1';
    const result = await pool.query(query, [credentialId]);
    
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return this.mapRowToCredential(row);
  }

  private async getCredentialsFromDBByHolder(holderId: string): Promise<Credential[]> {
    const pool = database.getPostgresPool();
    const query = 'SELECT * FROM credentials WHERE holder_id = $1 ORDER BY issued_at DESC';
    const result = await pool.query(query, [holderId]);
    
    return result.rows.map(row => this.mapRowToCredential(row));
  }

  private async updateCredentialStatus(credentialId: string, status: CredentialStatus, txHash?: string): Promise<void> {
    const pool = database.getPostgresPool();
    const query = `
      UPDATE credentials 
      SET status = $2, blockchain_tx_hash = $3, updated_at = NOW()
      WHERE id = $1
    `;
    await pool.query(query, [credentialId, status, txHash]);
  }

  private async updateCredentialRevocation(credentialId: string, reason: string): Promise<void> {
    const pool = database.getPostgresPool();
    const query = `
      UPDATE credentials 
      SET revoked = true, revoked_at = NOW(), revoked_reason = $2, status = $3, updated_at = NOW()
      WHERE id = $1
    `;
    await pool.query(query, [credentialId, reason, CredentialStatus.REVOKED]);
  }

  private mapRowToCredential(row: any): Credential {
    return {
      id: row.id,
      holderId: row.holder_id,
      issuerId: row.issuer_id,
      credentialType: row.credential_type as CredentialType,
      title: row.title,
      description: row.description,
      dataHash: row.data_hash,
      ipfsHash: row.ipfs_hash,
      blockchainTxHash: row.blockchain_tx_hash,
      issuedAt: row.issued_at,
      expiresAt: row.expires_at,
      revoked: row.revoked,
      revokedAt: row.revoked_at,
      revokedReason: row.revoked_reason,
      metadata: JSON.parse(row.metadata || '{}'),
      status: row.status as CredentialStatus
    };
  }

  // Mock blockchain operations (replace with actual implementations)
  private async issueOnBlockchain(credential: Credential, chain: string): Promise<string> {
    // Mock transaction hash for development
    const mockTxHash = `0x${crypto.randomBytes(32).toString('hex')}`;
    logger.info(`🔗 Mock blockchain issuance on ${chain}: ${mockTxHash}`);
    return mockTxHash;
  }

  private async verifyOnBlockchain(credential: Credential): Promise<boolean> {
    // Mock verification for development
    logger.info(`🔗 Mock blockchain verification for credential: ${credential.id}`);
    return true;
  }

  private async revokeOnBlockchain(credentialId: string, chain: string): Promise<string> {
    // Mock transaction hash for development
    const mockTxHash = `0x${crypto.randomBytes(32).toString('hex')}`;
    logger.info(`🔗 Mock blockchain revocation on ${chain}: ${mockTxHash}`);
    return mockTxHash;
  }

  private async verifyIPFSIntegrity(credential: Credential): Promise<boolean> {
    try {
      if (!credential.ipfsHash) return false;
      
      // Fetch file from IPFS and verify hash
      const fileData = await ipfs.fetchFile(credential.ipfsHash);
      const computedHash = crypto.createHash('sha256').update(fileData).digest('hex');
      
      return computedHash === credential.dataHash;
    } catch (error) {
      logger.error('IPFS integrity check failed:', error);
      return false;
    }
  }
}