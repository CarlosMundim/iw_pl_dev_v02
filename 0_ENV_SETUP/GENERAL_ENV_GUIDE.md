# General Environment Setup Guide

## Quick Start Checklist
- [ ] Install WSL 2 with Ubuntu
- [ ] Set up Git with SSH keys
- [ ] Configure PowerShell with Windows Terminal
- [ ] Install VS Code with essential extensions
- [ ] Install Docker Desktop with WSL integration
- [ ] Clone iWORKZ platform repository
- [ ] Set up development environment

## Development Workflow
1. **Code in WSL**: Use VS Code with Remote-WSL extension
2. **Version Control**: Git operations in WSL terminal
3. **Docker Services**: Run via docker-compose
4. **Testing**: Use npm/yarn scripts in WSL
5. **Debugging**: VS Code debugger with launch configurations

## Environment Variables
Create `.env.local` files for each service:
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/iworkz
REDIS_URL=redis://localhost:6379

# Authentication
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# AI Services
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key

# External APIs
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
```

## File System Structure
```
Windows: C:\Users\Carlos\OneDrive\Desktop\iw_pl_dev_v02\
WSL:     /mnt/c/Users/Carlos/OneDrive/Desktop/iw_pl_dev_v02/
```

## Performance Tips
1. **Work in WSL**: Keep code in WSL filesystem for better performance
2. **Docker Resources**: Allocate sufficient RAM (8GB+) to Docker
3. **VS Code**: Use WSL extension for better integration
4. **Git**: Configure proper line endings for cross-platform compatibility

## Backup Strategy
- Code: Git repositories with remote backups
- Database: Regular PostgreSQL dumps
- Environment: Document all configurations
- Docker: Export important images

## Security Considerations
- Keep API keys in environment files (never commit)
- Use strong passwords for databases
- Enable 2FA on all accounts
- Regular security updates