-- Create main database if not exists
CREATE DATABASE iworkz_dev;

-- Create additional databases for testing
CREATE DATABASE iworkz_test;

-- Create schemas
\c iworkz_dev;

CREATE SCHEMA IF NOT EXISTS users;
CREATE SCHEMA IF NOT EXISTS jobs;
CREATE SCHEMA IF NOT EXISTS matching;
CREATE SCHEMA IF NOT EXISTS compliance;
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE SCHEMA IF NOT EXISTS integrations;
CREATE SCHEMA IF NOT EXISTS notifications;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types
CREATE TYPE user_type_enum AS ENUM ('talent', 'employer', 'agency', 'admin');
CREATE TYPE verification_status_enum AS ENUM ('pending', 'verified', 'rejected', 'suspended');
CREATE TYPE job_status_enum AS ENUM ('draft', 'active', 'paused', 'closed', 'expired');
CREATE TYPE application_status_enum AS ENUM ('applied', 'reviewing', 'shortlisted', 'interviewing', 'offered', 'hired', 'rejected', 'withdrawn');
CREATE TYPE employment_type_enum AS ENUM ('full-time', 'part-time', 'contract', 'freelance', 'internship');
CREATE TYPE experience_level_enum AS ENUM ('entry', 'junior', 'mid', 'senior', 'lead', 'executive');

COMMENT ON DATABASE iworkz_dev IS 'iWORKZ Platform Development Database';
COMMENT ON SCHEMA users IS 'User profiles, authentication and related data';
COMMENT ON SCHEMA jobs IS 'Job postings, applications and related data';
COMMENT ON SCHEMA matching IS 'AI matching algorithms and scores';
COMMENT ON SCHEMA compliance IS 'Regulatory compliance and audit data';
COMMENT ON SCHEMA analytics IS 'Analytics, metrics and reporting data';
COMMENT ON SCHEMA integrations IS 'Third-party integration data';
COMMENT ON SCHEMA notifications IS 'Notification system data';