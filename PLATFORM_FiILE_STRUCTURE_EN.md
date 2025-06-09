# iWORKZ Platform File Structure - Enterprise Architecture

## Root Directory Overview
```
iw_pl_dev_v02/
├── 📁 0_ENV_SETUP/                    # Development Environment Configuration
├── 📁 1_DOCUMENTATION/                # Technical Documentation Suite
├── 📁 2_API/                          # API Interfaces & Contracts
├── 📁 2_SERVICES/                     # Microservices Architecture (19 Services)
├── 📁 3_AI_AGENTS/                    # AI Agent Configuration & Training
├── 📁 4_DEPLOYMENT/                   # Infrastructure & Deployment
├── 📁 4_MISC/                         # Miscellaneous Resources
├── 📁 5_SECURITY/                     # Security & Compliance Framework
├── 📁 6_ROADMAP/                      # Business Strategy & Funding
├── 📁 IP_DOCS/                        # Intellectual Property Documentation
├── 📁 scripts/                        # Automation & Utility Scripts
├── 📁 tests/                          # Testing Framework
├── 📁 .claude/                        # Claude AI Integration
├── 📁 .github/                        # CI/CD Workflows
├── 📄 .env / .env.example / .env.local # Environment Configuration
├── 📄 .gitignore                      # Git Ignore Rules
├── 📄 docker-compose.yml              # Container Orchestration
├── 📄 DEPLOYMENT_SETUP.md             # Deployment Instructions
├── 📄 EXECUTION_PLAN.md               # Project Execution Plan
├── 📄 iworkz_business_plan.pdf        # Business Plan Document
├── 📄 MOCK_DEMO_GUIDE.md              # Demo Configuration
├── 📄 PROJECT_STATUS_AND_NEXT_STEPS.md # Project Status
├── 📄 README.md                       # Main Documentation
├── 📄 START_PLATFORM.md               # Platform Startup Guide
└── 📄 test-setup.sh                   # Test Environment Setup
```

---

## 📁 0_ENV_SETUP - Development Environment
**Purpose**: Standardized development environment setup across team members
```
0_ENV_SETUP/
├── 📄 DOCKER_SETUP_EN.md              # Docker Installation (English)
├── 📄 DOCKER_SETUP_JA.md              # Docker Installation (Japanese)
├── 📄 GENERAL_ENV_GUIDE_EN.md         # General Environment Setup (English)
├── 📄 GENERAL_ENV_GUIDE_JA.md         # General Environment Setup (Japanese)
├── 📄 GIT_SETUP_EN.md                 # Git Configuration (English)
├── 📄 GIT_SETUP_JA.md                 # Git Configuration (Japanese)
├── 📄 POWERSHELL_SETUP_EN.md          # PowerShell Setup (English)
├── 📄 POWERSHELL_SETUP_JA.md          # PowerShell Setup (Japanese)
├── 📄 VS_CODE_SETUP_EN.md             # VS Code Configuration (English)
├── 📄 VS_CODE_SETUP_JA.md             # VS Code Configuration (Japanese)
├── 📄 WSL_SETUP_EN.md                 # WSL Setup (English)
└── 📄 WSL_SETUP_JA.md                 # WSL Setup (Japanese)
```

---

## 📁 1_DOCUMENTATION - Technical Documentation Suite
**Purpose**: Comprehensive technical documentation in multiple languages
```
1_DOCUMENTATION/
├── 📄 API_DOCUMENTATION_EN.md         # API Specifications (English)
├── 📄 API_DOCUMENTATION_JA.md         # API Specifications (Japanese)
├── 📄 ARCHITECTURE_EN.md              # System Architecture (English)
├── 📄 ARCHITECTURE_JA.md              # System Architecture (Japanese)
├── 📄 ARCHITECTURE_OVERVIEW_EN.md     # Architecture Overview (English)
├── 📄 ARCHITECTURE_OVERVIEW_JA.md     # Architecture Overview (Japanese)
├── 📄 BUSINESS_CONTEXT_EN.md          # Business Context (English)
├── 📄 BUSINESS_CONTEXT_JA.md          # Business Context (Japanese)
├── 📄 BUSINESS_CONTEXT.md             # General Business Context
├── 📄 CLOUD_MIGRATION_GUIDE_EN.md     # Cloud Migration (English)
├── 📄 CLOUD_MIGRATION_GUIDE_JA.md     # Cloud Migration (Japanese)
├── 📄 COMMERCIAL_LAUNCH_GUIDE_EN.md   # Commercial Launch (English)
├── 📄 COMMERCIAL_LAUNCH_GUIDE_JA.md   # Commercial Launch (Japanese)
├── 📄 CONTAINER_GUIDE_EN.md           # Containerization (English)
├── 📄 CONTAINER_GUIDE_JA.md           # Containerization (Japanese)
├── 📄 DEMO_MODE_GUIDE_EN.md           # Demo Mode (English)
├── 📄 DEMO_MODE_GUIDE_JA.md           # Demo Mode (Japanese)
├── 📄 DEPLOYMENT_EN.md                # Deployment Guide (English)
├── 📄 DEPLOYMENT_JA.md                # Deployment Guide (Japanese)
├── 📄 GIT_WORKFLOW_EN.md              # Git Workflow (English)
├── 📄 GIT_WORKFLOW_JA.md              # Git Workflow (Japanese)
├── 📄 ONBOARDING_GUIDE_EN.md          # Team Onboarding (English)
├── 📄 ONBOARDING_GUIDE_JA.md          # Team Onboarding (Japanese)
├── 📄 PROJECT_OVERVIEW_EN.md          # Project Overview (English)
├── 📄 PROJECT_OVERVIEW_JA.md          # Project Overview (Japanese)
├── 📄 README_MASTER_EN.md             # Master README (English)
└── 📄 README_MASTER_JA.md             # Master README (Japanese)
```

---

## 📁 2_SERVICES - Microservices Architecture (19 Services)
**Purpose**: Core platform services implementing business logic

### 🎛️ **admin-dashboard** - Administrative Interface
```
admin-dashboard/
├── 📁 src/app/                        # Next.js Application
│   ├── 📁 api/health/                 # Health Check Endpoints
│   ├── 📄 globals.css                 # Global Styles
│   ├── 📄 layout.tsx                  # App Layout
│   └── 📄 page.tsx                    # Main Page
├── 📄 .env.example                    # Environment Template
├── 📄 Dockerfile                      # Container Definition
├── 📄 next.config.js                  # Next.js Configuration
├── 📄 package.json                    # Dependencies
├── 📄 postcss.config.js               # PostCSS Configuration
├── 📄 README_EN.md / README_JA.md     # Documentation
├── 📄 tailwind.config.js              # Tailwind CSS Config
└── 📄 tsconfig.json                   # TypeScript Config
```

### 🤖 **ai-agent** - AI/ML Core Engine
```
ai-agent/
├── 📁 data/                           # Training Data & Models
├── 📁 src/
│   ├── 📁 config/                     # Database & Redis Config
│   ├── 📁 models/                     # Data Models
│   ├── 📁 prompts/                    # AI Prompt Templates
│   ├── 📁 routers/                    # API Endpoints
│   │   ├── 📄 compliance.py           # Compliance APIs
│   │   ├── 📄 documents.py            # Document Processing
│   │   ├── 📄 matching.py             # Talent Matching
│   │   └── 📄 matching_mock.py        # Mock Testing
│   ├── 📁 schemas/                    # Data Validation
│   ├── 📁 services/                   # Core AI Services
│   │   ├── 📄 ai_manager.py           # Main AI Manager
│   │   └── 📄 mock_ai_manager.py      # Testing Manager
│   ├── 📁 utils/                      # Utilities
│   └── 📄 main.py                     # Service Entry Point
├── 📁 tests/                          # Test Suite
├── 📄 Dockerfile                      # Container Definition
├── 📄 requirements.txt                # Python Dependencies
└── 📄 vercel.json                     # Vercel Deployment
```

### 📊 **analytics-service** - Data Analytics Engine
```
analytics-service/
├── 📁 src/
│   ├── 📄 healthcheck.py              # Health Monitoring
│   └── 📄 main.py                     # Analytics Engine
├── 📄 .env.example                    # Environment Template
├── 📄 Dockerfile                      # Container Definition
├── 📄 requirements.txt                # Python Dependencies
└── 📄 README_EN.md / README_JA.md     # Documentation
```

### 🔧 **backend-api** - Core Backend Services
```
backend-api/
├── 📁 src/
│   ├── 📁 config/                     # Database & Redis Config
│   ├── 📁 controllers/                # Business Logic Controllers
│   ├── 📁 middleware/                 # Express Middleware
│   │   ├── 📄 auth.js                 # Authentication
│   │   ├── 📄 errorHandler.js         # Error Handling
│   │   └── 📄 requestLogger.js        # Request Logging
│   ├── 📁 models/                     # Database Models
│   ├── 📁 routes/                     # API Routes
│   │   ├── 📄 analytics.js            # Analytics Endpoints
│   │   ├── 📄 auth.js                 # Auth Endpoints
│   │   ├── 📄 compliance.js           # Compliance APIs
│   │   ├── 📄 jobs.js                 # Job Management
│   │   ├── 📄 matching.js             # Matching APIs
│   │   ├── 📄 upload.js               # File Upload
│   │   └── 📄 users.js                # User Management
│   ├── 📁 services/                   # Business Services
│   ├── 📁 utils/                      # Utilities
│   └── 📄 server.js                   # Express Server
├── 📁 tests/                          # Test Suite
├── 📄 .dockerignore                   # Docker Ignore
├── 📄 Dockerfile                      # Container Definition
├── 📄 package.json                    # Node.js Dependencies
└── 📄 vercel.json                     # Vercel Deployment
```

### ⚖️ **compliance-engine** - Regulatory Compliance
```
compliance-engine/
├── 📁 src/
│   ├── 📁 services/                   # Compliance Services
│   │   ├── 📄 compliance_service.py   # Main Compliance Logic
│   │   ├── 📄 jurisdiction_service.py # Regional Compliance
│   │   └── 📄 rules_engine.py         # Business Rules Engine
│   ├── 📄 healthcheck.py              # Health Monitoring
│   ├── 📄 main.py                     # Service Entry Point
│   └── 📄 models.py                   # Data Models
├── 📄 .env.example                    # Environment Template
├── 📄 Dockerfile                      # Container Definition
├── 📄 requirements.txt                # Python Dependencies
└── 📄 README_EN.md / README_JA.md     # Documentation
```

### 🔐 **credential-engine** - Blockchain Verification
```
credential-engine/
├── 📁 contracts/
│   └── 📄 CredentialRegistry.sol      # Smart Contract
├── 📁 migrations/
│   └── 📄 001_create_credentials_table.sql # Database Schema
├── 📁 scripts/
│   └── 📄 deploy.ts                   # Deployment Scripts
├── 📁 src/
│   ├── 📁 config/                     # Blockchain, DB, IPFS Config
│   │   ├── 📄 blockchain.ts           # Blockchain Client
│   │   ├── 📄 database.ts             # Database Config
│   │   └── 📄 ipfs.ts                 # IPFS Client
│   ├── 📁 services/
│   │   └── 📄 credentialService.ts    # Credential Logic
│   ├── 📁 types/                      # TypeScript Types
│   ├── 📁 utils/                      # Utilities
│   └── 📄 server.ts                   # Service Entry Point
├── 📄 .env.example                    # Environment Template
├── 📄 Dockerfile                      # Container Definition
├── 📄 hardhat.config.ts               # Hardhat Configuration
├── 📄 package.json                    # Node.js Dependencies
└── 📄 tsconfig.json                   # TypeScript Config
```

### 🗄️ **db-postgres** - Database Layer
```
db-postgres/
├── 📁 init/                           # Database Initialization
│   ├── 📄 01_create_database.sql      # Database Creation
│   ├── 📄 02_create_tables.sql        # Table Schemas
│   ├── 📄 03_create_indexes.sql       # Index Optimization
│   ├── 📄 04_seed_data.sql            # Base Data
│   ├── 📄 05_sample_data.sql          # Sample Data
│   ├── 📄 06_demo_candidates_data.sql # Demo Candidates
│   └── 📄 07_demo_companies_data.sql  # Demo Companies
├── 📄 Dockerfile                      # PostgreSQL Container
└── 📄 README_EN.md / README_JA.md     # Documentation
```

### 🔗 **integration-hub** - Third-party Integrations
```
integration-hub/
├── 📁 src/
│   ├── 📄 healthcheck.js              # Health Monitoring
│   └── 📄 server.js                   # Integration Server
├── 📄 .env.example                    # Environment Template
├── 📄 Dockerfile                      # Container Definition
├── 📄 package.json                    # Node.js Dependencies
└── 📄 README_EN.md / README_JA.md     # Documentation
```

### 💼 **investors-website** - Investor Portal
```
investors-website/
├── 📁 src/
│   ├── 📁 components/
│   │   └── 📄 Layout.tsx              # Layout Component
│   └── 📁 pages/
│       └── 📄 index.tsx               # Home Page
├── 📄 Dockerfile                      # Container Definition
├── 📄 next.config.js                  # Next.js Configuration
├── 📄 package.json                    # Dependencies
└── 📄 README_EN.md / README_JA.md     # Documentation
```

### 🎯 **matching-engine** - Talent Matching Service
```
matching-engine/
├── 📁 src/
│   ├── 📁 services/                   # Matching Services
│   ├── 📁 utils/                      # Utilities
│   ├── 📄 healthcheck.js              # Health Monitoring
│   └── 📄 server.js                   # Matching Server
├── 📄 .env.example                    # Environment Template
├── 📄 Dockerfile                      # Container Definition
├── 📄 package.json                    # Node.js Dependencies
└── 📄 README_EN.md / README_JA.md     # Documentation
```

### 📱 **mobile-app** - React Native Application
```
mobile-app/
├── 📁 src/
│   ├── 📁 navigation/                 # App Navigation
│   │   ├── 📄 AppNavigator.tsx        # Main Navigation
│   │   └── 📄 AuthNavigator.tsx       # Auth Navigation
│   ├── 📁 screens/                    # Screen Components
│   │   ├── 📁 applications/           # Job Applications
│   │   ├── 📁 auth/                   # Authentication
│   │   ├── 📁 jobs/                   # Job Listings
│   │   ├── 📁 messages/               # Messaging
│   │   ├── 📁 notifications/          # Notifications
│   │   ├── 📁 profile/                # User Profile
│   │   ├── 📁 search/                 # Search Functionality
│   │   ├── 📁 settings/               # App Settings
│   │   └── 📄 HomeScreen.tsx          # Home Screen
│   ├── 📁 store/                      # Redux Store
│   │   ├── 📁 slices/                 # Redux Slices
│   │   └── 📄 index.ts                # Store Configuration
│   └── 📄 App.tsx                     # Main App Component
├── 📄 package.json                    # React Native Dependencies
└── 📄 README_EN.md / README_JA.md     # Documentation
```

### 📊 **monitoring** - Observability Stack
```
monitoring/
├── 📁 alertmanager/
│   └── 📄 alertmanager.yml            # Alert Configuration
├── 📁 grafana/provisioning/
│   ├── 📁 dashboards/
│   │   └── 📄 dashboard-config.yml    # Dashboard Config
│   └── 📁 datasources/
│       └── 📄 datasources.yml         # Data Sources
├── 📁 loki/
│   └── 📄 loki.yml                    # Log Aggregation
├── 📁 prometheus/
│   ├── 📁 rules/
│   │   └── 📄 iworkz-alerts.yml       # Alert Rules
│   └── 📄 prometheus.yml              # Metrics Collection
├── 📁 promtail/
│   └── 📄 promtail.yml                # Log Forwarding
└── 📄 docker-compose.monitoring.yml   # Monitoring Stack
```

### 📧 **notification-service** - Multi-channel Notifications
```
notification-service/
├── 📁 src/
│   ├── 📁 config/                     # Database & Queue Config
│   ├── 📁 services/                   # Notification Services
│   │   ├── 📄 emailService.ts         # Email Notifications
│   │   ├── 📄 pushService.ts          # Push Notifications
│   │   ├── 📄 smsService.ts           # SMS Notifications
│   │   └── 📄 templateService.ts      # Message Templates
│   ├── 📁 types/                      # TypeScript Types
│   ├── 📁 utils/                      # Utilities
│   └── 📄 server.ts                   # Service Entry Point
├── 📄 .env.example                    # Environment Template
├── 📄 Dockerfile                      # Container Definition
├── 📄 package.json                    # Node.js Dependencies
└── 📄 tsconfig.json                   # TypeScript Config
```

### 🔍 **search** - Search & Discovery Service
```
search/
├── 📁 src/
│   ├── 📁 config/
│   │   └── 📄 elasticsearch.ts        # Elasticsearch Config
│   ├── 📁 services/
│   │   └── 📄 searchService.ts        # Search Logic
│   ├── 📁 types/                      # TypeScript Types
│   ├── 📁 utils/                      # Utilities
│   └── 📄 server.ts                   # Service Entry Point
├── 📄 docker-compose.elasticsearch.yml # Elasticsearch Setup
├── 📄 Dockerfile                      # Container Definition
├── 📄 package.json                    # Node.js Dependencies
└── 📄 README_EN.md / README_JA.md     # Documentation
```

### 🎤 **voice-assistant** - Voice Interface
```
voice-assistant/
├── 📁 backend/                        # Python Backend
│   ├── 📄 main.py                     # Main Service
│   ├── 📄 voice_input.py              # Voice Input Processing
│   └── 📄 voice_output.py             # Voice Output Generation
├── 📁 frontend/                       # JavaScript Frontend
│   ├── 📁 src/
│   │   ├── 📄 main.js                 # Main Logic
│   │   └── 📄 renderer.js             # UI Renderer
│   ├── 📄 index.html                  # HTML Interface
│   └── 📄 package.json                # Frontend Dependencies
├── 📄 Dockerfile                      # Container Definition
├── 📄 prompt_config.json              # AI Prompt Configuration
├── 📄 requirements.txt                # Python Dependencies
├── 📄 run_all.ps1                     # Windows Startup Script
└── 📄 run_all.sh                      # Unix Startup Script
```

### 🌐 **web-frontend** - Main Web Application
```
web-frontend/
├── 📁 public/                         # Static Assets
├── 📁 src/
│   ├── 📁 app/                        # Next.js App Directory
│   │   ├── 📄 globals.css             # Global Styles
│   │   ├── 📄 layout.tsx              # App Layout
│   │   └── 📄 page.tsx                # Main Page
│   ├── 📁 components/                 # React Components
│   │   ├── 📁 ui/                     # UI Components
│   │   └── 📄 providers.tsx           # Context Providers
│   ├── 📁 hooks/                      # Custom React Hooks
│   ├── 📁 lib/                        # Utility Libraries
│   │   ├── 📄 api.ts                  # API Integration
│   │   └── 📄 utils.ts                # Utility Functions
│   ├── 📁 store/                      # State Management
│   │   └── 📄 authStore.ts            # Authentication Store
│   ├── 📁 styles/                     # Styling
│   ├── 📁 types/                      # TypeScript Types
│   └── 📁 utils/                      # Frontend Utilities
├── 📁 tests/                          # Test Suite
├── 📄 Dockerfile                      # Container Definition
├── 📄 next.config.js                  # Next.js Configuration
├── 📄 package.json                    # Node.js Dependencies
├── 📄 postcss.config.js               # PostCSS Configuration
├── 📄 tailwind.config.js              # Tailwind CSS Config
├── 📄 tsconfig.json                   # TypeScript Config
└── 📄 vercel.json                     # Vercel Deployment
```

### 📦 **redis** - Caching Layer
```
redis/
├── 📄 Dockerfile                      # Redis Container
├── 📄 redis.conf                      # Redis Configuration
└── 📄 README_EN.md / README_JA.md     # Documentation
```

---

## 📁 3_AI_AGENTS - AI Configuration & Training
**Purpose**: AI agent management, training data, and prompt engineering
```
3_AI_AGENTS/
├── 📁 evaluation/                     # AI Model Evaluation
├── 📁 models/                         # AI Model Storage
├── 📁 prompts/                        # Prompt Templates
├── 📁 training/                       # Training Data & Scripts
├── 📄 AGENT_PROMPTS_EN.md             # Agent Prompts (English)
├── 📄 AGENT_PROMPTS_JA.md             # Agent Prompts (Japanese)
├── 📄 API_KEYS_GUIDE_EN.md            # API Keys Management (English)
├── 📄 API_KEYS_GUIDE_JA.md            # API Keys Management (Japanese)
├── 📄 CHATBOT_INTEGRATION_EN.md       # Chatbot Integration (English)
├── 📄 CHATBOT_INTEGRATION_JA.md       # Chatbot Integration (Japanese)
├── 📄 COMPLIANCE_AI_PROMPTS_EN.md     # Compliance AI (English)
├── 📄 COMPLIANCE_AI_PROMPTS_JA.md     # Compliance AI (Japanese)
├── 📄 PROMPT_ENGINEERING_GUIDE_EN.md  # Prompt Engineering (English)
├── 📄 PROMPT_ENGINEERING_GUIDE_JA.md  # Prompt Engineering (Japanese)
├── 📄 SAMPLE_AGENT_CODE_EN.md         # Sample Code (English)
└── 📄 SAMPLE_AGENT_CODE_JA.md         # Sample Code (Japanese)
```

---

## 📁 4_DEPLOYMENT - Infrastructure & Deployment
**Purpose**: Production deployment, infrastructure as code, and environment management
```
4_DEPLOYMENT/
├── 📁 docker/                         # Docker Configurations
├── 📁 kubernetes/                     # Kubernetes Manifests
│   ├── 📁 deployments/                # Service Deployments
│   │   ├── 📄 ai-agent.yaml           # AI Agent Deployment
│   │   ├── 📄 backend-api.yaml        # Backend API Deployment
│   │   ├── 📄 postgres.yaml           # PostgreSQL Deployment
│   │   ├── 📄 redis.yaml              # Redis Deployment
│   │   └── 📄 web-frontend.yaml       # Frontend Deployment
│   ├── 📁 monitoring/                 # Monitoring Deployments
│   │   ├── 📄 alertmanager.yaml       # Alertmanager
│   │   ├── 📄 grafana.yaml            # Grafana
│   │   ├── 📄 loki.yaml               # Loki
│   │   └── 📄 prometheus.yaml         # Prometheus
│   ├── 📄 configmaps.yaml             # Configuration Maps
│   ├── 📄 deploy-k8s.sh               # Deployment Script
│   ├── 📄 ingress.yaml                # Ingress Controller
│   ├── 📄 namespaces.yaml             # Kubernetes Namespaces
│   └── 📄 secrets.yaml                # Secret Management
├── 📁 monitoring/                     # Monitoring Configuration
├── 📁 scripts/                        # Deployment Scripts
├── 📁 staging/                        # Staging Environment
│   ├── 📁 nginx/                      # Nginx Configuration
│   ├── 📄 .env.staging                # Staging Environment
│   ├── 📄 deploy-staging.sh           # Staging Deployment
│   └── 📄 docker-compose.staging.yml  # Staging Compose
├── 📁 terraform/                      # Infrastructure as Code
│   ├── 📄 main.tf                     # Main Terraform Config
│   ├── 📄 terraform.tfvars.example    # Variable Examples
│   └── 📄 variables.tf                # Variable Definitions
├── 📄 CLOUD_ARCHITECTURE_EN.md        # Cloud Architecture (English)
├── 📄 CLOUD_ARCHITECTURE_JA.md        # Cloud Architecture (Japanese)
├── 📄 DEPLOYMENT_GUIDE_EN.md          # Deployment Guide (English)
├── 📄 DEPLOYMENT_GUIDE_JA.md          # Deployment Guide (Japanese)
└── 📄 PLATFORM_READINESS_ASSESSMENT.md # Readiness Assessment
```

---

## 📁 5_SECURITY - Security & Compliance Framework
**Purpose**: Security protocols, compliance documentation, and governance
```
5_SECURITY/
├── 📄 AUDIT_LOGGING.md                # Audit Logging Policy
├── 📄 EMPLOYMENT_AGENCY_LICENSE_APPLICATION.md # License Application
├── 📄 ESG_POLICY.md                   # ESG Policy Framework
├── 📄 GDPR_COMPLIANCE.md              # GDPR Compliance Guide
├── 📄 GOVERNANCE.md                   # Corporate Governance
├── 📄 LEGAL_ENTITY_STRUCTURE.md       # Legal Structure (Global)
├── 📄 LEGAL_ENTITY_STRUCTURE_JA.md    # Legal Structure (Japan)
├── 📄 SECURITY_PROTOCOLS.md           # Security Protocols
└── 📄 THIRD_PARTY_RISK.md             # Third-party Risk Management
```

---

## 📁 6_ROADMAP - Business Strategy & Funding
**Purpose**: Business roadmap, funding strategy, and investor materials
```
6_ROADMAP/
├── 📄 FUNDING_STRATEGY_EN.md          # Funding Strategy (English)
├── 📄 FUNDING_STRATEGY_JA.md          # Funding Strategy (Japanese)
├── 📄 PLATFORM_ROADMAP_EN.md          # Platform Roadmap (English)
├── 📄 PLATFORM_ROADMAP_JA.md          # Platform Roadmap (Japanese)
├── 📄 SERIES_SEED_PITCH_DECK_EN.md    # Seed Pitch Deck (English)
└── 📄 SERIES_SEED_PITCH_DECK_JA.md    # Seed Pitch Deck (Japanese)
```

---

## 📁 IP_DOCS - Intellectual Property Documentation
**Purpose**: Comprehensive IP documentation for legal protection and patents
```
IP_DOCS/
├── 📄 01_EXECUTIVE_SUMMARY_EN.md      # Executive Summary
├── 📄 02_MARKET_ANALYSIS_EN.md        # Market Analysis
├── 📄 03_LEGAL_FRAMEWORK_EN.md        # Legal Framework
├── 📄 04_SYSTEM_ARCHITECTURE_EN.md    # System Architecture
├── 📄 05_AI_ML_FRAMEWORK_EN.md        # AI/ML Framework
├── 📄 06_DATABASE_DESIGN_EN.md        # Database Design
├── 📄 07_API_SPECIFICATIONS_EN.md     # API Specifications
├── 📄 08_BACKEND_IMPLEMENTATION_EN.md # Backend Implementation
├── 📄 09_FRONTEND_IMPLEMENTATION_EN.md # Frontend Implementation
├── 📄 10_AI_AGENT_IMPLEMENTATION_EN.md # AI Agent Implementation
├── 📄 11_SECURITY_FRAMEWORK_EN.md     # Security Framework
└── 📄 12_DEPLOYMENT_INFRASTRUCTURE_EN.md # Deployment Infrastructure
```

---

## 📁 scripts - Automation & Utility Scripts
**Purpose**: Platform automation, monitoring, and operational scripts
```
scripts/
├── 📄 backup-platform.sh              # Platform Backup
├── 📄 generate-demo-data.py           # Demo Data Generation
├── 📄 run-full-validation.sh          # Full System Validation
├── 📄 start-monitoring.sh             # Start Monitoring Stack
├── 📄 start-platform.sh               # Start Entire Platform
├── 📄 stop-platform.sh                # Stop Platform
└── 📄 validate-platform.sh            # Platform Health Check
```

---

## 📁 tests - Testing Framework
**Purpose**: Comprehensive testing suite for quality assurance
```
tests/
├── 📁 e2e/                            # End-to-End Tests
│   └── 📄 test_platform_e2e.py        # Platform E2E Tests
└── 📁 integration/                    # Integration Tests
    └── 📄 test_api_integration.py     # API Integration Tests
```

---

## 📁 .github - CI/CD Workflows
**Purpose**: Automated build, test, and deployment pipelines
```
.github/
└── 📁 workflows/
    ├── 📄 ci-cd-pipeline.yml          # Main CI/CD Pipeline
    ├── 📄 infrastructure-validation.yml # Infrastructure Testing
    └── 📄 mobile-app-ci.yml           # Mobile App CI/CD
```

---

## Architecture Overview

### **Microservices Count**: 19 Services
### **Technology Stack**: 
- **Frontend**: Next.js, React Native, TypeScript
- **Backend**: Node.js, Python, Express.js
- **AI/ML**: TensorFlow, PyTorch, Custom NLP
- **Blockchain**: Ethereum, IPFS, Hardhat
- **Database**: PostgreSQL, Redis, Elasticsearch
- **Infrastructure**: Docker, Kubernetes, Terraform
- **Monitoring**: Prometheus, Grafana, Loki

### **Enterprise Features**:
- ✅ Multi-language Support (English/Japanese)
- ✅ Comprehensive Documentation
- ✅ Security & Compliance Framework
- ✅ CI/CD Automation
- ✅ Monitoring & Observability
- ✅ Infrastructure as Code
- ✅ Intellectual Property Protection
- ✅ Business Strategy & Funding Documentation

**Total Files**: 400+ files across comprehensive enterprise architecture
**Investment Value**: ¥97,012,500 ($646,750 USD) development cost
**Target Market**: Japan's ¥9.4 trillion engineering dispatch industry
