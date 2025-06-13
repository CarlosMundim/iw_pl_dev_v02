# 🚀 iWORKZ Platform - Deployment & Backup Setup

## 📋 Repository & Deployment Strategy

### **Step 1: GitHub Repository Setup**

#### **1.1 Create GitHub Repository**
```bash
# Navigate to project root
cd /mnt/c/Users/Carlos/OneDrive/Desktop/iw_pl_dev_v02

# Initialize git repository
git init

# Create .gitignore file
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
*/node_modules/
__pycache__/
*.pyc
.env
.env.local
.env.production

# Build outputs
.next/
dist/
build/

# Logs
*.log
logs/

# Database
*.db
*.sqlite

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Docker
docker-compose.override.yml

# Temporary files
*.tmp
*.temp

# API Keys (security)
.env.*
!.env.example
EOF

# Add all files
git add .

# Initial commit
git commit -m "Initial commit: iWORKZ Platform - AI-powered global talent matching

- Complete microservices architecture
- Mock AI services for zero-cost demos  
- Full-stack platform: React frontend + Node.js API + Python AI
- PostgreSQL database with sample data
- Redis caching and session management
- Docker containerization
- Comprehensive documentation

Features:
- AI-powered resume parsing
- Intelligent job-candidate matching
- Multi-jurisdiction compliance checking
- Real-time analytics dashboard
- Modern responsive UI/UX

Ready for investor demos and stakeholder presentations."
```

#### **1.2 Push to GitHub**
```bash
# Create repository on GitHub.com first, then:
git remote add origin https://github.com/YOUR_USERNAME/iworkz-platform.git
git branch -M main
git push -u origin main
```

### **Step 2: Vercel Deployment Setup**

#### **2.1 Frontend Deployment (Web-Frontend)**
```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend
cd 2_SERVICES/web-frontend

# Deploy to Vercel
vercel

# Follow prompts:
# - Set up and deploy: Yes
# - Which scope: [Your account]
# - Link to existing project: No
# - Project name: iworkz-web-frontend
# - Directory: ./
# - Override settings: No
```

#### **2.2 Backend API Deployment**
```bash
# Navigate to backend
cd ../backend-api

# Deploy backend API
vercel

# Project name: iworkz-backend-api
# Build command: npm run build
# Output directory: dist
# Install command: npm install
```

#### **2.3 AI Agent Deployment**
```bash
# Navigate to AI agent
cd ../ai-agent

# Create vercel.json for Python deployment
cat > vercel.json << 'EOF'
{
  "version": 2,
  "builds": [
    {
      "src": "src/main.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/main.py"
    }
  ]
}
EOF

# Deploy AI service
vercel

# Project name: iworkz-ai-agent
```

### **Step 3: Environment Configuration**

#### **3.1 Vercel Environment Variables**
```bash
# For each Vercel project, add environment variables:

# Web Frontend
vercel env add NEXT_PUBLIC_API_URL
# Value: https://iworkz-backend-api.vercel.app/api/v1

vercel env add NEXT_PUBLIC_AI_URL  
# Value: https://iworkz-ai-agent.vercel.app

# Backend API
vercel env add DATABASE_URL
# Value: [Your production database URL]

vercel env add REDIS_URL
# Value: [Your production Redis URL]

vercel env add USE_MOCK_AI
# Value: true

# AI Agent
vercel env add USE_MOCK_AI
# Value: true

vercel env add MOCK_RESPONSE_DELAY
# Value: 0.8
```

#### **3.2 Production Database Setup**
```bash
# Option 1: Railway (Recommended for demos)
# 1. Sign up at railway.app
# 2. Create new project
# 3. Add PostgreSQL service
# 4. Copy connection string to Vercel env

# Option 2: Supabase (Free tier)
# 1. Sign up at supabase.com
# 2. Create new project
# 3. Use connection string in Vercel

# Option 3: PlanetScale (MySQL alternative)
# 1. Sign up at planetscale.com
# 2. Create database
# 3. Use connection string
```

### **Step 4: Google Drive Backup**

#### **4.1 Create Backup Archive**
```bash
# Navigate to project root
cd /mnt/c/Users/Carlos/OneDrive/Desktop/iw_pl_dev_v02

# Create backup excluding node_modules and build files
tar -czf iworkz-platform-backup-$(date +%Y%m%d).tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='dist' \
  --exclude='build' \
  --exclude='.next' \
  --exclude='__pycache__' \
  --exclude='*.log' \
  .

# This creates: iworkz-platform-backup-YYYYMMDD.tar.gz
```

#### **4.2 Upload to Google Drive**
```bash
# Manual upload via drive.google.com
# OR use Google Drive Desktop sync
# OR use gdrive CLI tool:

# Install gdrive CLI
# Download from: https://github.com/prasmussen/gdrive
# Follow authentication setup

# Upload backup
gdrive upload iworkz-platform-backup-$(date +%Y%m%d).tar.gz
```

### **Step 5: Automated Backup Script**

#### **5.1 Create Backup Automation**
```bash
# Create backup script
cat > backup-platform.sh << 'EOF'
#!/bin/bash

# iWORKZ Platform Backup Script
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="iworkz-platform-backup-$DATE"
PROJECT_DIR="/mnt/c/Users/Carlos/OneDrive/Desktop/iw_pl_dev_v02"

echo "🔄 Creating iWORKZ Platform backup..."

# Create archive
cd "$PROJECT_DIR"
tar -czf "${BACKUP_NAME}.tar.gz" \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='dist' \
  --exclude='build' \
  --exclude='.next' \
  --exclude='__pycache__' \
  --exclude='*.log' \
  --exclude='.env.local' \
  .

# Move to backup directory
mkdir -p ~/iworkz-backups
mv "${BACKUP_NAME}.tar.gz" ~/iworkz-backups/

echo "✅ Backup created: ~/iworkz-backups/${BACKUP_NAME}.tar.gz"

# Optional: Upload to Google Drive
# gdrive upload "~/iworkz-backups/${BACKUP_NAME}.tar.gz"

echo "📁 Backup ready for Google Drive upload"
EOF

# Make executable
chmod +x backup-platform.sh

# Run backup
./backup-platform.sh
```

### **Step 6: Production URLs**

#### **6.1 Expected Deployment URLs**
```bash
# After successful deployment:

# Frontend (Main App)
https://iworkz-web-frontend.vercel.app

# Backend API
https://iworkz-backend-api.vercel.app

# AI Agent Service  
https://iworkz-ai-agent.vercel.app

# API Documentation
https://iworkz-backend-api.vercel.app/docs
https://iworkz-ai-agent.vercel.app/docs
```

#### **6.2 Custom Domain Setup (Optional)**
```bash
# In Vercel dashboard:
# 1. Go to project settings
# 2. Add custom domain
# 3. Configure DNS records

# Example domains:
# app.iworkz.com → web-frontend
# api.iworkz.com → backend-api  
# ai.iworkz.com → ai-agent
```

## 🎯 Deployment Checklist

### **GitHub Repository**
- [ ] Repository created and pushed
- [ ] README.md with project description
- [ ] Proper .gitignore configuration
- [ ] All secrets excluded from repository
- [ ] Documentation files included

### **Vercel Deployment**
- [ ] Frontend deployed and accessible
- [ ] Backend API deployed with health check
- [ ] AI Agent deployed with mock responses
- [ ] Environment variables configured
- [ ] Custom domains configured (optional)

### **Database & Infrastructure**
- [ ] Production database provisioned
- [ ] Redis cache service configured
- [ ] Sample data loaded
- [ ] Connection strings secured

### **Backup Strategy**
- [ ] Local backup created and tested
- [ ] Google Drive backup uploaded
- [ ] Automated backup script created
- [ ] Backup schedule established

## 🚀 Go-Live Commands

### **Quick Deployment**
```bash
# 1. Push to GitHub
git add . && git commit -m "Production ready" && git push

# 2. Deploy all services
cd 2_SERVICES/web-frontend && vercel --prod
cd ../backend-api && vercel --prod  
cd ../ai-agent && vercel --prod

# 3. Test production
curl https://iworkz-backend-api.vercel.app/health
curl https://iworkz-ai-agent.vercel.app/health

# 4. Create backup
./backup-platform.sh
```

### **Demo URLs for Stakeholders**
```bash
# Share these URLs for live demos:
🌐 Platform: https://iworkz-web-frontend.vercel.app
📚 API Docs: https://iworkz-backend-api.vercel.app/docs
🤖 AI Docs: https://iworkz-ai-agent.vercel.app/docs
```

## 💡 Pro Tips

- **Use mock mode** in production for cost-effective demos
- **Monitor Vercel logs** for debugging deployment issues  
- **Set up custom domains** for professional presentation
- **Regular backups** before major changes
- **Environment parity** between local and production

**Your platform is now ready for global access and investor presentations!** 🎉