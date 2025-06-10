-- =============================================================================
-- Demo Companies Data - Japanese Corporate Clients
-- 10+ Mock companies across major Japanese industries
-- =============================================================================

-- Insert demo company data representing key Japanese industries
INSERT INTO companies (id, name, description, industry, size, website, logo_url, headquarters_location, founded_year, is_verified, created_at) VALUES

-- Technology Companies
('440e8400-e29b-41d4-a716-446655440001', 
'東京テックソリューションズ株式会社', 
'Leading software development company specializing in enterprise solutions and AI integration. We help traditional Japanese businesses modernize their technology infrastructure and adopt cutting-edge digital solutions.',
'Technology', 
'500-1000', 
'https://tokyo-tech-solutions.co.jp', 
'https://storage.iworkz.com/logos/tokyo-tech-solutions.png', 
'東京都渋谷区', 
2010, 
true, 
NOW() - INTERVAL '2 years'),

('440e8400-e29b-41d4-a716-446655440002', 
'イノベーションラボ株式会社', 
'Startup incubator and technology consulting firm focused on fintech, blockchain, and IoT solutions. We bridge the gap between traditional Japanese corporations and emerging technologies.',
'Technology', 
'50-100', 
'https://innovation-lab.jp', 
'https://storage.iworkz.com/logos/innovation-lab.png', 
'東京都六本木', 
2018, 
true, 
NOW() - INTERVAL '1 year'),

-- Manufacturing Companies
('440e8400-e29b-41d4-a716-446655440003', 
'日本精密工業株式会社', 
'Precision manufacturing company producing high-quality components for automotive and electronics industries. We are embracing Industry 4.0 and need talented engineers to support our digital transformation.',
'Manufacturing', 
'1000-5000', 
'https://japan-precision.com', 
'https://storage.iworkz.com/logos/japan-precision.png', 
'愛知県名古屋市', 
1985, 
true, 
NOW() - INTERVAL '3 years'),

('440e8400-e29b-41d4-a716-446655440004', 
'グリーンエナジー製造株式会社', 
'Sustainable energy solutions manufacturer specializing in solar panels and battery technology. As Japan transitions to renewable energy, we are expanding rapidly and seeking international talent.',
'Manufacturing', 
'200-500', 
'https://green-energy-mfg.jp', 
'https://storage.iworkz.com/logos/green-energy.png', 
'大阪府大阪市', 
2015, 
true, 
NOW() - INTERVAL '6 months'),

-- Financial Services
('440e8400-e29b-41d4-a716-446655440005', 
'デジタル金融サービス株式会社', 
'Digital-first financial services company offering innovative banking and investment solutions. We are revolutionizing Japan\'s traditional banking sector with mobile-first approaches and AI-powered services.',
'Financial Services', 
'100-200', 
'https://digital-finance.co.jp', 
'https://storage.iworkz.com/logos/digital-finance.png', 
'東京都丸の内', 
2019, 
true, 
NOW() - INTERVAL '8 months'),

('440e8400-e29b-41d4-a716-446655440006', 
'フィンテックイノベーション株式会社', 
'Fintech startup developing blockchain-based payment solutions and cryptocurrency trading platforms. We are seeking talented developers to help us build the future of digital payments in Japan.',
'Financial Services', 
'10-50', 
'https://fintech-innovation.jp', 
'https://storage.iworkz.com/logos/fintech-innovation.png', 
'東京都新宿区', 
2021, 
true, 
NOW() - INTERVAL '4 months'),

-- Healthcare & Pharmaceuticals
('440e8400-e29b-41d4-a716-446655440007', 
'ライフサイエンス研究所株式会社', 
'Biotechnology research company developing innovative medical devices and pharmaceutical solutions. We focus on aging society challenges and are expanding our R&D team with international expertise.',
'Healthcare', 
'300-500', 
'https://lifescience-lab.co.jp', 
'https://storage.iworkz.com/logos/lifescience-lab.png', 
'神奈川県横浜市', 
2005, 
true, 
NOW() - INTERVAL '1.5 years'),

('440e8400-e29b-41d4-a716-446655440008', 
'デジタルヘルス株式会社', 
'Digital health platform providing telemedicine and health monitoring solutions. We are at the forefront of Japan\'s digital health transformation, especially post-COVID-19.',
'Healthcare', 
'50-100', 
'https://digital-health.jp', 
'https://storage.iworkz.com/logos/digital-health.png', 
'東京都品川区', 
2020, 
true, 
NOW() - INTERVAL '10 months'),

-- E-commerce & Retail
('440e8400-e29b-41d4-a716-446655440009', 
'ネクストジェンリテール株式会社', 
'Next-generation retail company combining online and offline experiences. We operate omnichannel platforms and are seeking international talent to help us compete with global e-commerce giants.',
'E-commerce', 
'200-500', 
'https://nextgen-retail.jp', 
'https://storage.iworkz.com/logos/nextgen-retail.png', 
'東京都池袋', 
2016, 
true, 
NOW() - INTERVAL '7 months'),

-- Gaming & Entertainment
('440e8400-e29b-41d4-a716-446655440010', 
'クリエイティブゲームス株式会社', 
'Mobile game development studio creating innovative games for global markets. We specialize in RPGs and social games, combining Japanese creativity with international appeal.',
'Gaming', 
'100-200', 
'https://creative-games.jp', 
'https://storage.iworkz.com/logos/creative-games.png', 
'東京都秋葉原', 
2014, 
true, 
NOW() - INTERVAL '1.2 years'),

-- AI/Research Labs
('440e8400-e29b-41d4-a716-446655440011', 
'人工知能研究センター株式会社', 
'AI research center developing cutting-edge machine learning solutions for various industries. We collaborate with universities and government agencies to advance Japan\'s AI capabilities.',
'AI/Research', 
'50-100', 
'https://ai-research-center.jp', 
'https://storage.iworkz.com/logos/ai-research.png', 
'東京都本郷', 
2017, 
true, 
NOW() - INTERVAL '9 months'),

-- Government Agency (Special Case)
('440e8400-e29b-41d4-a716-446655440012', 
'デジタル庁技術支援部', 
'Digital Agency technical support division responsible for modernizing government IT infrastructure. We are implementing digital government initiatives and need skilled international contractors.',
'Government', 
'1000+', 
'https://digital.go.jp', 
'https://storage.iworkz.com/logos/digital-agency.png', 
'東京都霞が関', 
2021, 
true, 
NOW() - INTERVAL '5 months'),

-- SME - Local Business
('440e8400-e29b-41d4-a716-446655440013', 
'地域イノベーション合同会社', 
'Regional innovation consultancy helping small and medium enterprises adopt digital technologies. We work with local businesses across Japan to implement modern solutions.',
'Consulting', 
'10-50', 
'https://regional-innovation.co.jp', 
'https://storage.iworkz.com/logos/regional-innovation.png', 
'福岡県福岡市', 
2019, 
true, 
NOW() - INTERVAL '3 months'),

-- Vendor Augmentation Service
('440e8400-e29b-41d4-a716-446655440014', 
'テックスタッフィング株式会社', 
'Technology staffing and vendor augmentation services providing skilled IT professionals to enterprises. We specialize in placing international talent in Japanese companies.',
'Staffing', 
'100-200', 
'https://tech-staffing.jp', 
'https://storage.iworkz.com/logos/tech-staffing.png', 
'東京都恵比寿', 
2012, 
true, 
NOW() - INTERVAL '2.5 years');

-- Create company users (HR managers, recruiters)
INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active, email_verified, created_at) VALUES
-- Tokyo Tech Solutions
('551e8400-e29b-41d4-a716-446655440001', 'hr@tokyo-tech-solutions.co.jp', '$2b$10$examplehash101', '田中', '美咲', 'employer', true, true, NOW() - INTERVAL '2 years'),
('551e8400-e29b-41d4-a716-446655440002', 'recruiter@tokyo-tech-solutions.co.jp', '$2b$10$examplehash102', '佐藤', '健太', 'employer', true, true, NOW() - INTERVAL '1.8 years'),

-- Innovation Lab
('551e8400-e29b-41d4-a716-446655440003', 'talent@innovation-lab.jp', '$2b$10$examplehash103', '山田', '花子', 'employer', true, true, NOW() - INTERVAL '1 year'),

-- Japan Precision
('551e8400-e29b-41d4-a716-446655440004', 'hiring@japan-precision.com', '$2b$10$examplehash104', '鈴木', '一郎', 'employer', true, true, NOW() - INTERVAL '3 years'),

-- Digital Finance
('551e8400-e29b-41d4-a716-446655440005', 'careers@digital-finance.co.jp', '$2b$10$examplehash105', '高橋', '恵子', 'employer', true, true, NOW() - INTERVAL '8 months'),

-- Life Science Lab
('551e8400-e29b-41d4-a716-446655440006', 'research-hr@lifescience-lab.co.jp', '$2b$10$examplehash106', '伊藤', '博士', 'employer', true, true, NOW() - INTERVAL '1.5 years'),

-- Creative Games
('551e8400-e29b-41d4-a716-446655440007', 'jobs@creative-games.jp', '$2b$10$examplehash107', '中村', '由美', 'employer', true, true, NOW() - INTERVAL '1.2 years'),

-- AI Research Center
('551e8400-e29b-41d4-a716-446655440008', 'recruitment@ai-research-center.jp', '$2b$10$examplehash108', '小林', '智也', 'employer', true, true, NOW() - INTERVAL '9 months'),

-- Digital Agency
('551e8400-e29b-41d4-a716-446655440009', 'contract@digital.go.jp', '$2b$10$examplehash109', '政府', '太郎', 'employer', true, true, NOW() - INTERVAL '5 months'),

-- Tech Staffing
('551e8400-e29b-41d4-a716-446655440010', 'placement@tech-staffing.jp', '$2b$10$examplehash110', '松本', '真理', 'employer', true, true, NOW() - INTERVAL '2.5 years');

-- Sample job postings from these companies
INSERT INTO jobs (id, company_id, title, description, requirements, location, type, salary_min, salary_max, currency, is_remote, status, posted_by, application_deadline, created_at) VALUES

-- Tokyo Tech Solutions Jobs
('330e8400-e29b-41d4-a716-446655440001', 
'440e8400-e29b-41d4-a716-446655440001',
'Senior Full Stack Developer (外国人歓迎)',
'We are seeking an experienced Full Stack Developer to join our growing team. You will work on enterprise web applications using modern technologies. Visa sponsorship available for qualified candidates.

Key Responsibilities:
- Develop and maintain web applications using React and Node.js
- Collaborate with cross-functional teams in an agile environment
- Mentor junior developers and contribute to technical decisions
- Work closely with Japanese clients (basic Japanese communication required)

Work Environment:
- International team with English as working language
- Flexible working hours and remote work options
- Professional development budget and learning opportunities',
'Required Skills:
- 5+ years of web development experience
- Proficient in JavaScript, React, Node.js
- Experience with PostgreSQL and cloud platforms (AWS/Azure)
- Basic Japanese communication skills (JLPT N3 or higher preferred)
- University degree or equivalent experience

Preferred Skills:
- Experience with microservices architecture
- Knowledge of DevOps practices
- Previous experience working in Japan or with Japanese companies',
'東京都渋谷区',
'full-time',
6000000,
10000000,
'JPY',
true,
'active',
'551e8400-e29b-41d4-a716-446655440001',
DATE '2024-12-31',
NOW() - INTERVAL '2 weeks'),

('330e8400-e29b-41d4-a716-446655440002',
'440e8400-e29b-41d4-a716-446655440001',
'AI/ML Engineer (Machine Learning Specialist)',
'Join our AI team to develop cutting-edge machine learning solutions for enterprise clients. You will work on projects involving natural language processing, computer vision, and predictive analytics.

Responsibilities:
- Design and implement ML models for business applications
- Work with data scientists to deploy models into production
- Optimize model performance and scalability
- Research and evaluate new ML technologies and frameworks',
'Required:
- Master\'s degree in Computer Science, AI, or related field
- 3+ years of experience in machine learning
- Proficient in Python, TensorFlow/PyTorch, scikit-learn
- Experience with cloud ML platforms (AWS SageMaker, Azure ML)
- Strong mathematical background in statistics and linear algebra

Preferred:
- PhD in Machine Learning or related field
- Experience with MLOps and model deployment
- Japanese language skills (any level welcome)',
'東京都渋谷区',
'full-time',
7000000,
12000000,
'JPY',
true,
'active',
'551e8400-e29b-41d4-a716-446655440002',
DATE '2024-11-30',
NOW() - INTERVAL '1 week'),

-- Innovation Lab Jobs
('330e8400-e29b-41d4-a716-446655440003',
'440e8400-e29b-41d4-a716-446655440002',
'Blockchain Developer (Fintech Startup)',
'Exciting opportunity to join a fast-growing fintech startup developing blockchain solutions. You will work on DeFi protocols, smart contracts, and cryptocurrency trading platforms.

What you\'ll do:
- Develop smart contracts using Solidity
- Build DeFi protocols and trading algorithms
- Integrate with various blockchain networks
- Collaborate with product team on new features',
'Must have:
- 2+ years of blockchain development experience
- Proficient in Solidity, Web3.js, Ethereum ecosystem
- Understanding of DeFi protocols and cryptocurrency markets
- Experience with testing frameworks (Hardhat, Truffle)

Nice to have:
- Experience with Layer 2 solutions
- Knowledge of financial markets
- Startup experience
- Japanese language skills',
'東京都六本木',
'full-time',
5000000,
9000000,
'JPY',
false,
'active',
'551e8400-e29b-41d4-a716-446655440003',
DATE '2024-12-15',
NOW() - INTERVAL '5 days'),

-- Japan Precision Manufacturing
('330e8400-e29b-41d4-a716-446655440004',
'440e8400-e29b-41d4-a716-446655440003',
'IoT Systems Engineer (Industry 4.0)',
'Lead our digital transformation initiative by developing IoT solutions for smart manufacturing. You will work on connecting factory equipment and implementing predictive maintenance systems.

Key Projects:
- Design IoT architecture for factory automation
- Implement sensor networks and data collection systems
- Develop predictive maintenance algorithms
- Create dashboards for real-time factory monitoring',
'Required Qualifications:
- Bachelor\'s degree in Engineering or Computer Science
- 4+ years of experience in IoT or embedded systems
- Proficient in C/C++, Python, and hardware protocols (Modbus, OPC-UA)
- Experience with time-series databases and industrial networks

Preferred:
- Manufacturing or automotive industry experience
- Knowledge of lean manufacturing principles
- Basic Japanese for communication with factory staff
- Experience with edge computing platforms',
'愛知県名古屋市',
'full-time',
5500000,
8500000,
'JPY',
false,
'active',
'551e8400-e29b-41d4-a716-446655440004',
DATE '2024-12-20',
NOW() - INTERVAL '3 days'),

-- Digital Finance
('330e8400-e29b-41d4-a716-446655440005',
'440e8400-e29b-41d4-a716-446655440005',
'Mobile App Developer (iOS/Android)',
'Develop next-generation mobile banking applications that will revolutionize how Japanese consumers interact with financial services. Join our product team building innovative fintech solutions.

Responsibilities:
- Build native mobile applications for iOS and Android
- Implement secure payment and authentication systems
- Optimize app performance and user experience
- Collaborate with UX designers and backend engineers',
'Requirements:
- 3+ years of mobile app development experience
- Proficient in Swift (iOS) and Kotlin/Java (Android)
- Experience with mobile security and payment systems
- Knowledge of financial regulations and compliance
- Strong understanding of mobile UI/UX principles

Bonus Points:
- Experience with React Native or Flutter
- Financial services industry background
- Conversational Japanese ability
- Published apps in App Store/Google Play',
'東京都丸の内',
'full-time',
6500000,
11000000,
'JPY',
true,
'active',
'551e8400-e29b-41d4-a716-446655440005',
DATE '2024-11-25',
NOW() - INTERVAL '1 week'),

-- Creative Games
('330e8400-e29b-41d4-a716-446655440006',
'440e8400-e29b-41d4-a716-446655440010',
'Game Developer (Unity/C#)',
'Create amazing mobile games that will be enjoyed by millions of players worldwide. We are developing RPG and social games combining Japanese storytelling with global gameplay mechanics.

What you\'ll create:
- Develop game features using Unity and C#
- Implement game mechanics, UI, and visual effects
- Optimize games for mobile platforms
- Collaborate with artists and game designers',
'Required Skills:
- 2+ years of Unity game development experience
- Proficient in C# and Unity engine
- Experience with mobile game optimization
- Understanding of game design principles
- Portfolio of published games

Preferred:
- Experience with multiplayer games or social features
- Knowledge of Japanese gaming culture
- Experience with gacha/monetization systems
- Basic Japanese language skills',
'東京都秋葉原',
'full-time',
4500000,
7500000,
'JPY',
true,
'active',
'551e8400-e29b-41d4-a716-446655440007',
DATE '2024-12-10',
NOW() - INTERVAL '4 days'),

-- AI Research Center
('330e8400-e29b-41d4-a716-446655440007',
'440e8400-e29b-41d4-a716-446655440011',
'Research Scientist - Computer Vision',
'Join our research team working on cutting-edge computer vision applications for autonomous vehicles and medical imaging. This position offers the opportunity to publish research and work on real-world AI applications.

Research Areas:
- Object detection and image segmentation
- Medical image analysis and diagnosis
- Autonomous vehicle perception systems
- 3D computer vision and depth estimation',
'Qualifications:
- PhD in Computer Vision, Machine Learning, or related field
- Strong publication record in top-tier conferences (CVPR, ICCV, ECCV)
- Expertise in deep learning frameworks (PyTorch, TensorFlow)
- Experience with computer vision libraries (OpenCV, PIL)
- Proficient in Python and C++

Preferred:
- Industry experience in computer vision applications
- Experience with edge deployment and optimization
- Collaborative research experience with academic institutions
- Any level of Japanese language skills welcome',
'東京都本郷',
'full-time',
8000000,
15000000,
'JPY',
true,
'active',
'551e8400-e29b-41d4-a716-446655440008',
DATE '2024-12-31',
NOW() - INTERVAL '6 days'),

-- Digital Agency (Government)
('330e8400-e29b-41d4-a716-446655440008',
'440e8400-e29b-41d4-a716-446655440012',
'Senior System Architect (Contract)',
'Government digital transformation project seeking experienced system architect. You will design and implement large-scale systems for public services, contributing to Japan\'s digital government initiative.

Project Scope:
- Design microservices architecture for government platforms
- Ensure security and compliance with government standards
- Lead technical decision-making for multi-year projects
- Mentor government IT staff and contractors',
'Required:
- 8+ years of enterprise system architecture experience
- Expertise in cloud platforms (AWS, Azure, GCP)
- Experience with microservices and distributed systems
- Strong security and compliance knowledge
- Excellent communication skills for stakeholder management

Contract Details:
- 6-12 month renewable contract
- Security clearance process required
- Must be available for on-site work in Tokyo
- Competitive daily rate based on experience',
'東京都霞が関',
'contract',
10000000,
18000000,
'JPY',
false,
'active',
'551e8400-e29b-41d4-a716-446655440009',
DATE '2024-11-15',
NOW() - INTERVAL '2 days'),

-- Tech Staffing (Vendor Augmentation)
('330e8400-e29b-41d4-a716-446655440009',
'440e8400-e29b-41d4-a716-446655440014',
'DevOps Engineer (Client Placement)',
'Multiple openings for DevOps engineers to be placed at our enterprise clients across Tokyo. You will work on-site with client teams to implement modern DevOps practices and cloud infrastructure.

Client Industries:
- Financial services and banking
- E-commerce and retail
- Manufacturing and logistics
- Government and public sector

Typical Projects:
- Migrate legacy systems to cloud platforms
- Implement CI/CD pipelines and automation
- Set up monitoring and alerting systems
- Train client teams on DevOps practices',
'Core Requirements:
- 3+ years of DevOps experience
- Proficient with AWS/Azure and Kubernetes
- Experience with CI/CD tools (Jenkins, GitLab CI, GitHub Actions)
- Infrastructure as Code (Terraform, CloudFormation)
- Monitoring tools (Prometheus, Grafana, ELK stack)

Soft Skills:
- Excellent communication and training abilities
- Adaptability to different client environments
- Professional appearance and demeanor
- Basic Japanese preferred but not required',
'東京都恵比寿',
'full-time',
5000000,
9000000,
'JPY',
false,
'active',
'551e8400-e29b-41d4-a716-446655440010',
DATE '2024-12-25',
NOW() - INTERVAL '1 week');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry);
CREATE INDEX IF NOT EXISTS idx_companies_size ON companies(size);
CREATE INDEX IF NOT EXISTS idx_companies_location ON companies(headquarters_location);
CREATE INDEX IF NOT EXISTS idx_companies_verified ON companies(is_verified);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_remote ON jobs(is_remote);
CREATE INDEX IF NOT EXISTS idx_jobs_salary_range ON jobs(salary_min, salary_max);

-- Add comments for documentation
COMMENT ON TABLE companies IS 'Demo companies representing major Japanese industries that rely on foreign workers';
COMMENT ON COLUMN companies.industry IS 'Industry sectors: Technology, Manufacturing, Financial Services, Healthcare, Gaming, AI/Research, Government, Consulting, Staffing';
COMMENT ON COLUMN companies.size IS 'Company size categories for better matching and filtering';
COMMENT ON TABLE jobs IS 'Sample job postings from Japanese companies seeking international talent';

-- Update table statistics
ANALYZE companies;
ANALYZE jobs;