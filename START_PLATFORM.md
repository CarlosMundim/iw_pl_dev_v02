# 🚀 iWORKZ Platform Quick Start Guide

## Platform Status: **DEMO READY** ✅

### **All Services Scaffolded & Containerized**

#### ✅ **Core Infrastructure Services**
- **PostgreSQL Database** - Primary data store with init scripts
- **Redis Cache** - Session management and caching
- **Docker Compose** - Complete orchestration configuration

#### ✅ **Application Services**  
- **Backend API** (Node.js/Express) - Core platform API on port 3001
- **Web Frontend** (Next.js 14) - User interface on port 3000  
- **AI Agent** (FastAPI/Python) - AI processing service on port 8001
- **Admin Dashboard** (Next.js 14) - Administrative interface on port 3006

#### ✅ **Specialized Microservices**
- **Matching Engine** (Node.js) - Job-candidate matching on port 3003
- **Compliance Engine** (FastAPI/Python) - Regulatory compliance on port 8003  
- **Analytics Service** (FastAPI/Python) - Platform analytics on port 8004
- **Integration Hub** (Node.js) - Third-party integrations on port 3005

---

## 🔧 **Quick Start Instructions**

### **Prerequisites**
- Docker Desktop installed and running
- WSL2 enabled (Windows users)
- 8GB+ RAM available for containers

### **1. Start the Platform**
```bash
# Clone/navigate to project directory
cd iw_pl_dev_v02

# Copy environment configuration
cp .env.example .env

# Start all services
docker-compose up -d

# Check service status
docker-compose ps
```

### **2. Verify Services**
- **Frontend**: http://localhost:3000
- **API Health**: http://localhost:3001/health  
- **AI Agent**: http://localhost:8001/health
- **Admin Panel**: http://localhost:3006
- **Analytics**: http://localhost:8004/docs (Swagger UI)
- **Compliance**: http://localhost:8003/docs (Swagger UI)

## ✅ Verification Checklist

### **URLs to Test**
- [ ] Frontend: http://localhost:3000 (should show landing page)
- [ ] API Health: http://localhost:8000/health (should return {"status": "healthy"})
- [ ] AI Docs: http://localhost:8001/docs (should show API documentation)
- [ ] API Docs: http://localhost:8000/docs (should show backend docs)

### **Key Functions to Verify**
- [ ] User registration works
- [ ] File upload accepts resumes
- [ ] Job matching returns scores
- [ ] Mock AI responses are realistic
- [ ] Database contains sample data

## 🎪 Quick Demo Test

### **5-Minute Validation**
1. **Visit** http://localhost:3000
2. **Register** new talent account
3. **Upload** any PDF resume file
4. **Browse** available jobs
5. **Check** match scores appear
6. **Verify** professional appearance

### **Success Criteria**
- ✅ All pages load quickly (<2 seconds)
- ✅ No error messages or broken features
- ✅ Mock AI returns realistic responses
- ✅ UI looks professional and polished
- ✅ Job matching shows detailed scores

## 🆘 Troubleshooting

### **Common Issues**
```bash
# Docker not running
sudo service docker start

# Port conflicts
netstat -tulpn | grep :3000

# Node modules issues
rm -rf node_modules
npm install

# Database connection errors
docker compose logs postgres

# AI service not responding
curl http://localhost:8001/health
```

### **Reset Everything**
```bash
# Stop all services
docker compose down
pkill -f "npm run dev"
pkill -f "python src/main.py"

# Clean start
docker compose up -d postgres redis
sleep 30
# Then restart API, Frontend, AI Agent
```

## 🎯 Next Steps After Startup

Once platform is running successfully:

1. **Create demo script** for investor presentations
2. **Test all major user flows** end-to-end  
3. **Verify sample data** is compelling and realistic
4. **Optimize performance** for smooth demos
5. **Prepare talking points** for technical questions

## 📞 Ready for Demo?

When all services are running and verified:
- ✅ **Platform Status**: All green
- ✅ **Demo Readiness**: Stakeholder ready
- ✅ **Technical Risk**: Minimized
- ✅ **Presentation Mode**: Activated

**YOU'RE READY TO IMPRESS STAKEHOLDERS! 🎉**