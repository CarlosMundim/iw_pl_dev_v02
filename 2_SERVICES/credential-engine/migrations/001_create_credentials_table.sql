-- Create credentials database schema

-- Create database (run this separately if needed)
-- CREATE DATABASE iworkz_credentials;

-- Create credentials table
CREATE TABLE IF NOT EXISTS credentials (
    id VARCHAR(36) PRIMARY KEY,
    holder_id VARCHAR(255) NOT NULL,
    issuer_id VARCHAR(255) NOT NULL,
    credential_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    data_hash VARCHAR(64) NOT NULL,
    ipfs_hash VARCHAR(100),
    blockchain_tx_hash VARCHAR(66),
    issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_reason TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create issuers table
CREATE TABLE IF NOT EXISTS issuers (
    id VARCHAR(36) PRIMARY KEY,
    address VARCHAR(42) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    organization_type VARCHAR(50) NOT NULL,
    authorized BOOLEAN NOT NULL DEFAULT FALSE,
    authorized_at TIMESTAMP WITH TIME ZONE,
    authorized_by VARCHAR(42),
    public_key TEXT,
    verification_endpoint VARCHAR(500),
    logo_url VARCHAR(500),
    website VARCHAR(500),
    contact_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create verification_requests table
CREATE TABLE IF NOT EXISTS verification_requests (
    id VARCHAR(36) PRIMARY KEY,
    credential_id VARCHAR(36) NOT NULL REFERENCES credentials(id),
    requester_id VARCHAR(255) NOT NULL,
    purpose TEXT,
    requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE,
    result JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    credential_id VARCHAR(36),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_credentials_holder_id ON credentials(holder_id);
CREATE INDEX IF NOT EXISTS idx_credentials_issuer_id ON credentials(issuer_id);
CREATE INDEX IF NOT EXISTS idx_credentials_type ON credentials(credential_type);
CREATE INDEX IF NOT EXISTS idx_credentials_status ON credentials(status);
CREATE INDEX IF NOT EXISTS idx_credentials_issued_at ON credentials(issued_at);
CREATE INDEX IF NOT EXISTS idx_credentials_revoked ON credentials(revoked);
CREATE INDEX IF NOT EXISTS idx_credentials_blockchain_tx ON credentials(blockchain_tx_hash);

CREATE INDEX IF NOT EXISTS idx_issuers_address ON issuers(address);
CREATE INDEX IF NOT EXISTS idx_issuers_authorized ON issuers(authorized);

CREATE INDEX IF NOT EXISTS idx_verification_requests_credential_id ON verification_requests(credential_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_requester_id ON verification_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON verification_requests(status);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_credential_id ON audit_logs(credential_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_credentials_updated_at 
    BEFORE UPDATE ON credentials 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_issuers_updated_at 
    BEFORE UPDATE ON issuers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default issuer (iWORKZ Platform)
INSERT INTO issuers (
    id,
    address,
    name,
    organization_type,
    authorized,
    authorized_at,
    authorized_by,
    verification_endpoint
) VALUES (
    gen_random_uuid()::text,
    '0x1234567890abcdef1234567890abcdef12345678',
    'iWORKZ Platform',
    'platform',
    TRUE,
    NOW(),
    '0x1234567890abcdef1234567890abcdef12345678',
    'https://api.iworkz.com/verify'
) ON CONFLICT (address) DO NOTHING;

-- Create views for common queries
CREATE OR REPLACE VIEW active_credentials AS
SELECT *
FROM credentials
WHERE revoked = FALSE 
  AND (expires_at IS NULL OR expires_at > NOW())
  AND status = 'verified';

CREATE OR REPLACE VIEW credential_statistics AS
SELECT 
    credential_type,
    status,
    COUNT(*) as count,
    AVG(EXTRACT(EPOCH FROM (verified_at - issued_at))) as avg_verification_time_seconds
FROM credentials c
LEFT JOIN verification_requests vr ON c.id = vr.credential_id
GROUP BY credential_type, status;

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO iworkz_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO iworkz_user;