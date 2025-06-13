# iWORKZ Platform - Quick Start Commands
## Copy-Paste Commands for Instant Demo Setup

### **🚀 ONE-COMMAND STARTUP (Windows)**

```cmd
@echo off
echo Starting iWORKZ Platform...
echo.

echo [1/4] Starting databases...
cd C:\Users\Carlos\OneDrive\Desktop\iw_pl_dev_v02
docker-compose -f 4_DEPLOYMENT/docker/docker-compose.production.yml up -d postgres redis

echo [2/4] Waiting for databases to initialize...
timeout /t 30 /nobreak

echo [3/4] Starting backend services...
start cmd /k "cd C:\Users\Carlos\OneDrive\Desktop\iw_pl_dev_v02\2_SERVICES\backend-api && npm run dev"
timeout /t 5 /nobreak

start cmd /k "cd C:\Users\Carlos\OneDrive\Desktop\iw_pl_dev_v02\2_SERVICES\ai-agent && python src/main.py"
timeout /t 5 /nobreak

echo [4/4] Starting web frontend...
start cmd /k "cd C:\Users\Carlos\OneDrive\Desktop\iw_pl_dev_v02\2_SERVICES\web-frontend && npm run dev"

echo.
echo ✅ Platform is starting up!
echo ⏱️  Wait 2-3 minutes for all services to initialize
echo 🌐 Then open: http://localhost:3000
echo.
pause
```

### **🚀 ONE-COMMAND STARTUP (Mac/Linux)**

```bash
#!/bin/bash
echo "Starting iWORKZ Platform..."
echo

echo "[1/4] Starting databases..."
cd /mnt/c/Users/Carlos/OneDrive/Desktop/iw_pl_dev_v02
docker-compose -f 4_DEPLOYMENT/docker/docker-compose.production.yml up -d postgres redis

echo "[2/4] Waiting for databases to initialize..."
sleep 30

echo "[3/4] Starting backend services..."
gnome-terminal -- bash -c "cd /mnt/c/Users/Carlos/OneDrive/Desktop/iw_pl_dev_v02/2_SERVICES/backend-api && npm run dev; exec bash"
sleep 5

gnome-terminal -- bash -c "cd /mnt/c/Users/Carlos/OneDrive/Desktop/iw_pl_dev_v02/2_SERVICES/ai-agent && python src/main.py; exec bash"
sleep 5

echo "[4/4] Starting web frontend..."
gnome-terminal -- bash -c "cd /mnt/c/Users/Carlos/OneDrive/Desktop/iw_pl_dev_v02/2_SERVICES/web-frontend && npm run dev; exec bash"

echo
echo "✅ Platform is starting up!"
echo "⏱️  Wait 2-3 minutes for all services to initialize"
echo "🌐 Then open: http://localhost:3000"
echo
```

---

## **⚡ INDIVIDUAL SERVICE COMMANDS**

### **Database Services**
```bash
# Start databases only
docker-compose -f 4_DEPLOYMENT/docker/docker-compose.production.yml up -d postgres redis

# Check database status
docker-compose -f 4_DEPLOYMENT/docker/docker-compose.production.yml ps

# Stop databases
docker-compose -f 4_DEPLOYMENT/docker/docker-compose.production.yml down
```

### **Backend API**
```bash
# Navigate and start
cd 2_SERVICES/backend-api
npm run dev

# Alternative development mode
npm run start:dev

# Production mode
npm start
```

### **AI Agent Service**
```bash
# Navigate and start
cd 2_SERVICES/ai-agent
python src/main.py

# With debugging
python -m debugpy --listen 5678 src/main.py

# Background mode
nohup python src/main.py &
```

### **Web Frontend**
```bash
# Navigate and start
cd 2_SERVICES/web-frontend
npm run dev

# Production build and start
npm run build
npm start

# Turbo mode (faster)
npm run turbo
```

---

## **🔍 STATUS CHECK COMMANDS**

### **Quick Health Check**
```bash
# Check all services are responding
curl http://localhost:3000/health
curl http://localhost:3004/health

# Check database connectivity
docker exec -it iworkz-postgres pg_isready -U postgres
docker exec -it iworkz-redis redis-cli ping
```

### **Detailed Status Check**
```bash
# Check running processes
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Check service logs
docker logs iworkz-postgres --tail 10
docker logs iworkz-redis --tail 10

# Check Node.js processes
ps aux | grep node
ps aux | grep python
```

---

## **🎯 DEMO-SPECIFIC COMMANDS**

### **Load Demo Data**
```bash
# Load all demo data for presentations
cd 2_SERVICES/db-postgres
docker exec -i iworkz-postgres psql -U postgres -d iworkz < init/05_sample_data.sql
docker exec -i iworkz-postgres psql -U postgres -d iworkz < init/06_demo_candidates_data.sql
docker exec -i iworkz-postgres psql -U postgres -d iworkz < init/07_demo_companies_data.sql
```

### **Create Demo Users**
```bash
# Create demo accounts via API
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo.candidate@iworkz.jp",
    "password": "DemoPassword123!",
    "firstName": "Demo",
    "lastName": "Candidate",
    "role": "candidate"
  }'

curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo.employer@iworkz.jp",
    "password": "DemoPassword123!",
    "firstName": "Demo",
    "lastName": "Employer",
    "role": "employer",
    "companyName": "Demo Corporation"
  }'
```

---

## **🛑 EMERGENCY STOP COMMANDS**

### **Stop All Services Immediately**
```bash
# Kill all Node.js processes
pkill -f node

# Kill all Python processes
pkill -f python

# Stop all Docker containers
docker stop $(docker ps -q)

# Nuclear option - stop everything
docker-compose -f 4_DEPLOYMENT/docker/docker-compose.production.yml down
sudo systemctl stop docker  # Linux only
```

### **Free Up Ports**
```bash
# Windows - Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux - Kill process on port 3000
lsof -ti:3000 | xargs kill -9
lsof -ti:3004 | xargs kill -9
```

---

## **🔧 TROUBLESHOOTING COMMANDS**

### **Reset Everything**
```bash
# Stop all services
docker-compose -f 4_DEPLOYMENT/docker/docker-compose.production.yml down

# Remove containers and volumes
docker-compose -f 4_DEPLOYMENT/docker/docker-compose.production.yml down -v

# Clean Docker system
docker system prune -f

# Restart fresh
docker-compose -f 4_DEPLOYMENT/docker/docker-compose.production.yml up -d postgres redis
```

### **Fix Permission Issues**
```bash
# Linux/Mac - Fix file permissions
sudo chown -R $USER:$USER /mnt/c/Users/Carlos/OneDrive/Desktop/iw_pl_dev_v02
chmod -R 755 /mnt/c/Users/Carlos/OneDrive/Desktop/iw_pl_dev_v02

# Fix NPM permissions
sudo chown -R $USER ~/.npm
```

### **Clear Caches**
```bash
# Clear NPM cache
npm cache clean --force

# Clear all node_modules and reinstall
find . -name "node_modules" -type d -exec rm -rf {} +
find . -name "package-lock.json" -delete
cd 2_SERVICES/backend-api && npm install
cd ../web-frontend && npm install
cd ../..
```

---

## **📊 MONITORING COMMANDS**

### **Real-time Logs**
```bash
# Follow backend API logs
cd 2_SERVICES/backend-api
tail -f logs/app.log

# Follow database logs
docker logs -f iworkz-postgres

# Follow all Docker logs
docker-compose -f 4_DEPLOYMENT/docker/docker-compose.production.yml logs -f
```

### **Performance Monitoring**
```bash
# Check resource usage
docker stats

# Check system resources
htop  # Linux/Mac
tasklist  # Windows

# Monitor network connections
netstat -an | grep :3000
netstat -an | grep :3004
```

---

## **🎨 CUSTOMIZATION COMMANDS**

### **Change Ports (if needed)**
```bash
# Backend API port (edit package.json)
cd 2_SERVICES/backend-api
sed -i 's/3000/3001/g' package.json

# Frontend port
cd 2_SERVICES/web-frontend
export PORT=3001
npm run dev
```

### **Enable Debug Mode**
```bash
# Backend with debug
cd 2_SERVICES/backend-api
DEBUG=* npm run dev

# AI Agent with verbose logging
cd 2_SERVICES/ai-agent
PYTHONPATH=. python -m pdb src/main.py
```

---

## **📱 MOBILE APP COMMANDS**

### **Start Mobile Development**
```bash
# Install and start Expo
cd 2_SERVICES/mobile-app
npm install -g @expo/cli
npm install
npm start

# For iOS simulator
npm run ios

# For Android emulator
npm run android
```

---

## **🌍 BROWSER AUTOMATION**

### **Auto-open Demo URLs**
```bash
# Windows
start http://localhost:3000
start http://localhost:3000/admin
start http://localhost:3000/api/docs

# Mac
open http://localhost:3000
open http://localhost:3000/admin
open http://localhost:3000/api/docs

# Linux
xdg-open http://localhost:3000
xdg-open http://localhost:3000/admin
xdg-open http://localhost:3000/api/docs
```

---

## **💾 BACKUP COMMANDS**

### **Backup Demo Data**
```bash
# Backup database
docker exec iworkz-postgres pg_dump -U postgres iworkz > backup_$(date +%Y%m%d).sql

# Backup uploaded files
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz 2_SERVICES/backend-api/uploads/
```

---

## **🎯 PRESENTATION SHORTCUTS**

### **Demo Scenario 1: Job Search**
```bash
# Pre-populate with jobs
curl -X POST http://localhost:3000/api/v1/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d @demo_job_data.json
```

### **Demo Scenario 2: AI Matching**
```bash
# Trigger AI matching for demo
curl -X POST http://localhost:3000/api/v1/matching/candidates \
  -H "Content-Type: application/json" \
  -d '{
    "job_id": "demo-job-123",
    "limit": 5
  }'
```

---

**🎉 These commands will get your iWORKZ platform running for any demo or presentation!**

*Save this file for quick reference during your presentations.*