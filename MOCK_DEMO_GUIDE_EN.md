# 🎭 iWORKZ Mock Demo Guide

## Zero-Cost Demo Platform Setup

This guide helps you run the iWORKZ platform in **mock mode** - providing full functionality without any external API costs.

## ✨ What's Included

### **Mock AI Services (Zero Cost)**
- **Resume Parsing** - Extracts skills, experience, education from uploaded files
- **Job Matching** - AI-powered candidate-job compatibility scoring
- **Skills Analysis** - Intelligent skill extraction and categorization
- **Compliance Checking** - Regulatory validation across 9+ jurisdictions
- **Document Processing** - PDF/Word resume analysis

### **Sample Data**
- **150+ Realistic Jobs** - Across multiple roles and locations
- **Demo User Accounts** - Pre-configured talent and employer profiles
- **Match Scores** - Realistic compatibility ratings
- **Analytics Data** - Sample metrics and insights

## 🚀 Quick Start

### 1. Environment Setup
```bash
# Copy environment template
cp .env.example .env.local

# Key setting for mock mode
echo "USE_MOCK_AI=true" >> .env.local
```

### 2. Start Infrastructure
```bash
# Start database and cache
docker compose up -d postgres redis

# Wait for services to be ready
sleep 10
```

### 3. Start Services
```bash
# Terminal 1: Backend API
cd 2_SERVICES/backend-api
npm install
npm run dev

# Terminal 2: Web Frontend  
cd 2_SERVICES/web-frontend
npm install
npm run dev

# Terminal 3: AI Agent (Mock Mode)
cd 2_SERVICES/ai-agent
pip install -r requirements.txt
python src/main.py
```

## 🌐 Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| **Web Frontend** | http://localhost:3000 | Main user interface |
| **Backend API** | http://localhost:8000/api | REST API endpoints |
| **AI Agent** | http://localhost:8001 | Mock AI services |
| **API Docs** | http://localhost:8000/docs | Interactive API documentation |
| **AI Docs** | http://localhost:8001/docs | AI service documentation |

## 🎯 Demo Scenarios

### **Scenario 1: Talent Registration & Job Search**
1. Visit http://localhost:3000
2. Click "Get Started" → "Find Opportunities"
3. Register as talent: `demo.talent@iworkz.dev` / `demo123!`
4. Upload resume (any PDF/Word file)
5. Browse matched jobs with AI-generated scores

### **Scenario 2: Employer Job Posting & Candidate Matching**
1. Register as employer: `demo.employer@iworkz.dev` / `demo123!`
2. Post a new job with requirements
3. View AI-generated candidate matches
4. See compliance checks for different countries

### **Scenario 3: Resume Processing Demo**
1. Use document upload at http://localhost:8001/docs
2. Test `/documents/parse-resume` endpoint
3. Upload any resume file to see extracted:
   - Skills and experience
   - Education and certifications
   - Contact information
   - Confidence scores

### **Scenario 4: Job Matching Algorithm**
1. Use matching endpoint at http://localhost:8001/docs
2. Test `/matching/match-candidates` endpoint
3. See realistic scoring across:
   - Skills compatibility (35% weight)
   - Experience level (25% weight)
   - Location preferences (15% weight)
   - Salary expectations (15% weight)
   - Availability status (10% weight)

## 📊 Mock Features

### **AI Resume Parser**
- Extracts 10+ skill categories
- Identifies experience levels
- Parses education and certifications
- 85-95% simulated accuracy
- Supports PDF, Word, Text files

### **Job Matching Algorithm**
- Weighted scoring system
- Skills semantic matching
- Experience level compatibility
- Location and remote preferences
- Salary range alignment
- AI-generated explanations

### **Compliance Engine**
- UK, Germany, Australia, US rules
- Employment law validation
- Salary compliance checks
- Visa requirement analysis
- Data protection compliance

### **Analytics Dashboard**
- Real-time job metrics
- Application tracking
- Match success rates
- Skills trend analysis
- Geographic distribution

## 🔧 Configuration

### **Mock Mode Settings (`.env.local`)**
```bash
# Enable mock AI services (zero cost)
USE_MOCK_AI=true
MOCK_RESPONSE_DELAY=0.8

# Disable real AI services (save API keys for production)
ENABLE_OPENAI=false
ENABLE_ANTHROPIC=false

# Mock-specific settings
MOCK_RESUME_PROCESSING=true
MOCK_COMPLIANCE_CHECKS=true
MOCK_JOB_MATCHING=true
```

### **Sample Demo Accounts**
```bash
# Talent Account
Email: demo.talent@iworkz.dev
Password: demo123!

# Employer Account  
Email: demo.employer@iworkz.dev
Password: demo123!

# Admin Account
Email: admin@iworkz.dev
Password: demo123!
```

## 📈 Performance Metrics

### **Mock vs Real API Comparison**
| Feature | Mock Mode | Real API Mode |
|---------|-----------|---------------|
| **Cost** | $0.00 | $0.002-0.02 per request |
| **Response Time** | 0.5-2.0s | 1.0-5.0s |
| **Rate Limits** | None | Provider dependent |
| **Accuracy** | Simulated 85-95% | Real 90-98% |
| **Availability** | 100% | 99.9% |

### **Processing Capabilities**
- **Resume Processing**: Unlimited files
- **Job Matching**: 100+ candidates per job
- **Compliance Checks**: All supported jurisdictions
- **Bulk Operations**: Up to 10 jobs/requests

## 🎪 Demo Script

### **5-Minute Platform Demo**
1. **Landing Page** (30s) - Show platform overview and features
2. **Talent Registration** (60s) - Quick signup and profile creation
3. **Resume Upload** (60s) - Upload and see AI skill extraction
4. **Job Matching** (90s) - Browse jobs with match scores and explanations
5. **Employer View** (60s) - Switch to employer account, see candidate matches
6. **Compliance Check** (30s) - Show regulatory validation for different countries

### **Technical Deep Dive (15 minutes)**
1. **Architecture Overview** (3min) - Microservices, mock vs real AI
2. **Resume Processing** (3min) - Upload various file formats, see extraction
3. **Matching Algorithm** (4min) - Detailed scoring breakdown and explanations
4. **Compliance Engine** (2min) - Multi-jurisdiction validation
5. **Analytics Dashboard** (2min) - Metrics and insights
6. **Developer Tools** (1min) - API documentation and testing

## 🔄 Switching to Production

When ready for real AI services:

```bash
# Update .env.local
USE_MOCK_AI=false
ENABLE_OPENAI=true
OPENAI_API_KEY=your_real_api_key

# Restart AI service
cd 2_SERVICES/ai-agent
python src/main.py
```

## 🆘 Troubleshooting

### **Common Issues**
- **Port conflicts**: Change ports in `.env.local`
- **Database not ready**: Wait 30s after `docker compose up`
- **Mock not working**: Check `USE_MOCK_AI=true` in `.env.local`
- **Upload fails**: Ensure files are under 10MB

### **Logs and Debugging**
```bash
# Check service logs
docker compose logs postgres redis

# Check AI service logs
cd 2_SERVICES/ai-agent
tail -f logs/app.log

# Check API logs
cd 2_SERVICES/backend-api
npm run dev -- --verbose
```

## 📋 Demo Checklist

- [ ] All services running (3000, 8000, 8001)
- [ ] Sample data loaded in database
- [ ] Mock AI responses working
- [ ] File uploads functional
- [ ] Job matching generating scores
- [ ] Compliance checks returning results
- [ ] Demo accounts accessible

## 🎉 Success Metrics

After completing setup, you should have:
- **Fully functional platform** with zero API costs
- **Realistic demo data** for presentations
- **Interactive job matching** with AI explanations
- **Complete resume processing** pipeline
- **Multi-jurisdiction compliance** validation
- **Professional UI/UX** ready for stakeholders

---

**💡 Pro Tip**: This mock setup is perfect for investor demos, stakeholder presentations, and development testing. Switch to real APIs only when ready for production deployment!