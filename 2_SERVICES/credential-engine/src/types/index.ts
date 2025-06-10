export interface Credential {
  id: string;
  holderId: string;
  issuerId: string;
  credentialType: CredentialType;
  title: string;
  description: string;
  dataHash: string;
  ipfsHash?: string;
  blockchainTxHash?: string;
  issuedAt: Date;
  expiresAt?: Date;
  revoked: boolean;
  revokedAt?: Date;
  revokedReason?: string;
  metadata: Record<string, any>;
  status: CredentialStatus;
}

export enum CredentialType {
  EDUCATION = 'education',
  PROFESSIONAL = 'professional',
  SKILL = 'skill',
  IDENTITY = 'identity',
  WORK_EXPERIENCE = 'work_experience',
  CERTIFICATION = 'certification',
  LICENSE = 'license'
}

export enum CredentialStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  REVOKED = 'revoked',
  EXPIRED = 'expired'
}

export interface CredentialRequest {
  holderId: string;
  credentialType: CredentialType;
  title: string;
  description: string;
  documentFile?: Express.Multer.File;
  metadata: Record<string, any>;
  expiresAt?: Date;
}

export interface VerificationRequest {
  credentialId: string;
  requesterId: string;
  purpose: string;
  includeDetails?: boolean;
}

export interface VerificationResult {
  credentialId: string;
  isValid: boolean;
  status: CredentialStatus;
  verifiedAt: Date;
  details?: {
    issuer: string;
    holder: string;
    issuedAt: Date;
    expiresAt?: Date;
    blockchainVerified: boolean;
    ipfsVerified: boolean;
  };
  reason?: string;
}

export interface ZKProofRequest {
  credentialId: string;
  proofType: 'existence' | 'attribute' | 'range';
  attributes?: string[];
  threshold?: number;
}

export interface ZKProofResult {
  proofValid: boolean;
  proof: string;
  publicInputs: string[];
  verificationKey: string;
}

export interface IssuerProfile {
  id: string;
  name: string;
  type: 'educational' | 'professional' | 'government' | 'certification_body';
  address: string;
  authorizedBy: string;
  publicKey: string;
  isActive: boolean;
  verificationEndpoint?: string;
  logoUrl?: string;
  website?: string;
}

export interface SmartContractInteraction {
  functionName: string;
  parameters: any[];
  gasLimit?: number;
  gasPrice?: string;
}

export interface BlockchainTransaction {
  hash: string;
  blockNumber: number;
  gasUsed: number;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
}

export interface IPFSUploadResult {
  hash: string;
  size: number;
  url: string;
}

export interface DocumentAnalysis {
  isValid: boolean;
  confidence: number;
  documentType: string;
  extractedData: Record<string, any>;
  anomalies: string[];
  verificationSources: string[];
}

export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  credentialId?: string;
  details: Record<string, any>;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
}

export interface CredentialStatistics {
  totalCredentials: number;
  verifiedCredentials: number;
  pendingCredentials: number;
  rejectedCredentials: number;
  revokedCredentials: number;
  credentialsByType: Record<CredentialType, number>;
  verificationRate: number;
  averageVerificationTime: number;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  requestId: string;
}

export interface PaginatedResponse<T = any> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface QueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}