#!/bin/bash

# iWORKZ Platform - Infrastructure Test Script
# This script validates the development setup

set -e

echo "🚀 iWORKZ Platform - Development Setup Validation"
echo "================================================="

# Check if Docker is available
echo "📦 Checking Docker availability..."
if command -v docker &> /dev/null; then
    echo "✅ Docker found: $(docker --version)"
    
    # Check if Docker is running
    if docker info &> /dev/null; then
        echo "✅ Docker daemon is running"
    else
        echo "❌ Docker daemon is not running. Please start Docker Desktop."
        exit 1
    fi
else
    echo "❌ Docker not found. Please install Docker Desktop and enable WSL integration."
    echo "   See: 0_ENV_SETUP/DOCKER_SETUP.md"
    exit 1
fi

# Check environment file
echo ""
echo "🔧 Checking environment configuration..."
if [ -f ".env.local" ]; then
    echo "✅ .env.local file exists"
else
    echo "⚠️  .env.local not found. Creating from template..."
    cp .env.example .env.local
    echo "✅ Created .env.local from .env.example"
    echo "   Please review and update the values as needed."
fi

# Validate project structure
echo ""
echo "📁 Checking project structure..."

required_dirs=(
    "2_SERVICES/backend-api"
    "2_SERVICES/web-frontend"
    "2_SERVICES/db-postgres"
    "2_SERVICES/redis"
    "2_SERVICES/ai-agent"
)

for dir in "${required_dirs[@]}"; do
    if [ -d "$dir" ]; then
        echo "✅ $dir exists"
    else
        echo "❌ $dir not found"
        exit 1
    fi
done

# Check required files
echo ""
echo "📄 Checking required configuration files..."

required_files=(
    "docker-compose.yml"
    "2_SERVICES/backend-api/package.json"
    "2_SERVICES/web-frontend/package.json"
    "2_SERVICES/db-postgres/init/01_create_database.sql"
    "2_SERVICES/redis/redis.conf"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file not found"
        exit 1
    fi
done

# Test Docker Compose configuration
echo ""
echo "🐳 Validating Docker Compose configuration..."
if docker compose config &> /dev/null; then
    echo "✅ docker-compose.yml is valid"
else
    echo "❌ docker-compose.yml has configuration errors"
    docker compose config
    exit 1
fi

# Check Node.js in services
echo ""
echo "📦 Checking Node.js dependencies..."

# Backend API
if [ -d "2_SERVICES/backend-api/node_modules" ]; then
    echo "✅ Backend API dependencies installed"
else
    echo "⚠️  Backend API dependencies not installed"
    echo "   Run: cd 2_SERVICES/backend-api && npm install"
fi

# Web Frontend
if [ -d "2_SERVICES/web-frontend/node_modules" ]; then
    echo "✅ Web Frontend dependencies installed"
else
    echo "⚠️  Web Frontend dependencies not installed"
    echo "   Run: cd 2_SERVICES/web-frontend && npm install"
fi

# Test database initialization scripts
echo ""
echo "🗄️  Validating database scripts..."
if grep -q "CREATE DATABASE iworkz_dev" 2_SERVICES/db-postgres/init/01_create_database.sql; then
    echo "✅ Database initialization script looks correct"
else
    echo "❌ Database initialization script may have issues"
fi

echo ""
echo "🎉 Setup validation complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Review .env.local and update API keys if needed"
echo "2. Install dependencies: cd 2_SERVICES/backend-api && npm install"
echo "3. Install dependencies: cd 2_SERVICES/web-frontend && npm install"
echo "4. Start infrastructure: docker compose up -d postgres redis"
echo "5. Start API: cd 2_SERVICES/backend-api && npm run dev"
echo "6. Start frontend: cd 2_SERVICES/web-frontend && npm run dev"
echo ""
echo "🌐 Access points once running:"
echo "   - Web Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:8000/api"
echo "   - API Health: http://localhost:8000/health"
echo "   - PgAdmin (dev tools): http://localhost:5050"
echo ""
echo "📚 Documentation: See 1_DOCUMENTATION/ for detailed guides"