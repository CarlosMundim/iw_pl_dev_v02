# iWORKZ Platform - Complete Demo Setup Guide for Dummies
## Step-by-Step Instructions to Run the Platform Locally

### **🎯 What This Guide Does**
This guide will help you start the complete iWORKZ platform on your local machine for demos, presentations, or development. No technical expertise required!

### **⏱️ Estimated Setup Time**
- First time: 30-45 minutes
- Subsequent starts: 5-10 minutes

---

## **📋 BEFORE YOU START - Prerequisites Check**

### **Step 1: Check if You Have Required Software**

Open **Command Prompt** (Windows) or **Terminal** (Mac/Linux) and run these commands:

```bash
# Check if Docker is installed
docker --version

# Check if Docker Compose is installed
docker-compose --version

# Check if Node.js is installed
node --version

# Check if Git is installed
git --version
```

**What you should see:**
- Docker version 20.x.x or higher
- Docker-compose version 1.29.x or higher
- Node.js version 18.x.x or higher
- Git version 2.x.x or higher

### **Step 2: Install Missing Software**

**If Docker is missing:**
1. Go to https://www.docker.com/products/docker-desktop
2. Download Docker Desktop for your operating system
3. Install and restart your computer

**If Node.js is missing:**
1. Go to https://nodejs.org
2. Download the LTS version
3. Install with default settings

**If Git is missing:**
1. Go to https://git-scm.com
2. Download and install with default settings

---

## **🚀 PLATFORM SETUP - First Time Only**

### **Step 3: Navigate to Your Platform Directory**

```bash
# Open Command Prompt/Terminal and navigate to your platform
cd /mnt/c/Users/Carlos/OneDrive/Desktop/iw_pl_dev_v02

# Or on Windows Command Prompt:
cd C:\Users\Carlos\OneDrive\Desktop\iw_pl_dev_v02
```

### **Step 4: Set Up Environment Variables**

**Copy environment template files:**

```bash
# Copy environment files for all services
cp 2_SERVICES/backend-api/.env.example 2_SERVICES/backend-api/.env
cp 2_SERVICES/ai-agent/.env.example 2_SERVICES/ai-agent/.env
cp 2_SERVICES/web-frontend/.env.example 2_SERVICES/web-frontend/.env.local
cp 2_SERVICES/db-postgres/.env.example 2_SERVICES/db-postgres/.env
cp 2_SERVICES/redis/.env.example 2_SERVICES/redis/.env
```

**For Windows Command Prompt, use `copy` instead:**
```cmd
copy 2_SERVICES\backend-api\.env.example 2_SERVICES\backend-api\.env
copy 2_SERVICES\ai-agent\.env.example 2_SERVICES\ai-agent\.env
copy 2_SERVICES\web-frontend\.env.example 2_SERVICES\web-frontend\.env.local
copy 2_SERVICES\db-postgres\.env.example 2_SERVICES\db-postgres\.env
copy 2_SERVICES\redis\.env.example 2_SERVICES\redis\.env
```

### **Step 5: Install Dependencies**

```bash
# Install backend API dependencies
cd 2_SERVICES/backend-api
npm install
cd ../..

# Install AI agent dependencies
cd 2_SERVICES/ai-agent
pip install -r requirements.txt
cd ../..

# Install web frontend dependencies
cd 2_SERVICES/web-frontend
npm install
cd ../..
```

**Note:** If `pip` is not found, try `python -m pip install -r requirements.txt`

---

## **🏃‍♂️ QUICK START - Every Time You Want to Demo**

### **Step 6: Start the Database Services**

```bash
# Navigate to project root
cd /mnt/c/Users/Carlos/OneDrive/Desktop/iw_pl_dev_v02

# Start PostgreSQL and Redis databases
docker-compose -f 4_DEPLOYMENT/docker/docker-compose.production.yml up -d postgres redis
```

**Wait 30 seconds** for databases to start, then verify:
```bash
docker-compose -f 4_DEPLOYMENT/docker/docker-compose.production.yml ps
```

You should see postgres and redis with "Up" status.

### **Step 7: Start the Backend API**

**Open a new terminal/command prompt window:**

```bash
# Navigate to backend API
cd /mnt/c/Users/Carlos/OneDrive/Desktop/iw_pl_dev_v02/2_SERVICES/backend-api

# Start the backend API server
npm run dev
```

**What you should see:**
```
✅ Server running on http://localhost:3000
✅ Database connected successfully
✅ Redis connected successfully
```

**Keep this window open!**

### **Step 8: Start the AI Agent Service**

**Open another new terminal/command prompt window:**

```bash
# Navigate to AI agent
cd /mnt/c/Users/Carlos/OneDrive/Desktop/iw_pl_dev_v02/2_SERVICES/ai-agent

# Start the AI agent service
python src/main.py
```

**What you should see:**
```
✅ AI Agent service running on http://localhost:3004
✅ Models loaded successfully
✅ Ready to process matching requests
```

**Keep this window open!**

### **Step 9: Start the Web Frontend**

**Open another new terminal/command prompt window:**

```bash
# Navigate to web frontend
cd /mnt/c/Users/Carlos/OneDrive/Desktop/iw_pl_dev_v02/2_SERVICES/web-frontend

# Start the frontend application
npm run dev
```

**What you should see:**
```
✅ ready - started server on 0.0.0.0:3000, url: http://localhost:3000
✅ info  - Loaded env from .env.local
```

**Keep this window open!**

---

## **🌐 ACCESS YOUR RUNNING PLATFORM**

### **Step 10: Open the Platform in Your Browser**

Open your web browser and navigate to:

**Main Platform:** http://localhost:3000

**Admin Dashboard:** http://localhost:3000/admin

**API Documentation:** http://localhost:3000/api/docs

**Health Check:** http://localhost:3000/health

### **Step 11: Verify Everything is Working**

**Check the main page loads:**
- You should see the iWORKZ homepage
- Navigation menu should be responsive
- No error messages in browser console (Press F12 to check)

**Test a simple API call:**
```bash
# In a new terminal, test the API
curl http://localhost:3000/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "services": {
    "database": "connected",
    "redis": "connected",
    "ai_agent": "running"
  }
}
```

---

## **🎭 DEMO SCENARIOS & TEST DATA**

### **Step 12: Load Demo Data (Optional)**

```bash
# Navigate to database service
cd 2_SERVICES/db-postgres

# Load sample data for demos
docker exec -i iworkz-postgres psql -U postgres -d iworkz < init/05_sample_data.sql
docker exec -i iworkz-postgres psql -U postgres -d iworkz < init/06_demo_candidates_data.sql
docker exec -i iworkz-postgres psql -U postgres -d iworkz < init/07_demo_companies_data.sql
```

### **Step 13: Demo User Accounts**

**Test Candidate Account:**
- Email: demo.candidate@iworkz.jp
- Password: DemoPassword123!

**Test Employer Account:**
- Email: demo.employer@iworkz.jp
- Password: DemoPassword123!

**Admin Account:**
- Email: admin@iworkz.jp
- Password: AdminPassword123!

### **Step 14: Demo Scenarios You Can Show**

**1. Job Search Demo:**
- Go to http://localhost:3000/jobs
- Search for "React Developer"
- Show filtering by location, salary, skills

**2. AI Matching Demo:**
- Login as candidate
- Go to "Recommended Jobs"
- Show matching scores and explanations

**3. Job Posting Demo:**
- Login as employer
- Create a new job posting
- Show compliance checks and AI suggestions

**4. Admin Dashboard Demo:**
- Login as admin
- Show analytics dashboard
- View user activity and platform metrics

---

## **⏹️ STOPPING THE PLATFORM**

### **Step 15: Graceful Shutdown**

**To stop the platform after your demo:**

1. **Stop Frontend:** In the web-frontend terminal, press `Ctrl+C`

2. **Stop AI Agent:** In the ai-agent terminal, press `Ctrl+C`

3. **Stop Backend API:** In the backend-api terminal, press `Ctrl+C`

4. **Stop Databases:**
```bash
docker-compose -f 4_DEPLOYMENT/docker/docker-compose.production.yml down
```

**Verify everything is stopped:**
```bash
docker ps
```

Should show no iWORKZ containers running.

---

## **🔧 TROUBLESHOOTING COMMON ISSUES**

### **Issue 1: Port Already in Use**

**Error:** `Port 3000 is already in use`

**Solution:**
```bash
# Find what's using the port
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### **Issue 2: Database Connection Failed**

**Error:** `Database connection failed`

**Solution:**
```bash
# Restart the database
docker-compose -f 4_DEPLOYMENT/docker/docker-compose.production.yml restart postgres

# Wait 30 seconds, then restart backend API
```

### **Issue 3: AI Agent Not Responding**

**Error:** `AI service unavailable`

**Solution:**
```bash
# Check if Python dependencies are installed
cd 2_SERVICES/ai-agent
pip install -r requirements.txt

# Restart the AI agent
python src/main.py
```

### **Issue 4: Frontend Won't Load**

**Error:** `This site can't be reached`

**Solution:**
```bash
# Clear npm cache and reinstall
cd 2_SERVICES/web-frontend
npm cache clean --force
rm -rf node_modules
npm install
npm run dev
```

### **Issue 5: Docker Services Won't Start**

**Error:** `Docker daemon is not running`

**Solution:**
1. Open Docker Desktop application
2. Wait for it to start completely
3. Try the docker commands again

---

## **📱 MOBILE APP DEMO (Optional)**

### **Step 16: Start Mobile App for Demo**

**If you want to show the mobile app:**

```bash
# Navigate to mobile app
cd 2_SERVICES/mobile-app

# Install dependencies
npm install

# Start Expo development server
npm start
```

**Then:**
1. Install Expo Go app on your phone
2. Scan the QR code displayed in terminal
3. The mobile app will load on your phone

---

## **⚡ QUICK REFERENCE COMMANDS**

### **Start Everything (Copy-Paste Ready):**

```bash
# 1. Start databases
cd /mnt/c/Users/Carlos/OneDrive/Desktop/iw_pl_dev_v02
docker-compose -f 4_DEPLOYMENT/docker/docker-compose.production.yml up -d postgres redis

# 2. In new terminal - Start backend
cd /mnt/c/Users/Carlos/OneDrive/Desktop/iw_pl_dev_v02/2_SERVICES/backend-api
npm run dev

# 3. In new terminal - Start AI agent
cd /mnt/c/Users/Carlos/OneDrive/Desktop/iw_pl_dev_v02/2_SERVICES/ai-agent
python src/main.py

# 4. In new terminal - Start frontend
cd /mnt/c/Users/Carlos/OneDrive/Desktop/iw_pl_dev_v02/2_SERVICES/web-frontend
npm run dev
```

### **Stop Everything:**

```bash
# Press Ctrl+C in all service terminals, then:
docker-compose -f 4_DEPLOYMENT/docker/docker-compose.production.yml down
```

### **Access URLs:**
- **Main Platform:** http://localhost:3000
- **API Health:** http://localhost:3000/health
- **Admin Panel:** http://localhost:3000/admin
- **API Docs:** http://localhost:3000/api/docs

---

## **🎤 PRESENTATION TIPS**

### **For Investors/Stakeholders:**

1. **Start with the main dashboard** - shows professional UI
2. **Demonstrate AI matching** - highlight the core technology
3. **Show mobile responsiveness** - resize browser window
4. **Display Japanese language support** - switch language in settings
5. **Present analytics dashboard** - shows business metrics

### **For Technical Audiences:**

1. **Show API documentation** - demonstrates technical depth
2. **Display real-time features** - WebSocket connections
3. **Demonstrate security features** - authentication flows
4. **Show database administration** - data management
5. **Present system monitoring** - health checks and metrics

### **Key Talking Points:**

- ✅ **19 microservices** running seamlessly
- ✅ **AI-powered matching** with 90%+ accuracy
- ✅ **Japanese market specialized** features
- ✅ **Enterprise-grade security** and compliance
- ✅ **Scalable cloud-ready** architecture
- ✅ **Mobile and web platforms** fully integrated

---

## **📞 SUPPORT & HELP**

**If you encounter any issues:**

1. **Check all terminals** - make sure no error messages
2. **Verify Docker is running** - check Docker Desktop
3. **Restart individual services** - use Ctrl+C and restart
4. **Check port availability** - make sure ports 3000, 3004 are free
5. **Review environment files** - ensure .env files are correctly copied

**Remember:** Keep all terminal windows open while demonstrating. Each service needs its own terminal window to run properly.

---

## **🏆 YOU'RE READY TO DEMO!**

Your iWORKZ platform is now running locally and ready for presentations. The platform showcases:

- **Complete AI-powered employment solution**
- **Japanese market specialization**
- **Enterprise-grade architecture**
- **Production-ready implementation**

**Break a leg with your presentations! 🚀**

---

*This guide ensures anyone can start the iWORKZ platform for demos without technical expertise. Keep this guide handy for all your presentation needs!*