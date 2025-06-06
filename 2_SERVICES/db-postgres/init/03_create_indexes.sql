\c iworkz_dev;

-- Indexes for performance optimization

-- Users schema indexes
CREATE INDEX idx_users_profiles_email ON users.profiles(email);
CREATE INDEX idx_users_profiles_type ON users.profiles(user_type);
CREATE INDEX idx_users_profiles_active ON users.profiles(is_active);
CREATE INDEX idx_users_profiles_verification ON users.profiles(verification_status);
CREATE INDEX idx_users_profiles_created ON users.profiles(created_at);

-- GIN indexes for JSONB columns
CREATE INDEX idx_users_talents_skills ON users.talents USING GIN(skills);
CREATE INDEX idx_users_talents_education ON users.talents USING GIN(education);
CREATE INDEX idx_users_talents_location ON users.talents USING GIN(preferred_locations);

-- Composite indexes for common queries
CREATE INDEX idx_users_talents_availability ON users.talents(availability_status, experience_years);
CREATE INDEX idx_users_employers_industry ON users.employers(industry, company_size);

-- Jobs schema indexes
CREATE INDEX idx_jobs_postings_status ON jobs.postings(status);
CREATE INDEX idx_jobs_postings_employer ON jobs.postings(employer_id, status);
CREATE INDEX idx_jobs_postings_location ON jobs.postings USING GIN(location);
CREATE INDEX idx_jobs_postings_skills ON jobs.postings USING GIN(skills_required);
CREATE INDEX idx_jobs_postings_type ON jobs.postings(employment_type, experience_level);
CREATE INDEX idx_jobs_postings_created ON jobs.postings(created_at);
CREATE INDEX idx_jobs_postings_expires ON jobs.postings(expires_at);

-- Full-text search indexes
CREATE INDEX idx_jobs_postings_title_search ON jobs.postings USING GIN(to_tsvector('english', title));
CREATE INDEX idx_jobs_postings_description_search ON jobs.postings USING GIN(to_tsvector('english', description));

-- Applications indexes
CREATE INDEX idx_jobs_applications_job ON jobs.applications(job_id, status);
CREATE INDEX idx_jobs_applications_talent ON jobs.applications(talent_id, status);
CREATE INDEX idx_jobs_applications_status ON jobs.applications(status, applied_at);
CREATE INDEX idx_jobs_applications_match_score ON jobs.applications(match_score DESC);

-- Matching schema indexes
CREATE INDEX idx_matching_scores_job ON matching.job_talent_scores(job_id, overall_score DESC);
CREATE INDEX idx_matching_scores_talent ON matching.job_talent_scores(talent_id, overall_score DESC);
CREATE INDEX idx_matching_scores_calculated ON matching.job_talent_scores(calculated_at);
CREATE INDEX idx_matching_scores_overall ON matching.job_talent_scores(overall_score DESC);

-- Compliance schema indexes
CREATE INDEX idx_compliance_checks_entity ON compliance.compliance_checks(entity_type, entity_id);
CREATE INDEX idx_compliance_checks_jurisdiction ON compliance.compliance_checks(jurisdiction, check_type);
CREATE INDEX idx_compliance_checks_status ON compliance.compliance_checks(status, created_at);

CREATE INDEX idx_regulatory_rules_jurisdiction ON compliance.regulatory_rules(jurisdiction, is_active);
CREATE INDEX idx_regulatory_rules_category ON compliance.regulatory_rules(rule_category, effective_date);

-- Analytics schema indexes
CREATE INDEX idx_user_events_user ON analytics.user_events(user_id, created_at);
CREATE INDEX idx_user_events_type ON analytics.user_events(event_type, created_at);
CREATE INDEX idx_user_events_session ON analytics.user_events(session_id, created_at);

CREATE INDEX idx_job_metrics_job ON analytics.job_metrics(job_id, metric_date);
CREATE INDEX idx_job_metrics_date ON analytics.job_metrics(metric_date);

-- Integrations schema indexes
CREATE INDEX idx_third_party_user ON integrations.third_party_connections(user_id, provider);
CREATE INDEX idx_third_party_provider ON integrations.third_party_connections(provider, connection_status);
CREATE INDEX idx_third_party_sync ON integrations.third_party_connections(last_sync_at, sync_frequency);

-- Notifications schema indexes
CREATE INDEX idx_notifications_user ON notifications.notifications(user_id, is_read, created_at);
CREATE INDEX idx_notifications_type ON notifications.notifications(type, created_at);
CREATE INDEX idx_notifications_unread ON notifications.notifications(user_id) WHERE is_read = false;
CREATE INDEX idx_notifications_unsent ON notifications.notifications(channel, is_sent) WHERE is_sent = false;

-- System config index
CREATE INDEX idx_system_config_key ON system_config(config_key);

-- Partial indexes for common filtered queries
CREATE INDEX idx_active_jobs ON jobs.postings(created_at) WHERE status = 'active';
CREATE INDEX idx_active_talents ON users.talents(updated_at) WHERE availability_status = 'available';
CREATE INDEX idx_pending_applications ON jobs.applications(applied_at) WHERE status = 'applied';

-- Covering indexes for read-heavy queries
CREATE INDEX idx_jobs_summary ON jobs.postings(id, title, employment_type, location, salary_range, created_at) WHERE status = 'active';
CREATE INDEX idx_talent_summary ON users.talents(id, profile_id, skills, experience_years, availability_status);