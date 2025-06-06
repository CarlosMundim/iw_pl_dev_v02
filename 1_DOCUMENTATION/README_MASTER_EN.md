# iWORKZ Platform - Master README

## 🚀 Quick Start

### Prerequisites

* Windows 10/11 with WSL 2
* Docker Desktop
* VS Code with Remote-WSL extension
* Git with SSH keys configured

### Development Setup

```bash
# Clone the repository
git clone git@github.com:your-org/iworkz-platform.git
cd iworkz-platform

# Copy environment variables
cp .env.example .env.local

# Start all services
docker-compose up -d

# Install dependencies for frontend services
cd 2_SERVICES/web-frontend && npm install
cd ../mobile-app && npm install
cd ../investors-website && npm install
```

### Access Points

* **Web Frontend**: [http://localhost:3000](http://localhost:3000)
* **Investors Site**: [http://localhost:3001](http://localhost:3001)
* **API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **Admin Dashboard**: [http://localhost:3002](http://localhost:3002)

## 📁 Project Structure

```
iw_pl_dev_v02/
├── 0_ENV_SETUP/          # Environment setup guides
├── 1_DOCUMENTATION/      # Project documentation
├── 2_SERVICES/          # Microservices and applications
├── 3_AI_AGENTS/         # AI integration guides
├── 4_MISC/              # Miscellaneous files
├── docker-compose.yml   # Container orchestration
└── .env.example         # Environment variables template
```

## 🛠️ Services Overview

### Frontend Services

* **web-frontend**: Main user interface (Next.js)
* **mobile-app**: React Native mobile application
* **investors-website**: Dedicated investor portal
* **admin-dashboard**: Administrative interface

### Backend Services

* **backend-api**: Main API gateway and business logic
* **ai-agent**: AI/ML processing and recommendations
* **voice-assistant**: Voice interaction processing
* **matching-engine**: Job and talent matching algorithms
* **credential-engine**: Verification and validation
* **notification-service**: Multi-channel notifications

### Data Services

* **db-postgres**: Primary PostgreSQL database
* **redis**: Caching and session management
* **search**: Elasticsearch for full-text search

## 🔧 Development Workflow

### Daily Development

1. Start services: `docker-compose up -d`
2. Work in VS Code with Remote-WSL
3. Make changes and test locally
4. Commit changes with descriptive messages
5. Push to feature branch and create PR

### Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e

# Run all tests in Docker
docker-compose -f docker-compose.test.yml up
```

### Code Quality

```bash
# Linting
npm run lint

# Type checking
npm run typecheck

# Format code
npm run format

# Pre-commit hooks
npm run pre-commit
```

## 🚀 Deployment

### Staging

```bash
# Deploy to staging
npm run deploy:staging

# Run smoke tests
npm run test:smoke
```

### Production

```bash
# Deploy to production (requires approval)
npm run deploy:production

# Monitor deployment
npm run monitor:deployment
```

## 📚 Documentation Links

* [Project Overview](1_DOCUMENTATION/PROJECT_OVERVIEW.md)
* [Architecture Guide](1_DOCUMENTATION/ARCHITECTURE.md)
* [Container Guide](1_DOCUMENTATION/CONTAINER_GUIDE.md)
* [Deployment Guide](1_DOCUMENTATION/DEPLOYMENT.md)
* [Git Workflow](1_DOCUMENTATION/GIT_WORKFLOW.md)

## 🤖 AI Integration

* [Agent Prompts](3_AI_AGENTS/AGENT_PROMPTS.md)
* [Prompt Engineering](3_AI_AGENTS/PROMPT_ENGINEERING_GUIDE.md)
* [API Keys Setup](3_AI_AGENTS/API_KEYS_GUIDE.md)

## 🆘 Support

* **Issues**: Create GitHub issues for bugs and feature requests
* **Documentation**: Check the documentation folder first
* **Environment**: Follow setup guides in 0\_ENV\_SETUP/
* **Chat**: Team Slack channel #iworkz-dev

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is proprietary and confidential. All rights reserved.
