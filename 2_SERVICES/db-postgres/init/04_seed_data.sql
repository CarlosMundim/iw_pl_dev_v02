\c iworkz_dev;

-- Insert system configuration
INSERT INTO system_config (config_key, config_value, description, is_public) VALUES
('platform_version', '"1.0.0"', 'Current platform version', true),
('maintenance_mode', 'false', 'Whether the platform is in maintenance mode', true),
('max_file_upload_size', '52428800', 'Maximum file upload size in bytes (50MB)', false),
('supported_file_types', '["pdf", "doc", "docx", "txt", "jpg", "png"]', 'Supported file types for uploads', true),
('default_pagination_limit', '20', 'Default number of items per page', true),
('max_pagination_limit', '100', 'Maximum number of items per page', false),
('job_expiry_days', '30', 'Default job posting expiry in days', false),
('matching_threshold', '0.6', 'Minimum matching score threshold', false),
('ai_confidence_threshold', '0.7', 'Minimum AI confidence threshold', false);

-- Insert sample regulatory rules for different jurisdictions
INSERT INTO compliance.regulatory_rules (jurisdiction, rule_category, rule_name, rule_description, rule_parameters, effective_date, is_active, severity) VALUES
('UK', 'employment_law', 'Working Time Directive', 'Maximum 48 hours per week average working time', '{"max_hours_per_week": 48, "exceptions": ["opt_out_agreement"]}', '2023-01-01', true, 'high'),
('UK', 'discrimination', 'Equality Act 2010', 'Prohibition of age discrimination in job postings', '{"prohibited_terms": ["young", "energetic", "digital native"], "age_related_terms": true}', '2023-01-01', true, 'critical'),
('UK', 'visa_requirements', 'Right to Work Check', 'Verification of right to work in the UK', '{"required_documents": ["passport", "visa", "biometric_card"], "check_frequency": "pre_employment"}', '2023-01-01', true, 'critical'),

('DE', 'employment_law', 'Working Time Act', 'Maximum 10 hours per day working time', '{"max_hours_per_day": 10, "max_hours_per_week": 48, "rest_period_hours": 11}', '2023-01-01', true, 'high'),
('DE', 'data_protection', 'GDPR Compliance', 'Data protection requirements for job applications', '{"consent_required": true, "data_retention_months": 6, "right_to_deletion": true}', '2023-01-01', true, 'critical'),
('DE', 'minimum_wage', 'Minimum Wage Act', 'Statutory minimum wage requirements', '{"minimum_wage_euro": 12.0, "trainee_minimum": 8.5}', '2023-01-01', true, 'high'),

('AU', 'employment_law', 'Fair Work Act', 'National employment standards', '{"max_hours_per_week": 38, "overtime_rates": true, "leave_entitlements": true}', '2023-01-01', true, 'high'),
('AU', 'visa_requirements', 'Work Visa Check', 'Verification of work authorization', '{"visa_types": ["citizen", "permanent_resident", "work_visa"], "check_timing": "before_offer"}', '2023-01-01', true, 'critical'),
('AU', 'superannuation', 'Superannuation Guarantee', 'Mandatory superannuation contributions', '{"min_contribution_rate": 0.105, "applies_to": "all_employees"}', '2023-01-01', true, 'medium');

-- Insert sample admin user (password: admin123!)
INSERT INTO users.profiles (id, email, password_hash, first_name, last_name, user_type, verification_status, is_active, terms_accepted_at, privacy_accepted_at) VALUES
(uuid_generate_v4(), 'admin@iworkz.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBd/1P/.VX1/oO', 'System', 'Administrator', 'admin', 'verified', true, NOW(), NOW());

-- Insert sample employer
INSERT INTO users.profiles (id, email, password_hash, first_name, last_name, user_type, verification_status, is_active, country_code, phone, terms_accepted_at, privacy_accepted_at) VALUES
(uuid_generate_v4(), 'employer@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBd/1P/.VX1/oO', 'John', 'Smith', 'employer', 'verified', true, 'UK', '+44123456789', NOW(), NOW());

-- Insert employer company details
INSERT INTO users.employers (profile_id, company_name, company_size, industry, company_description, website_url, headquarters_location, founded_year, employee_count_range, company_type)
SELECT p.id, 'TechCorp Solutions', 'medium', 'Technology', 'Leading software development company specializing in AI and machine learning solutions', 'https://techcorp.example.com', '{"city": "London", "country": "UK", "address": "123 Tech Street, London, UK"}', 2018, '51-200', 'private'
FROM users.profiles p WHERE p.email = 'employer@example.com';

-- Insert sample talent users
INSERT INTO users.profiles (id, email, password_hash, first_name, last_name, user_type, verification_status, is_active, country_code, phone, language_preference, terms_accepted_at, privacy_accepted_at) VALUES
(uuid_generate_v4(), 'talent1@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBd/1P/.VX1/oO', 'Alice', 'Johnson', 'talent', 'verified', true, 'UK', '+44987654321', 'en', NOW(), NOW()),
(uuid_generate_v4(), 'talent2@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBd/1P/.VX1/oO', 'Bob', 'Wilson', 'talent', 'verified', true, 'DE', '+49123456789', 'de', NOW(), NOW()),
(uuid_generate_v4(), 'talent3@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBd/1P/.VX1/oO', 'Carol', 'Davis', 'talent', 'pending', true, 'AU', '+61987654321', 'en', NOW(), NOW());

-- Insert talent profiles
INSERT INTO users.talents (profile_id, skills, experience_years, education, availability_status, preferred_locations, salary_expectations, bio, remote_preference)
SELECT p.id, 
    '{"technical_skills": ["JavaScript", "React", "Node.js", "Python", "SQL"], "soft_skills": ["Communication", "Problem Solving", "Team Leadership"], "frameworks": ["Express.js", "Next.js", "Django"]}',
    5,
    '[{"degree": "BSc Computer Science", "institution": "University of London", "year": 2019}, {"certification": "AWS Certified Developer", "year": 2022}]',
    'available',
    '[{"city": "London", "country": "UK", "remote": true}, {"city": "Manchester", "country": "UK", "remote": false}]',
    '{"min_annual": 55000, "max_annual": 75000, "currency": "GBP", "negotiable": true}',
    'Experienced full-stack developer with expertise in modern web technologies and cloud platforms.',
    'hybrid'
FROM users.profiles p WHERE p.email = 'talent1@example.com';

INSERT INTO users.talents (profile_id, skills, experience_years, education, availability_status, preferred_locations, salary_expectations, bio, remote_preference)
SELECT p.id,
    '{"technical_skills": ["Java", "Spring Boot", "Microservices", "Kubernetes", "Docker"], "soft_skills": ["Analytical Thinking", "Mentoring", "Project Management"], "databases": ["PostgreSQL", "MongoDB", "Redis"]}',
    8,
    '[{"degree": "MSc Software Engineering", "institution": "Technical University of Munich", "year": 2016}, {"certification": "Certified Kubernetes Administrator", "year": 2023}]',
    'available',
    '[{"city": "Berlin", "country": "DE", "remote": true}, {"city": "Munich", "country": "DE", "remote": false}]',
    '{"min_annual": 70000, "max_annual": 90000, "currency": "EUR", "negotiable": true}',
    'Senior backend engineer specializing in scalable microservices architecture and DevOps practices.',
    'remote'
FROM users.profiles p WHERE p.email = 'talent2@example.com';

INSERT INTO users.talents (profile_id, skills, experience_years, education, availability_status, preferred_locations, salary_expectations, bio, remote_preference)
SELECT p.id,
    '{"technical_skills": ["Python", "Machine Learning", "TensorFlow", "Pandas", "Scikit-learn"], "soft_skills": ["Research", "Data Visualization", "Statistical Analysis"], "tools": ["Jupyter", "Git", "AWS", "Tableau"]}',
    3,
    '[{"degree": "PhD Data Science", "institution": "University of Sydney", "year": 2021}]',
    'available',
    '[{"city": "Sydney", "country": "AU", "remote": true}, {"city": "Melbourne", "country": "AU", "remote": false}]',
    '{"min_annual": 85000, "max_annual": 110000, "currency": "AUD", "negotiable": false}',
    'Data scientist with strong background in machine learning and statistical modeling.',
    'flexible'
FROM users.profiles p WHERE p.email = 'talent3@example.com';

-- Insert sample job postings
INSERT INTO jobs.postings (employer_id, title, description, requirements, skills_required, experience_level, employment_type, location, remote_allowed, salary_range, benefits, status, application_deadline, positions_available)
SELECT e.id,
    'Senior Full Stack Developer',
    'We are seeking an experienced full stack developer to join our growing team. You will be responsible for developing and maintaining web applications using modern technologies including React, Node.js, and cloud platforms.',
    '["5+ years experience in web development", "Strong knowledge of JavaScript and modern frameworks", "Experience with cloud platforms (AWS/GCP/Azure)", "Excellent communication skills", "Ability to work in an agile environment"]',
    '["JavaScript", "React", "Node.js", "TypeScript", "SQL", "AWS", "Docker"]',
    'senior',
    'full-time',
    '{"city": "London", "country": "UK", "address": "123 Tech Street, London", "postal_code": "SW1A 1AA", "coordinates": {"lat": 51.5074, "lng": -0.1278}}',
    true,
    '{"min_annual": 60000, "max_annual": 80000, "currency": "GBP", "benefits_value": 8000}',
    '["Health Insurance", "Pension Scheme", "Flexible Working", "25 Days Holiday", "Learning Budget", "Equipment Allowance"]',
    'active',
    NOW() + INTERVAL '30 days',
    2
FROM users.employers e
JOIN users.profiles p ON e.profile_id = p.id
WHERE p.email = 'employer@example.com';

INSERT INTO jobs.postings (employer_id, title, description, requirements, skills_required, experience_level, employment_type, location, remote_allowed, salary_range, benefits, status, application_deadline, positions_available)
SELECT e.id,
    'DevOps Engineer',
    'Join our infrastructure team to build and maintain scalable, reliable systems. You will work with containerization, orchestration, and CI/CD pipelines to support our growing platform.',
    '["3+ years experience in DevOps or Infrastructure", "Strong knowledge of Kubernetes and Docker", "Experience with CI/CD pipelines", "Knowledge of monitoring and logging systems", "Experience with Infrastructure as Code"]',
    '["Kubernetes", "Docker", "Terraform", "Jenkins", "Python", "Bash", "AWS", "Prometheus", "Grafana"]',
    'mid',
    'full-time',
    '{"city": "London", "country": "UK", "address": "123 Tech Street, London", "postal_code": "SW1A 1AA", "coordinates": {"lat": 51.5074, "lng": -0.1278}}',
    true,
    '{"min_annual": 55000, "max_annual": 70000, "currency": "GBP", "benefits_value": 7000}',
    '["Health Insurance", "Pension Scheme", "Flexible Working", "25 Days Holiday", "Training Budget"]',
    'active',
    NOW() + INTERVAL '45 days',
    1
FROM users.employers e
JOIN users.profiles p ON e.profile_id = p.id
WHERE p.email = 'employer@example.com';

-- Create sample applications
INSERT INTO jobs.applications (job_id, talent_id, status, cover_letter, match_score)
SELECT j.id, t.id, 'applied', 
    'I am very interested in this position as it aligns perfectly with my background in full-stack development. My experience with React, Node.js, and AWS makes me a strong candidate for this role.',
    0.87
FROM jobs.postings j
JOIN users.employers e ON j.employer_id = e.id
JOIN users.profiles ep ON e.profile_id = ep.id
CROSS JOIN users.talents t
JOIN users.profiles tp ON t.profile_id = tp.id
WHERE j.title = 'Senior Full Stack Developer' 
  AND ep.email = 'employer@example.com'
  AND tp.email = 'talent1@example.com';

-- Insert matching preferences
INSERT INTO matching.matching_preferences (user_id, user_type, preferences, weight_skills, weight_experience, weight_location, weight_salary)
SELECT p.id, p.user_type,
    CASE 
        WHEN p.user_type = 'talent' THEN '{"job_types": ["full-time", "contract"], "remote_preference": "flexible", "company_size": ["medium", "large"]}'
        WHEN p.user_type = 'employer' THEN '{"candidate_levels": ["mid", "senior"], "visa_sponsorship": false, "remote_workers": true}'
        ELSE '{}'
    END,
    CASE WHEN p.user_type = 'talent' THEN 0.35 ELSE 0.45 END,
    CASE WHEN p.user_type = 'talent' THEN 0.25 ELSE 0.35 END,
    CASE WHEN p.user_type = 'talent' THEN 0.25 ELSE 0.10 END,
    CASE WHEN p.user_type = 'talent' THEN 0.15 ELSE 0.10 END
FROM users.profiles p
WHERE p.user_type IN ('talent', 'employer');

COMMENT ON TABLE users.profiles IS 'Core user profiles for all user types';
COMMENT ON TABLE users.talents IS 'Extended profile information for job seekers';
COMMENT ON TABLE users.employers IS 'Extended profile information for employers';
COMMENT ON TABLE jobs.postings IS 'Job postings created by employers';
COMMENT ON TABLE jobs.applications IS 'Job applications submitted by talents';
COMMENT ON TABLE matching.job_talent_scores IS 'AI-generated matching scores between jobs and talents';
COMMENT ON TABLE compliance.compliance_checks IS 'Compliance validation results';
COMMENT ON TABLE analytics.user_events IS 'User behavior tracking for analytics';

-- Create views for common queries
CREATE OR REPLACE VIEW v_active_jobs AS
SELECT 
    j.id,
    j.title,
    j.description,
    j.skills_required,
    j.experience_level,
    j.employment_type,
    j.location,
    j.remote_allowed,
    j.salary_range,
    j.created_at,
    j.application_deadline,
    e.company_name,
    e.company_size,
    e.industry,
    COUNT(a.id) as application_count
FROM jobs.postings j
JOIN users.employers e ON j.employer_id = e.id
LEFT JOIN jobs.applications a ON j.id = a.job_id
WHERE j.status = 'active' AND j.expires_at > NOW()
GROUP BY j.id, e.company_name, e.company_size, e.industry;

CREATE OR REPLACE VIEW v_talent_profiles AS
SELECT 
    p.id as profile_id,
    p.first_name,
    p.last_name,
    p.email,
    p.country_code,
    p.verification_status,
    t.id as talent_id,
    t.skills,
    t.experience_years,
    t.availability_status,
    t.preferred_locations,
    t.salary_expectations,
    t.remote_preference
FROM users.profiles p
JOIN users.talents t ON p.id = t.profile_id
WHERE p.is_active = true AND p.user_type = 'talent';

COMMENT ON VIEW v_active_jobs IS 'Active job postings with employer details and application counts';
COMMENT ON VIEW v_talent_profiles IS 'Active talent profiles with skills and preferences';