-- Sample data for iWORKZ Platform Demo
-- This provides realistic job postings, users, and related data for demonstration

\c iworkz_dev;

-- Insert sample user profiles
INSERT INTO users.profiles (id, email, password_hash, first_name, last_name, user_type, phone, country_code, language_preference, verification_status, is_active, terms_accepted_at, privacy_accepted_at) VALUES
-- Talents
('550e8400-e29b-41d4-a716-446655440001', 'john.doe@email.com', '$2b$12$LQv3c1yqBwMFxGDHPTz5.uNFQoYH3y6JpP9Zx8Kj5m7n9p0q2r3s4t', 'John', 'Doe', 'talent', '+1234567890', 'US', 'en', 'verified', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'sarah.wilson@email.com', '$2b$12$LQv3c1yqBwMFxGDHPTz5.uNFQoYH3y6JpP9Zx8Kj5m7n9p0q2r3s4t', 'Sarah', 'Wilson', 'talent', '+44123456789', 'GB', 'en', 'verified', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'maria.garcia@email.com', '$2b$12$LQv3c1yqBwMFxGDHPTz5.uNFQoYH3y6JpP9Zx8Kj5m7n9p0q2r3s4t', 'Maria', 'Garcia', 'talent', '+34123456789', 'ES', 'es', 'verified', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'alex.chen@email.com', '$2b$12$LQv3c1yqBwMFxGDHPTz5.uNFQoYH3y6JpP9Zx8Kj5m7n9p0q2r3s4t', 'Alex', 'Chen', 'talent', '+65123456789', 'SG', 'en', 'verified', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'emma.mueller@email.com', '$2b$12$LQv3c1yqBwMFxGDHPTz5.uNFQoYH3y6JpP9Zx8Kj5m7n9p0q2r3s4t', 'Emma', 'Mueller', 'talent', '+49123456789', 'DE', 'de', 'verified', true, NOW(), NOW()),

-- Employers
('550e8400-e29b-41d4-a716-446655440010', 'hiring@techcorp.com', '$2b$12$LQv3c1yqBwMFxGDHPTz5.uNFQoYH3y6JpP9Zx8Kj5m7n9p0q2r3s4t', 'Jane', 'Smith', 'employer', '+1234567891', 'US', 'en', 'verified', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440011', 'recruiter@innovate.co.uk', '$2b$12$LQv3c1yqBwMFxGDHPTz5.uNFQoYH3y6JpP9Zx8Kj5m7n9p0q2r3s4t', 'David', 'Thompson', 'employer', '+44987654321', 'GB', 'en', 'verified', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440012', 'talent@globaltech.de', '$2b$12$LQv3c1yqBwMFxGDHPTz5.uNFQoYH3y6JpP9Zx8Kj5m7n9p0q2r3s4t', 'Klaus', 'Weber', 'employer', '+49987654321', 'DE', 'de', 'verified', true, NOW(), NOW());

-- Insert talent profiles
INSERT INTO users.talents (id, profile_id, skills, experience_years, education, certifications, availability_status, preferred_locations, salary_expectations, bio, remote_preference) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 
 '{"technical": ["Python", "React", "Node.js", "PostgreSQL", "AWS", "Docker"], "soft": ["Leadership", "Communication", "Problem Solving"]}',
 5, 
 '[{"degree": "BS Computer Science", "institution": "MIT", "year": 2019}]',
 '[{"name": "AWS Certified Developer", "issuer": "Amazon", "year": 2022}]',
 'available',
 '["San Francisco", "Remote", "New York"]',
 '{"min": 120000, "max": 160000, "currency": "USD"}',
 'Full-stack developer with 5 years of experience building scalable web applications.',
 'remote'),

('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002',
 '{"technical": ["JavaScript", "TypeScript", "Vue.js", "MySQL", "GCP"], "soft": ["Team Collaboration", "Critical Thinking"]}',
 3,
 '[{"degree": "BS Software Engineering", "institution": "University of Cambridge", "year": 2021}]',
 '[{"name": "Google Cloud Professional", "issuer": "Google", "year": 2023}]',
 'available',
 '["London", "Remote", "Manchester"]',
 '{"min": 50000, "max": 70000, "currency": "GBP"}',
 'Frontend specialist with expertise in modern JavaScript frameworks.',
 'hybrid'),

('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003',
 '{"technical": ["Java", "Spring", "Microservices", "Kubernetes", "Jenkins"], "soft": ["Project Management", "Mentoring"]}',
 7,
 '[{"degree": "MS Computer Science", "institution": "Universidad Politécnica de Madrid", "year": 2017}]',
 '[{"name": "PMP", "issuer": "PMI", "year": 2021}]',
 'available',
 '["Madrid", "Barcelona", "Remote"]',
 '{"min": 45000, "max": 60000, "currency": "EUR"}',
 'Senior backend engineer with expertise in enterprise Java applications.',
 'flexible'),

('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004',
 '{"technical": ["Python", "Machine Learning", "TensorFlow", "Pandas", "Jupyter"], "soft": ["Analytical Thinking", "Data Visualization"]}',
 4,
 '[{"degree": "PhD Data Science", "institution": "National University of Singapore", "year": 2020}]',
 '[{"name": "Google Cloud ML Engineer", "issuer": "Google", "year": 2022}]',
 'available',
 '["Singapore", "Remote", "Hong Kong"]',
 '{"min": 80000, "max": 120000, "currency": "SGD"}',
 'Data scientist specializing in machine learning and predictive analytics.',
 'remote'),

('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005',
 '{"technical": ["C++", "Rust", "System Design", "Linux", "Performance Optimization"], "soft": ["Innovation", "Technical Writing"]}',
 6,
 '[{"degree": "MS Computer Engineering", "institution": "Technical University of Munich", "year": 2018}]',
 '[]',
 'available',
 '["Berlin", "Munich", "Remote"]',
 '{"min": 65000, "max": 85000, "currency": "EUR"}',
 'Systems engineer focused on high-performance computing and optimization.',
 'onsite');

-- Insert employer profiles
INSERT INTO users.employers (id, profile_id, company_name, company_size, industry, company_description, website_url, headquarters_location, employee_count_range, company_type) VALUES
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440010',
 'TechCorp Solutions', 'large', 'Technology', 'Leading provider of enterprise software solutions.',
 'https://techcorp.com', '{"city": "San Francisco", "country": "US"}', '1000-5000', 'private'),

('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440011',
 'Innovate UK Ltd', 'medium', 'Technology', 'Innovative fintech startup revolutionizing payments.',
 'https://innovate.co.uk', '{"city": "London", "country": "UK"}', '100-500', 'startup'),

('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440012',
 'GlobalTech GmbH', 'large', 'Manufacturing', 'Industrial automation and IoT solutions provider.',
 'https://globaltech.de', '{"city": "Munich", "country": "DE"}', '5000+', 'public');

-- Insert job postings
INSERT INTO jobs.postings (id, employer_id, title, description, requirements, skills_required, experience_level, employment_type, location, remote_allowed, salary_range, benefits, status, application_deadline, start_date, positions_available) VALUES
('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001',
 'Senior Full Stack Developer',
 'We are seeking a talented Senior Full Stack Developer to join our growing engineering team. You will be responsible for developing scalable web applications using modern technologies.',
 '["5+ years of full-stack development experience", "Strong knowledge of React and Node.js", "Experience with cloud platforms (AWS/GCP)", "Familiarity with microservices architecture"]',
 '["React", "Node.js", "Python", "PostgreSQL", "AWS", "Docker", "Kubernetes"]',
 'senior', 'full-time',
 '{"city": "San Francisco", "state": "CA", "country": "US", "remote_allowed": true}',
 true,
 '{"min": 140000, "max": 180000, "currency": "USD"}',
 '["Health insurance", "401k matching", "Flexible PTO", "Remote work options"]',
 'active',
 '2024-03-15',
 '2024-02-01',
 2),

('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002',
 'Frontend Developer (React)',
 'Join our fintech startup as a Frontend Developer. You''ll work on building beautiful, responsive user interfaces for our payment platform.',
 '["3+ years of frontend development experience", "Expert knowledge of React and TypeScript", "Experience with modern CSS frameworks", "Understanding of fintech regulations"]',
 '["React", "TypeScript", "CSS3", "JavaScript", "Redux", "Jest"]',
 'mid', 'full-time',
 '{"city": "London", "country": "UK", "remote_allowed": true}',
 true,
 '{"min": 55000, "max": 75000, "currency": "GBP"}',
 '["Private health insurance", "Pension scheme", "Flexible working hours", "Stock options"]',
 'active',
 '2024-02-28',
 '2024-02-15',
 1),

('880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003',
 'DevOps Engineer',
 'We are looking for a DevOps Engineer to help us scale our infrastructure and improve our deployment processes.',
 '["4+ years of DevOps experience", "Strong knowledge of Kubernetes and Docker", "Experience with CI/CD pipelines", "Familiarity with monitoring tools"]',
 '["Kubernetes", "Docker", "Jenkins", "Terraform", "AWS", "Monitoring"]',
 'mid', 'full-time',
 '{"city": "Munich", "country": "DE", "remote_allowed": false}',
 false,
 '{"min": 70000, "max": 90000, "currency": "EUR"}',
 '["Health insurance", "Pension plan", "Professional development budget", "Company car"]',
 'active',
 '2024-03-01',
 '2024-02-20',
 1),

('880e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440001',
 'Data Scientist',
 'Join our AI team to build machine learning models that power our recommendation systems and business intelligence platform.',
 '["PhD or MS in Data Science, Statistics, or related field", "5+ years of ML experience", "Proficiency in Python and R", "Experience with big data technologies"]',
 '["Python", "Machine Learning", "TensorFlow", "PyTorch", "SQL", "Spark", "Jupyter"]',
 'senior', 'full-time',
 '{"city": "San Francisco", "state": "CA", "country": "US", "remote_allowed": true}',
 true,
 '{"min": 160000, "max": 220000, "currency": "USD"}',
 '["Health insurance", "401k matching", "Flexible PTO", "Research budget"]',
 'active',
 '2024-03-20',
 '2024-03-01',
 1),

('880e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440002',
 'Backend Developer (Node.js)',
 'We need a Backend Developer to build robust APIs and microservices for our fintech platform.',
 '["3+ years of backend development experience", "Strong knowledge of Node.js and Express", "Experience with databases (PostgreSQL/MongoDB)", "Understanding of API design principles"]',
 '["Node.js", "Express", "PostgreSQL", "MongoDB", "Redis", "Docker"]',
 'mid', 'full-time',
 '{"city": "London", "country": "UK", "remote_allowed": true}',
 true,
 '{"min": 50000, "max": 70000, "currency": "GBP"}',
 '["Private health insurance", "Pension scheme", "Flexible working hours", "Learning budget"]',
 'active',
 '2024-02-25',
 '2024-02-10',
 2),

('880e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440003',
 'Systems Engineer',
 'Looking for a Systems Engineer to optimize our manufacturing systems and implement IoT solutions.',
 '["5+ years of systems engineering experience", "Knowledge of C++ and system programming", "Experience with Linux and embedded systems", "Understanding of IoT protocols"]',
 '["C++", "Linux", "System Programming", "IoT", "Embedded Systems", "Performance Optimization"]',
 'senior', 'full-time',
 '{"city": "Munich", "country": "DE", "remote_allowed": false}',
 false,
 '{"min": 75000, "max": 95000, "currency": "EUR"}',
 '["Health insurance", "Pension plan", "Professional development", "Relocation assistance"]',
 'active',
 '2024-03-10',
 '2024-02-25',
 1);

-- Insert some job applications
INSERT INTO jobs.applications (id, job_id, talent_id, status, cover_letter, match_score, ai_assessment, applied_at) VALUES
('990e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001',
 'applied', 'I am excited to apply for the Senior Full Stack Developer position. My 5 years of experience with React and Node.js make me a perfect fit.',
 0.92, '{"overall_fit": "excellent", "skill_match": 0.95, "experience_match": 0.89}',
 '2024-01-20 10:30:00'),

('990e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002',
 'shortlisted', 'I would love to contribute to your fintech platform with my frontend expertise.',
 0.88, '{"overall_fit": "very_good", "skill_match": 0.91, "experience_match": 0.85}',
 '2024-01-18 14:15:00'),

('990e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440004',
 'interviewing', 'My PhD in Data Science and ML experience align perfectly with your AI team needs.',
 0.94, '{"overall_fit": "excellent", "skill_match": 0.96, "experience_match": 0.92}',
 '2024-01-15 09:00:00');

-- Insert matching scores
INSERT INTO matching.job_talent_scores (id, job_id, talent_id, overall_score, skills_score, experience_score, location_score, availability_score, salary_score, ai_explanation, confidence_level) VALUES
('aa0e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001',
 0.92, 0.95, 0.89, 0.88, 1.0, 0.95,
 'Excellent match with strong technical skills and relevant experience. Perfect availability and salary alignment.',
 0.93),

('aa0e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002',
 0.88, 0.91, 0.85, 0.92, 1.0, 0.87,
 'Very good match for frontend role. Strong React skills and good cultural fit.',
 0.89),

('aa0e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440004',
 0.94, 0.96, 0.92, 0.90, 1.0, 0.88,
 'Outstanding match for data science role. PhD qualification and strong ML background.',
 0.95);

-- Insert compliance checks
INSERT INTO compliance.compliance_checks (id, entity_type, entity_id, jurisdiction, check_type, status, results, issues_found, recommendations, confidence_score, checked_by) VALUES
('bb0e8400-e29b-41d4-a716-446655440001', 'job', '880e8400-e29b-41d4-a716-446655440001', 'US', 'salary_compliance',
 'compliant', '{"min_wage_check": "passed", "equal_pay_check": "passed"}', '[]', '[]', 0.96, 'ai'),

('bb0e8400-e29b-41d4-a716-446655440002', 'job', '880e8400-e29b-41d4-a716-446655440002', 'UK', 'working_time_directive',
 'compliant', '{"max_hours_check": "passed", "break_requirements": "passed"}', '[]', '[]', 0.94, 'ai'),

('bb0e8400-e29b-41d4-a716-446655440003', 'job', '880e8400-e29b-41d4-a716-446655440003', 'DE', 'employment_law',
 'compliant', '{"contract_terms": "passed", "data_protection": "passed"}', '[]', '[]', 0.92, 'ai');

-- Insert analytics events
INSERT INTO analytics.user_events (id, user_id, session_id, event_type, event_category, event_data, ip_address, created_at) VALUES
('cc0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'sess_001', 'job_view', 'job_activity',
 '{"job_id": "880e8400-e29b-41d4-a716-446655440001", "view_duration": 45}', '192.168.1.100', '2024-01-20 10:00:00'),

('cc0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'sess_002', 'application_submitted', 'application',
 '{"job_id": "880e8400-e29b-41d4-a716-446655440002", "application_time": 15}', '192.168.1.101', '2024-01-18 14:15:00'),

('cc0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440010', 'sess_003', 'job_posted', 'employer_activity',
 '{"job_id": "880e8400-e29b-41d4-a716-446655440001", "posting_time": 8}', '192.168.1.102', '2024-01-15 09:30:00');

-- Insert job metrics
INSERT INTO analytics.job_metrics (id, job_id, metric_date, views_count, applications_count, matches_generated, shortlisted_count, avg_match_score) VALUES
('dd0e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', '2024-01-20', 45, 8, 25, 3, 0.78),
('dd0e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', '2024-01-20', 32, 5, 18, 2, 0.82),
('dd0e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440004', '2024-01-20', 28, 4, 12, 2, 0.85);

-- Insert system configuration
INSERT INTO system_config (id, config_key, config_value, description, is_public) VALUES
('ee0e8400-e29b-41d4-a716-446655440001', 'platform_stats', 
 '{"total_jobs": 150, "total_talents": 1250, "successful_matches": 89, "countries_supported": 15}',
 'Public platform statistics', true),

('ee0e8400-e29b-41d4-a716-446655440002', 'matching_algorithm_version', 
 '{"version": "2.1.0", "last_updated": "2024-01-15", "improvements": "Enhanced skill matching accuracy"}',
 'Current matching algorithm version', false),

('ee0e8400-e29b-41d4-a716-446655440003', 'compliance_rules_version',
 '{"uk_rules": "v1.2", "de_rules": "v1.1", "us_rules": "v1.3", "last_sync": "2024-01-10"}',
 'Compliance rules versions by jurisdiction', false);

-- Create some additional demo users for testing
INSERT INTO users.profiles (id, email, password_hash, first_name, last_name, user_type, verification_status, is_active, terms_accepted_at, privacy_accepted_at) VALUES
-- Demo accounts with simple passwords for testing (password: "demo123!")
('550e8400-e29b-41d4-a716-446655440099', 'demo.talent@iworkz.dev', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Demo', 'Talent', 'talent', 'verified', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440098', 'demo.employer@iworkz.dev', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Demo', 'Employer', 'employer', 'verified', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440097', 'admin@iworkz.dev', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', 'admin', 'verified', true, NOW(), NOW());

-- Demo talent profile
INSERT INTO users.talents (id, profile_id, skills, experience_years, bio, remote_preference) VALUES
('660e8400-e29b-41d4-a716-446655440099', '550e8400-e29b-41d4-a716-446655440099',
 '{"technical": ["JavaScript", "React", "Node.js", "MongoDB"], "soft": ["Communication", "Teamwork"]}',
 2, 'Demo talent account for testing the platform.', 'remote');

-- Demo employer profile
INSERT INTO users.employers (id, profile_id, company_name, company_size, industry, company_description) VALUES
('770e8400-e29b-41d4-a716-446655440099', '550e8400-e29b-41d4-a716-446655440098',
 'Demo Company Inc', 'small', 'Technology', 'Demo company account for testing the platform.');

COMMENT ON TABLE users.profiles IS 'Sample data includes 5 talents, 3 employers, and 3 demo accounts';
COMMENT ON TABLE jobs.postings IS 'Sample data includes 6 realistic job postings across different roles and locations';
COMMENT ON TABLE analytics.user_events IS 'Sample events for analytics dashboard demonstration';
COMMENT ON TABLE system_config IS 'Platform configuration and demo statistics';