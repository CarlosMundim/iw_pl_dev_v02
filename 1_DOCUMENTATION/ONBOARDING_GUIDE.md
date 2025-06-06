# ONBOARDING GUIDE

## For Developers

### Getting Started
1. **Access**: Request GitHub repo access from [contact@iworkz.ai](mailto:contact@iworkz.ai). All code and infra is managed via GitHub.
2. **Setup**: Install Docker Desktop, Node.js (LTS), Python 3.10+, and VS Code. Clone repo, run `docker compose up`, access `localhost:3000`.
3. **Dev Workflow**: All feature/bug branches must use pull requests and code review.
4. **Secrets**: Local `.env` files are never committed—request encrypted credentials from the ops lead.
5. **Issue Tracking**: We use GitHub Issues for all tasks, bugs, and enhancements.

### Development Environment Setup
```bash
# Prerequisites check
node --version    # Should be 18+
python --version  # Should be 3.10+
docker --version  # Should be 20.10+

# Clone and setup
git clone git@github.com:your-org/iworkz-platform.git
cd iworkz-platform

# Environment configuration
cp .env.example .env.local
# Edit .env.local with your local configuration

# Start development environment
docker-compose up -d

# Verify all services are running
docker-compose ps
curl http://localhost:3000  # Web frontend
curl http://localhost:8000/health  # Backend API
```

### Code Quality Standards
- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier with consistent configuration
- **Testing**: Jest for unit tests, Playwright for E2E
- **Type Safety**: Strict TypeScript configuration
- **Security**: Regular security audits and dependency updates

### Git Workflow
1. Create feature branch from `main`
2. Make changes with descriptive commits
3. Run tests and quality checks locally
4. Push branch and create pull request
5. Address code review feedback
6. Merge after approval and CI passes

## For Partners

### Integration Process
- **Integrations**: Start with the [Integration Hub](../2_SERVICES/integration-hub/README.md).
- **APIs**: See API documentation for endpoint specifications and authentication
- **Security**: Refer to [GDPR Compliance](../5_SECURITY/GDPR_COMPLIANCE.md) and [Security Protocols](../5_SECURITY/SECURITY_PROTOCOLS.md).
- **Testing**: Sandbox environment available for integration testing

### Partner Onboarding Steps
1. **Initial Contact**: Reach out to partnerships team
2. **Technical Assessment**: Review integration requirements
3. **Sandbox Access**: Receive development environment credentials
4. **Integration Development**: Build and test integration
5. **Security Review**: Complete security and compliance review
6. **Production Deployment**: Deploy to production environment
7. **Ongoing Support**: Access to technical support and documentation

## For New Team Members

### First Week Checklist
- [ ] Complete IT setup (laptop, accounts, access)
- [ ] GitHub access and SSH key setup
- [ ] Development environment setup and verification
- [ ] Read core documentation (Business Context, Architecture)
- [ ] Attend team introduction meetings
- [ ] Review codebase and project structure
- [ ] Complete first small task or bug fix

### Essential Reading
1. [Business Context](./BUSINESS_CONTEXT.md) - Understand the mission and market
2. [Architecture Overview](./ARCHITECTURE_OVERVIEW.md) - Technical foundation
3. [Security Protocols](../5_SECURITY/SECURITY_PROTOCOLS.md) - Security requirements
4. [Git Workflow](./GIT_WORKFLOW.md) - Development process
5. Service-specific README files for your area of focus

### Team Structure
- **Engineering**: Full-stack, frontend, backend, DevOps, AI/ML specialists
- **Product**: Product managers, designers, user researchers
- **Compliance**: Legal, regulatory, and compliance experts
- **Operations**: Customer success, support, and business operations
- **Leadership**: Executive team and department heads

## Training and Development

### Technical Training
- **Platform Architecture**: Understanding of all system components
- **Security Training**: Annual security awareness and best practices
- **Compliance Training**: Regulatory requirements and implementation
- **AI/ML Training**: Understanding of AI components and ethical considerations

### Professional Development
- **Conference Attendance**: Support for relevant industry conferences
- **Certification Programs**: Technical and professional certifications
- **Internal Training**: Regular lunch-and-learns and knowledge sharing
- **Mentorship Program**: Pairing with experienced team members

### Resources and Tools
- **Documentation**: Comprehensive documentation in this repository
- **Communication**: Slack for team communication, Zoom for meetings
- **Project Management**: GitHub Issues and Projects for task tracking
- **Knowledge Base**: Confluence for additional documentation
- **Support**: IT helpdesk and technical support channels

---

## Further Reading

- [Business Context](./BUSINESS_CONTEXT.md)
- [Architecture Overview](./ARCHITECTURE_OVERVIEW.md)
- [Deployment Guide](../4_DEPLOYMENT/DEPLOYMENT_GUIDE.md)
- [Security Protocols](../5_SECURITY/SECURITY_PROTOCOLS.md)