-- =============================================================================
-- Demo Candidates Data - International Talent Pool
-- 20+ Mock candidates from China, Indonesia, India, Vietnam, Philippines, SEA, Brazil
-- =============================================================================

-- Insert demo candidate users
INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active, email_verified, created_at) VALUES
-- Chinese Candidates
('550e8400-e29b-41d4-a716-446655440001', 'wei.zhang@email.com', '$2b$10$examplehash1', 'Wei', 'Zhang', 'talent', true, true, NOW() - INTERVAL '6 months'),
('550e8400-e29b-41d4-a716-446655440002', 'li.chen@email.com', '$2b$10$examplehash2', 'Li', 'Chen', 'talent', true, true, NOW() - INTERVAL '5 months'),
('550e8400-e29b-41d4-a716-446655440003', 'ming.wang@email.com', '$2b$10$examplehash3', 'Ming', 'Wang', 'talent', true, true, NOW() - INTERVAL '4 months'),

-- Indonesian Candidates
('550e8400-e29b-41d4-a716-446655440004', 'andi.pratama@email.com', '$2b$10$examplehash4', 'Andi', 'Pratama', 'talent', true, true, NOW() - INTERVAL '7 months'),
('550e8400-e29b-41d4-a716-446655440005', 'sari.dewi@email.com', '$2b$10$examplehash5', 'Sari', 'Dewi', 'talent', true, true, NOW() - INTERVAL '3 months'),
('550e8400-e29b-41d4-a716-446655440006', 'budi.santoso@email.com', '$2b$10$examplehash6', 'Budi', 'Santoso', 'talent', true, true, NOW() - INTERVAL '8 months'),

-- Indian Candidates
('550e8400-e29b-41d4-a716-446655440007', 'raj.patel@email.com', '$2b$10$examplehash7', 'Raj', 'Patel', 'talent', true, true, NOW() - INTERVAL '2 months'),
('550e8400-e29b-41d4-a716-446655440008', 'priya.sharma@email.com', '$2b$10$examplehash8', 'Priya', 'Sharma', 'talent', true, true, NOW() - INTERVAL '9 months'),
('550e8400-e29b-41d4-a716-446655440009', 'arjun.kumar@email.com', '$2b$10$examplehash9', 'Arjun', 'Kumar', 'talent', true, true, NOW() - INTERVAL '1 month'),

-- Vietnamese Candidates
('550e8400-e29b-41d4-a716-446655440010', 'nguyen.van.duc@email.com', '$2b$10$examplehash10', 'Duc', 'Nguyen Van', 'talent', true, true, NOW() - INTERVAL '6 months'),
('550e8400-e29b-41d4-a716-446655440011', 'tran.thi.mai@email.com', '$2b$10$examplehash11', 'Mai', 'Tran Thi', 'talent', true, true, NOW() - INTERVAL '4 months'),
('550e8400-e29b-41d4-a716-446655440012', 'le.minh.hoang@email.com', '$2b$10$examplehash12', 'Hoang', 'Le Minh', 'talent', true, true, NOW() - INTERVAL '7 months'),

-- Filipino Candidates
('550e8400-e29b-41d4-a716-446655440013', 'juan.cruz@email.com', '$2b$10$examplehash13', 'Juan', 'Cruz', 'talent', true, true, NOW() - INTERVAL '5 months'),
('550e8400-e29b-41d4-a716-446655440014', 'maria.santos@email.com', '$2b$10$examplehash14', 'Maria', 'Santos', 'talent', true, true, NOW() - INTERVAL '3 months'),
('550e8400-e29b-41d4-a716-446655440015', 'jose.reyes@email.com', '$2b$10$examplehash15', 'Jose', 'Reyes', 'talent', true, true, NOW() - INTERVAL '8 months'),

-- Thai Candidates
('550e8400-e29b-41d4-a716-446655440016', 'somchai.wong@email.com', '$2b$10$examplehash16', 'Somchai', 'Wong', 'talent', true, true, NOW() - INTERVAL '2 months'),
('550e8400-e29b-41d4-a716-446655440017', 'niran.siri@email.com', '$2b$10$examplehash17', 'Niran', 'Siri', 'talent', true, true, NOW() - INTERVAL '6 months'),

-- Malaysian Candidates
('550e8400-e29b-41d4-a716-446655440018', 'ahmad.hassan@email.com', '$2b$10$examplehash18', 'Ahmad', 'Hassan', 'talent', true, true, NOW() - INTERVAL '4 months'),
('550e8400-e29b-41d4-a716-446655440019', 'lim.wei.ming@email.com', '$2b$10$examplehash19', 'Wei Ming', 'Lim', 'talent', true, true, NOW() - INTERVAL '7 months'),

-- Singaporean Candidates
('550e8400-e29b-41d4-a716-446655440020', 'david.tan@email.com', '$2b$10$examplehash20', 'David', 'Tan', 'talent', true, true, NOW() - INTERVAL '3 months'),

-- Brazilian Candidates
('550e8400-e29b-41d4-a716-446655440021', 'carlos.silva@email.com', '$2b$10$examplehash21', 'Carlos', 'Silva', 'talent', true, true, NOW() - INTERVAL '5 months'),
('550e8400-e29b-41d4-a716-446655440022', 'ana.santos@email.com', '$2b$10$examplehash22', 'Ana', 'Santos', 'talent', true, true, NOW() - INTERVAL '2 months'),
('550e8400-e29b-41d4-a716-446655440023', 'pedro.oliveira@email.com', '$2b$10$examplehash23', 'Pedro', 'Oliveira', 'talent', true, true, NOW() - INTERVAL '6 months'),

-- Korean Candidates
('550e8400-e29b-41d4-a716-446655440024', 'kim.jihoon@email.com', '$2b$10$examplehash24', 'Jihoon', 'Kim', 'talent', true, true, NOW() - INTERVAL '4 months'),
('550e8400-e29b-41d4-a716-446655440025', 'park.soyeon@email.com', '$2b$10$examplehash25', 'Soyeon', 'Park', 'talent', true, true, NOW() - INTERVAL '8 months');

-- Insert candidate profiles
INSERT INTO user_profiles (id, user_id, phone, city, country, skills, experience_level, bio, created_at) VALUES
-- Chinese Candidates
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '+86-138-0013-8000', 'Shanghai', 'China', ARRAY['Python', 'Django', 'PostgreSQL', 'AWS', 'Machine Learning'], 'senior', 'Senior software engineer with 8 years of experience in fintech. Fluent in Mandarin, English, and basic Japanese. Looking for opportunities in Tokyo.', NOW() - INTERVAL '6 months'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '+86-139-0013-9000', 'Beijing', 'China', ARRAY['React', 'Node.js', 'TypeScript', 'MongoDB', 'GraphQL'], 'mid-level', 'Full-stack developer specializing in modern web technologies. 5 years experience building scalable applications. Studied Japanese for 2 years.', NOW() - INTERVAL '5 months'),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', '+86-137-0013-7000', 'Shenzhen', 'China', ARRAY['Java', 'Spring Boot', 'Microservices', 'Docker', 'Kubernetes'], 'senior', 'Backend architect with expertise in distributed systems. Led teams of 10+ developers. Passionate about clean code and system design.', NOW() - INTERVAL '4 months'),

-- Indonesian Candidates
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', '+62-812-3456-7890', 'Jakarta', 'Indonesia', ARRAY['JavaScript', 'Vue.js', 'Laravel', 'MySQL', 'Redis'], 'mid-level', 'Creative frontend developer with strong UX/UI sensibilities. 4 years building e-commerce platforms. Learning Japanese through online courses.', NOW() - INTERVAL '7 months'),
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', '+62-813-4567-8901', 'Bali', 'Indonesia', ARRAY['Python', 'Data Science', 'Pandas', 'Jupyter', 'TensorFlow'], 'mid-level', 'Data scientist with background in tourism analytics. 3 years experience in predictive modeling. Remote work specialist with excellent communication skills.', NOW() - INTERVAL '3 months'),
('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440006', '+62-814-5678-9012', 'Surabaya', 'Indonesia', ARRAY['PHP', 'CodeIgniter', 'WordPress', 'HTML5', 'CSS3'], 'senior', 'Senior web developer with 7 years experience in digital agencies. Expert in CMS development and optimization. Eager to work in Japan\'s tech industry.', NOW() - INTERVAL '8 months'),

-- Indian Candidates
('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440007', '+91-98765-43210', 'Bangalore', 'India', ARRAY['React Native', 'Flutter', 'iOS', 'Android', 'Firebase'], 'senior', 'Mobile app development expert with 6+ years experience. Published 20+ apps on app stores. Strong background in fintech and healthcare apps.', NOW() - INTERVAL '2 months'),
('660e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440008', '+91-98876-54321', 'Hyderabad', 'India', ARRAY['DevOps', 'AWS', 'Terraform', 'Jenkins', 'Monitoring'], 'senior', 'DevOps engineer with expertise in cloud infrastructure. 7 years automating deployments and managing scalable systems. AWS certified.', NOW() - INTERVAL '9 months'),
('660e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440009', '+91-99887-65432', 'Mumbai', 'India', ARRAY['AI/ML', 'Python', 'Computer Vision', 'NLP', 'PyTorch'], 'mid-level', 'AI researcher with focus on computer vision and NLP. 4 years in research and development. PhD in Computer Science. Published 10+ research papers.', NOW() - INTERVAL '1 month'),

-- Vietnamese Candidates
('660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440010', '+84-90-123-4567', 'Ho Chi Minh City', 'Vietnam', ARRAY['C++', 'Game Development', 'Unity', '3D Graphics', 'Optimization'], 'senior', 'Game developer with 8 years experience in mobile and PC games. Led development of 5 successful titles. Expert in performance optimization.', NOW() - INTERVAL '6 months'),
('660e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440011', '+84-91-234-5678', 'Hanoi', 'Vietnam', ARRAY['Quality Assurance', 'Automation Testing', 'Selenium', 'JIRA', 'API Testing'], 'mid-level', 'QA engineer specializing in test automation. 5 years ensuring software quality in agile environments. Detail-oriented with strong analytical skills.', NOW() - INTERVAL '4 months'),
('660e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440012', '+84-92-345-6789', 'Da Nang', 'Vietnam', ARRAY['Blockchain', 'Solidity', 'Web3', 'Smart Contracts', 'DeFi'], 'mid-level', 'Blockchain developer focused on DeFi protocols. 3 years building smart contracts and dApps. Strong understanding of cryptocurrency markets.', NOW() - INTERVAL '7 months'),

-- Filipino Candidates
('660e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440013', '+63-917-123-4567', 'Manila', 'Philippines', ARRAY['Customer Support', 'CRM', 'Zendesk', 'Communication', 'Problem Solving'], 'senior', 'Customer success manager with 6 years in tech companies. Expert in building customer relationships and reducing churn. Fluent English speaker.', NOW() - INTERVAL '5 months'),
('660e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440014', '+63-918-234-5678', 'Cebu', 'Philippines', ARRAY['Digital Marketing', 'SEO', 'Google Ads', 'Social Media', 'Analytics'], 'mid-level', 'Digital marketing specialist with 4 years driving growth for SaaS companies. Expert in performance marketing and conversion optimization.', NOW() - INTERVAL '3 months'),
('660e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440015', '+63-919-345-6789', 'Davao', 'Philippines', ARRAY['Virtual Assistant', 'Project Management', 'Slack', 'Trello', 'Administrative'], 'mid-level', 'Executive assistant with 5 years supporting C-level executives. Expert in calendar management, travel coordination, and administrative tasks.', NOW() - INTERVAL '8 months'),

-- Thai Candidates
('660e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440016', '+66-81-234-5678', 'Bangkok', 'Thailand', ARRAY['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'Prototyping', 'User Research'], 'senior', 'Senior UX designer with 7 years creating intuitive digital experiences. Led design teams and worked with international clients. Strong portfolio.', NOW() - INTERVAL '2 months'),
('660e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440017', '+66-82-345-6789', 'Chiang Mai', 'Thailand', ARRAY['Content Writing', 'Copywriting', 'SEO Writing', 'Translation', 'Localization'], 'mid-level', 'Content creator and translator with 4 years experience. Specializes in tech content and English-Thai-Japanese translation. Cultural adaptation expert.', NOW() - INTERVAL '6 months'),

-- Malaysian Candidates
('660e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440018', '+60-12-345-6789', 'Kuala Lumpur', 'Malaysia', ARRAY['Cybersecurity', 'Penetration Testing', 'CISSP', 'Network Security', 'Compliance'], 'senior', 'Cybersecurity specialist with 8 years protecting enterprise systems. CISSP certified with expertise in threat assessment and incident response.', NOW() - INTERVAL '4 months'),
('660e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440019', '+60-13-456-7890', 'Penang', 'Malaysia', ARRAY['Electronics Engineering', 'IoT', 'Embedded Systems', 'C Programming', 'Hardware'], 'senior', 'Electronics engineer with 9 years in IoT and embedded systems. Designed products for automotive and consumer electronics industries.', NOW() - INTERVAL '7 months'),

-- Singaporean Candidates
('660e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440020', '+65-9123-4567', 'Singapore', 'Singapore', ARRAY['Fintech', 'Trading Systems', 'Risk Management', 'Quantitative Analysis', 'Python'], 'senior', 'Quantitative analyst with 10+ years in financial services. Expert in algorithmic trading and risk management systems. CFA charterholder.', NOW() - INTERVAL '3 months'),

-- Brazilian Candidates
('660e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440021', '+55-11-99999-8888', 'São Paulo', 'Brazil', ARRAY['Ruby on Rails', 'PostgreSQL', 'Redis', 'API Development', 'TDD'], 'senior', 'Senior backend developer with 9 years building scalable web applications. Expert in Ruby ecosystem and agile methodologies. Portuguese and English fluent.', NOW() - INTERVAL '5 months'),
('660e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440022', '+55-21-88888-7777', 'Rio de Janeiro', 'Brazil', ARRAY['Product Management', 'Agile', 'User Stories', 'Roadmapping', 'Analytics'], 'senior', 'Product manager with 6 years launching successful digital products. Strong background in user research and data-driven decision making.', NOW() - INTERVAL '2 months'),
('660e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440023', '+55-31-77777-6666', 'Belo Horizonte', 'Brazil', ARRAY['Sales Engineering', 'Technical Consulting', 'CRM', 'Solution Architecture', 'Presentations'], 'senior', 'Sales engineer with 7 years helping enterprise customers adopt complex technologies. Expert in technical presentations and solution design.', NOW() - INTERVAL '6 months'),

-- Korean Candidates
('660e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440024', '+82-10-1234-5678', 'Seoul', 'South Korea', ARRAY['Android Development', 'Kotlin', 'Java', 'Architecture', 'Performance'], 'senior', 'Senior Android developer with 8 years building consumer apps. Expert in app architecture and performance optimization. Worked for major Korean tech companies.', NOW() - INTERVAL '4 months'),
('660e8400-e29b-41d4-a716-446655440025', '550e8400-e29b-41d4-a716-446655440025', '+82-10-2345-6789', 'Busan', 'South Korea', ARRAY['Supply Chain', 'Logistics', 'SAP', 'Process Optimization', 'Analytics'], 'senior', 'Supply chain specialist with 10 years optimizing global logistics operations. Expert in SAP systems and process improvement methodologies.', NOW() - INTERVAL '8 months');

-- Additional skills for candidates
INSERT INTO user_skills (id, user_id, skill_id, proficiency_level, years_of_experience, created_at) VALUES
-- Wei Zhang (Chinese - Python Expert)
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM skills WHERE name = 'Python'), 'Expert', 8, NOW()),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM skills WHERE name = 'Machine Learning'), 'Advanced', 5, NOW()),

-- Li Chen (Chinese - React Expert)
('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', (SELECT id FROM skills WHERE name = 'React'), 'Expert', 5, NOW()),
('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', (SELECT id FROM skills WHERE name = 'JavaScript'), 'Expert', 6, NOW()),

-- Raj Patel (Indian - Mobile Expert)
('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440007', (SELECT id FROM skills WHERE name = 'React'), 'Advanced', 4, NOW()),
('770e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440007', (SELECT id FROM skills WHERE name = 'JavaScript'), 'Expert', 6, NOW()),

-- Priya Sharma (Indian - DevOps Expert)
('770e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440008', (SELECT id FROM skills WHERE name = 'AWS'), 'Expert', 7, NOW()),
('770e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440008', (SELECT id FROM skills WHERE name = 'Docker'), 'Expert', 6, NOW()),

-- Carlos Silva (Brazilian - Ruby Expert)
('770e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440021', (SELECT id FROM skills WHERE name = 'PostgreSQL'), 'Expert', 8, NOW()),
('770e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440021', (SELECT id FROM skills WHERE name = 'Project Management'), 'Advanced', 5, NOW());

-- Add some notifications for demo purposes
INSERT INTO notifications (id, user_id, type, title, message, data, is_read, created_at) VALUES
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'job_match', '新しい求人マッチが見つかりました', 'あなたのスキルにマッチする求人が3件見つかりました。東京のテクノロジー企業での機会です。', '{"match_count": 3, "location": "Tokyo"}', false, NOW() - INTERVAL '2 hours'),
('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440007', 'application_status', 'Application Update', 'Your application for Senior Mobile Developer at TechCorp Japan has been reviewed. The hiring team is interested in scheduling an interview.', '{"job_title": "Senior Mobile Developer", "company": "TechCorp Japan", "status": "interview_scheduled"}', false, NOW() - INTERVAL '1 day'),
('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440013', 'profile_view', 'Profile Viewed', 'A hiring manager from a leading e-commerce company viewed your profile. Make sure your portfolio is up to date!', '{"viewer_type": "hiring_manager", "industry": "e-commerce"}', false, NOW() - INTERVAL '3 hours'),
('880e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440021', 'skill_recommendation', 'Skill Recommendation', 'Based on market trends, learning Kubernetes could increase your job matches by 40%. Consider adding it to your skill set.', '{"recommended_skill": "Kubernetes", "potential_increase": 40}', false, NOW() - INTERVAL '6 hours');

-- Add audit logs for demo activity
INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, details, ip_address, user_agent, created_at) VALUES
('990e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'profile_update', 'user_profile', '660e8400-e29b-41d4-a716-446655440001', '{"field": "skills", "added": ["Machine Learning"], "removed": []}', '192.168.1.100', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', NOW() - INTERVAL '1 day'),
('990e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440007', 'job_application', 'job', 'job-uuid-placeholder', '{"application_type": "direct", "cover_letter_length": 250}', '203.0.113.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NOW() - INTERVAL '2 days'),
('990e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440013', 'search_job', 'job_search', NULL, '{"keywords": ["customer support", "remote"], "location": "Tokyo", "results_count": 15}', '198.51.100.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)', NOW() - INTERVAL '3 hours'),
('990e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440021', 'login', 'authentication', NULL, '{"login_method": "email", "successful": true}', '172.16.0.1', 'Mozilla/5.0 (X11; Linux x86_64)', NOW() - INTERVAL '30 minutes');

-- Create indexes for demo performance
CREATE INDEX IF NOT EXISTS idx_demo_user_profiles_country ON user_profiles(country);
CREATE INDEX IF NOT EXISTS idx_demo_user_profiles_skills ON user_profiles USING gin(skills);
CREATE INDEX IF NOT EXISTS idx_demo_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_demo_audit_logs_user_action ON audit_logs(user_id, action, created_at);

-- Add comments for documentation
COMMENT ON TABLE user_profiles IS 'Extended demo data with international talent profiles from Asia and Brazil';
COMMENT ON COLUMN user_profiles.skills IS 'Array of technical and soft skills for AI matching algorithms';
COMMENT ON COLUMN user_profiles.country IS 'Country of origin for visa and compliance requirements';

-- Update statistics for better query performance
ANALYZE users;
ANALYZE user_profiles;
ANALYZE user_skills;
ANALYZE notifications;
ANALYZE audit_logs;