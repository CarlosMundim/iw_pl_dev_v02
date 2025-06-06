\c iworkz_dev;

-- Users Schema Tables
CREATE TABLE users.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    country_code VARCHAR(2),
    language_preference VARCHAR(5) DEFAULT 'en',
    user_type user_type_enum NOT NULL,
    verification_status verification_status_enum DEFAULT 'pending',
    avatar_url VARCHAR(500),
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    terms_accepted_at TIMESTAMP WITH TIME ZONE,
    privacy_accepted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE users.talents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES users.profiles(id) ON DELETE CASCADE,
    skills JSONB DEFAULT '{}',
    experience_years INTEGER DEFAULT 0,
    education JSONB DEFAULT '[]',
    certifications JSONB DEFAULT '[]',
    availability_status VARCHAR(20) DEFAULT 'available',
    preferred_locations JSONB DEFAULT '[]',
    salary_expectations JSONB DEFAULT '{}',
    resume_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    linkedin_url VARCHAR(500),
    github_url VARCHAR(500),
    bio TEXT,
    work_authorization JSONB DEFAULT '{}',
    remote_preference VARCHAR(20) DEFAULT 'flexible',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(profile_id)
);

CREATE TABLE users.employers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES users.profiles(id) ON DELETE CASCADE,
    company_name VARCHAR(200) NOT NULL,
    company_size VARCHAR(20),
    industry VARCHAR(100),
    company_description TEXT,
    website_url VARCHAR(500),
    headquarters_location JSONB DEFAULT '{}',
    verification_documents JSONB DEFAULT '[]',
    company_logo_url VARCHAR(500),
    founded_year INTEGER,
    employee_count_range VARCHAR(20),
    company_type VARCHAR(50),
    tax_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(profile_id)
);

-- Jobs Schema Tables
CREATE TABLE jobs.postings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employer_id UUID REFERENCES users.employers(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    requirements JSONB DEFAULT '[]',
    skills_required JSONB DEFAULT '[]',
    experience_level experience_level_enum,
    employment_type employment_type_enum,
    location JSONB DEFAULT '{}',
    remote_allowed BOOLEAN DEFAULT false,
    salary_range JSONB DEFAULT '{}',
    benefits JSONB DEFAULT '[]',
    status job_status_enum DEFAULT 'draft',
    application_deadline TIMESTAMP WITH TIME ZONE,
    start_date DATE,
    positions_available INTEGER DEFAULT 1,
    external_job_id VARCHAR(100),
    source_platform VARCHAR(50),
    compliance_checked BOOLEAN DEFAULT false,
    compliance_results JSONB DEFAULT '{}',
    view_count INTEGER DEFAULT 0,
    application_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE jobs.applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs.postings(id) ON DELETE CASCADE,
    talent_id UUID REFERENCES users.talents(id) ON DELETE CASCADE,
    status application_status_enum DEFAULT 'applied',
    cover_letter TEXT,
    custom_resume_url VARCHAR(500),
    match_score DECIMAL(4,3),
    ai_assessment JSONB DEFAULT '{}',
    screening_answers JSONB DEFAULT '{}',
    interview_notes JSONB DEFAULT '[]',
    feedback TEXT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    interviewer_notes TEXT,
    UNIQUE(job_id, talent_id)
);

-- Matching Schema Tables
CREATE TABLE matching.job_talent_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs.postings(id) ON DELETE CASCADE,
    talent_id UUID REFERENCES users.talents(id) ON DELETE CASCADE,
    overall_score DECIMAL(4,3),
    skills_score DECIMAL(4,3),
    experience_score DECIMAL(4,3),
    location_score DECIMAL(4,3),
    availability_score DECIMAL(4,3),
    salary_score DECIMAL(4,3),
    ai_explanation TEXT,
    confidence_level DECIMAL(3,2),
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    calculation_version VARCHAR(10) DEFAULT '1.0',
    UNIQUE(job_id, talent_id)
);

CREATE TABLE matching.matching_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users.profiles(id) ON DELETE CASCADE,
    user_type user_type_enum NOT NULL,
    preferences JSONB DEFAULT '{}',
    weight_skills DECIMAL(3,2) DEFAULT 0.40,
    weight_experience DECIMAL(3,2) DEFAULT 0.30,
    weight_location DECIMAL(3,2) DEFAULT 0.15,
    weight_salary DECIMAL(3,2) DEFAULT 0.15,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Compliance Schema Tables
CREATE TABLE compliance.compliance_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(20) NOT NULL, -- 'job', 'contract', 'profile'
    entity_id UUID NOT NULL,
    jurisdiction VARCHAR(5) NOT NULL, -- 'UK', 'DE', 'AU', etc.
    check_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    results JSONB DEFAULT '{}',
    issues_found JSONB DEFAULT '[]',
    recommendations JSONB DEFAULT '[]',
    confidence_score DECIMAL(3,2),
    checked_by VARCHAR(20) DEFAULT 'ai', -- 'ai', 'human', 'system'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE compliance.regulatory_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jurisdiction VARCHAR(5) NOT NULL,
    rule_category VARCHAR(50) NOT NULL,
    rule_name VARCHAR(200) NOT NULL,
    rule_description TEXT,
    rule_parameters JSONB DEFAULT '{}',
    effective_date DATE,
    expiry_date DATE,
    is_active BOOLEAN DEFAULT true,
    severity VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics Schema Tables
CREATE TABLE analytics.user_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users.profiles(id) ON DELETE SET NULL,
    session_id VARCHAR(100),
    event_type VARCHAR(50) NOT NULL,
    event_category VARCHAR(50),
    event_data JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    referrer_url TEXT,
    page_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE analytics.job_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs.postings(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    views_count INTEGER DEFAULT 0,
    applications_count INTEGER DEFAULT 0,
    matches_generated INTEGER DEFAULT 0,
    shortlisted_count INTEGER DEFAULT 0,
    interviews_count INTEGER DEFAULT 0,
    offers_made INTEGER DEFAULT 0,
    hires_count INTEGER DEFAULT 0,
    avg_match_score DECIMAL(4,3),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(job_id, metric_date)
);

-- Integrations Schema Tables
CREATE TABLE integrations.third_party_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users.profiles(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'linkedin', 'indeed', 'stripe', etc.
    provider_user_id VARCHAR(200),
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    scope_permissions JSONB DEFAULT '[]',
    connection_status VARCHAR(20) DEFAULT 'active',
    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_frequency VARCHAR(20) DEFAULT 'daily',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, provider)
);

-- Notifications Schema Tables
CREATE TABLE notifications.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users.profiles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    channel VARCHAR(20) DEFAULT 'in-app', -- 'in-app', 'email', 'sms', 'push'
    is_read BOOLEAN DEFAULT false,
    is_sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System tables for configuration and monitoring
CREATE TABLE system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value JSONB,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables with updated_at column
CREATE TRIGGER set_timestamp_users_profiles BEFORE UPDATE ON users.profiles FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_users_talents BEFORE UPDATE ON users.talents FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_users_employers BEFORE UPDATE ON users.employers FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_jobs_postings BEFORE UPDATE ON jobs.postings FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_jobs_applications BEFORE UPDATE ON jobs.applications FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_matching_preferences BEFORE UPDATE ON matching.matching_preferences FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_compliance_checks BEFORE UPDATE ON compliance.compliance_checks FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_regulatory_rules BEFORE UPDATE ON compliance.regulatory_rules FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_third_party_connections BEFORE UPDATE ON integrations.third_party_connections FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_system_config BEFORE UPDATE ON system_config FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();