# PostgreSQL Database Service

## Overview
Primary database service for the iWORKZ platform providing ACID compliance, advanced querying, and high performance.

## Database Configuration
- **Version**: PostgreSQL 15+
- **Extensions**: uuid-ossp, pgcrypto, pg_stat_statements
- **Connection Pooling**: PgBouncer
- **Replication**: Master-Slave setup
- **Backup**: Automated daily backups

## Development Setup
```bash
# Start PostgreSQL container
docker-compose up db-postgres -d

# Connect to database
psql -h localhost -p 5432 -U iworkz_user -d iworkz

# Run migrations
npm run db:migrate

# Seed development data
npm run db:seed

# Reset database
npm run db:reset
```

## Schema Overview
### Core Tables
```sql
-- Users and Authentication
users
user_profiles
user_sessions
user_preferences

-- Jobs and Applications
jobs
job_requirements
applications
application_status

-- Matching and Recommendations
matches
recommendations
match_feedback

-- Credentials and Verification
credentials
credential_verifications
skill_assessments

-- Communication
messages
conversations
notifications

-- Analytics and Logging
user_activities
system_logs
performance_metrics
```

## Database Schema
### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'candidate',
    status user_status NOT NULL DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
```

### Jobs Table
```sql
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements JSONB,
    location JSONB,
    salary_range JSONB,
    employment_type employment_type NOT NULL,
    experience_level experience_level NOT NULL,
    status job_status NOT NULL DEFAULT 'draft',
    posted_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_salary_range CHECK (
        (salary_range->>'min')::numeric <= (salary_range->>'max')::numeric
    )
);

CREATE INDEX idx_jobs_employer ON jobs(employer_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_location ON jobs USING GIN(location);
CREATE INDEX idx_jobs_requirements ON jobs USING GIN(requirements);
```

## Custom Types
```sql
-- Enums for better type safety
CREATE TYPE user_role AS ENUM ('candidate', 'employer', 'admin', 'moderator');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'deleted');
CREATE TYPE job_status AS ENUM ('draft', 'published', 'closed', 'archived');
CREATE TYPE employment_type AS ENUM ('full_time', 'part_time', 'contract', 'freelance', 'internship');
CREATE TYPE experience_level AS ENUM ('entry', 'junior', 'mid', 'senior', 'executive');
CREATE TYPE application_status AS ENUM ('pending', 'reviewing', 'shortlisted', 'rejected', 'hired');
```

## Database Functions
### Update Timestamp Function
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Search Functions
```sql
-- Full-text search for jobs
CREATE INDEX idx_jobs_search ON jobs USING GIN(
    to_tsvector('english', title || ' ' || description)
);

-- Function for job search
CREATE OR REPLACE FUNCTION search_jobs(search_term TEXT)
RETURNS TABLE(
    job_id UUID,
    title VARCHAR(255),
    description TEXT,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        j.id,
        j.title,
        j.description,
        ts_rank(to_tsvector('english', j.title || ' ' || j.description), 
                plainto_tsquery('english', search_term)) as rank
    FROM jobs j
    WHERE to_tsvector('english', j.title || ' ' || j.description) 
          @@ plainto_tsquery('english', search_term)
    ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql;
```

## Performance Optimization
### Indexing Strategy
- B-tree indexes for exact matches and ranges
- GIN indexes for JSONB and full-text search
- Partial indexes for filtered queries
- Composite indexes for multi-column queries

### Query Optimization
- Use EXPLAIN ANALYZE for query planning
- Implement proper WHERE clause ordering
- Utilize prepared statements
- Regular VACUUM and ANALYZE operations

## Backup and Recovery
```bash
# Create backup
pg_dump -h localhost -p 5432 -U iworkz_user iworkz > backup.sql

# Create compressed backup
pg_dump -h localhost -p 5432 -U iworkz_user iworkz | gzip > backup.sql.gz

# Restore from backup
psql -h localhost -p 5432 -U iworkz_user -d iworkz < backup.sql

# Point-in-time recovery setup
wal_level = replica
archive_mode = on
archive_command = 'cp %p /var/lib/postgresql/archive/%f'
```

## Monitoring and Maintenance
- **pg_stat_statements**: Query performance tracking
- **Connection monitoring**: Active connections and locks
- **Disk usage**: Table and index size monitoring
- **Query analysis**: Slow query identification
- **Health checks**: Database connectivity and performance