#!/bin/bash

# =============================================================================
# iWORKZ Platform Startup Script
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$PROJECT_ROOT/.env"
DOCKER_COMPOSE_FILE="$PROJECT_ROOT/docker-compose.yml"

# Functions
print_banner() {
    echo -e "${BLUE}"
    echo "=================================================================="
    echo "            🚀 iWORKZ PLATFORM STARTUP SCRIPT 🚀"
    echo "=================================================================="
    echo -e "${NC}"
}

print_section() {
    echo -e "${YELLOW}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

check_prerequisites() {
    print_section "Checking Prerequisites"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker Desktop."
        exit 1
    fi
    print_success "Docker is installed"
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed."
        exit 1
    fi
    print_success "Docker Compose is available"
    
    # Check if Docker daemon is running
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running. Please start Docker Desktop."
        exit 1
    fi
    print_success "Docker daemon is running"
    
    echo ""
}

check_environment() {
    print_section "Checking Environment Configuration"
    
    if [ ! -f "$ENV_FILE" ]; then
        print_info "Creating .env file from .env.example"
        cp "$PROJECT_ROOT/.env.example" "$ENV_FILE"
        print_success ".env file created"
        print_info "Please review and update the .env file with your configuration"
    else
        print_success ".env file exists"
    fi
    
    echo ""
}

cleanup_containers() {
    print_section "Cleaning Up Existing Containers"
    
    cd "$PROJECT_ROOT"
    
    # Stop and remove existing containers
    docker-compose down -v --remove-orphans 2>/dev/null || true
    
    # Remove orphaned networks
    docker network prune -f 2>/dev/null || true
    
    print_success "Cleanup completed"
    echo ""
}

start_infrastructure() {
    print_section "Starting Infrastructure Services"
    
    cd "$PROJECT_ROOT"
    
    # Start database services first
    print_info "Starting PostgreSQL..."
    docker-compose up -d postgres
    
    print_info "Starting Redis..."
    docker-compose up -d redis
    
    print_info "Starting MongoDB..."
    docker-compose up -d mongo
    
    print_info "Starting Elasticsearch..."
    docker-compose up -d elasticsearch
    
    # Wait for services to be healthy
    print_info "Waiting for infrastructure services to be ready..."
    
    # Wait for PostgreSQL
    echo -n "Waiting for PostgreSQL"
    while ! docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do
        echo -n "."
        sleep 2
    done
    echo ""
    print_success "PostgreSQL is ready"
    
    # Wait for Redis
    echo -n "Waiting for Redis"
    while ! docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; do
        echo -n "."
        sleep 2
    done
    echo ""
    print_success "Redis is ready"
    
    # Wait for MongoDB
    echo -n "Waiting for MongoDB"
    while ! docker-compose exec -T mongo mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
        echo -n "."
        sleep 2
    done
    echo ""
    print_success "MongoDB is ready"
    
    # Wait for Elasticsearch
    echo -n "Waiting for Elasticsearch"
    while ! curl -s http://localhost:9200/_cluster/health > /dev/null 2>&1; do
        echo -n "."
        sleep 5
    done
    echo ""
    print_success "Elasticsearch is ready"
    
    echo ""
}

start_core_services() {
    print_section "Starting Core Services"
    
    cd "$PROJECT_ROOT"
    
    # Start backend API
    print_info "Starting Backend API..."
    docker-compose up -d backend-api
    
    # Wait for backend API
    echo -n "Waiting for Backend API"
    while ! curl -s http://localhost:3001/health > /dev/null 2>&1; do
        echo -n "."
        sleep 3
    done
    echo ""
    print_success "Backend API is ready"
    
    # Start AI services
    print_info "Starting AI Agent..."
    docker-compose up -d ai-agent
    
    echo -n "Waiting for AI Agent"
    while ! curl -s http://localhost:8001/health > /dev/null 2>&1; do
        echo -n "."
        sleep 3
    done
    echo ""
    print_success "AI Agent is ready"
    
    echo ""
}

start_microservices() {
    print_section "Starting Microservices"
    
    cd "$PROJECT_ROOT"
    
    # Start all microservices
    print_info "Starting Matching Engine..."
    docker-compose up -d matching-engine
    
    print_info "Starting Compliance Engine..."
    docker-compose up -d compliance-engine
    
    print_info "Starting Analytics Service..."
    docker-compose up -d analytics-service
    
    print_info "Starting Integration Hub..."
    docker-compose up -d integration-hub
    
    print_info "Starting Voice Assistant..."
    docker-compose up -d voice-assistant
    
    print_info "Starting Notification Service..."
    docker-compose up -d notification-service
    
    print_info "Starting Search Service..."
    docker-compose up -d search-service
    
    print_info "Starting Credential Engine..."
    docker-compose up -d credential-engine
    
    print_success "Microservices started"
    echo ""
}

start_frontend_services() {
    print_section "Starting Frontend Services"
    
    cd "$PROJECT_ROOT"
    
    # Start frontend services
    print_info "Starting Web Frontend..."
    docker-compose up -d web-frontend
    
    print_info "Starting Admin Dashboard..."
    docker-compose up -d admin-dashboard
    
    print_info "Starting Investors Website..."
    docker-compose up -d investors-website
    
    print_success "Frontend services started"
    echo ""
}

verify_services() {
    print_section "Verifying Service Health"
    
    # Define services and their health check URLs
    declare -A services=(
        ["Backend API"]="http://localhost:3001/health"
        ["AI Agent"]="http://localhost:8001/health"
        ["Web Frontend"]="http://localhost:3000"
        ["Admin Dashboard"]="http://localhost:3002"
        ["Matching Engine"]="http://localhost:3003/health"
        ["Integration Hub"]="http://localhost:3004/health"
        ["Investors Website"]="http://localhost:3005"
        ["Analytics Service"]="http://localhost:8004/health"
        ["Voice Assistant"]="http://localhost:8005/health"
        ["Notification Service"]="http://localhost:8006/health"
        ["Search Service"]="http://localhost:8007/health"
        ["Credential Engine"]="http://localhost:8008/health"
        ["Compliance Engine"]="http://localhost:8003/health"
    )
    
    echo "Service Health Check Results:"
    echo "----------------------------------------"
    
    for service in "${!services[@]}"; do
        url="${services[$service]}"
        if curl -s --max-time 10 "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ $service${NC} - Available at $url"
        else
            echo -e "${RED}❌ $service${NC} - Not responding at $url"
        fi
    done
    
    echo ""
}

show_success_message() {
    print_section "🎉 Platform Started Successfully!"
    
    echo "Platform Services:"
    echo "  🌐 Web Frontend:        http://localhost:3000"
    echo "  🔧 Admin Dashboard:     http://localhost:3002"
    echo "  📊 Investors Website:   http://localhost:3005"
    echo "  🔌 Backend API:         http://localhost:3001"
    echo ""
    echo "Development URLs:"
    echo "  📖 API Documentation:   http://localhost:3001/docs"
    echo "  🤖 AI Agent:           http://localhost:8001/docs"
    echo "  📈 Analytics:          http://localhost:8004/docs"
    echo "  🔍 Search Service:     http://localhost:8007/status"
    echo "  🏛️  Credential Engine:  http://localhost:8008/status"
    echo ""
    echo "Infrastructure:"
    echo "  🗄️  PostgreSQL:         localhost:5432"
    echo "  🔄 Redis:              localhost:6379"
    echo "  🍃 MongoDB:            localhost:27017"
    echo "  🔍 Elasticsearch:      http://localhost:9200"
    echo ""
    echo "To stop the platform: ./scripts/stop-platform.sh"
    echo "To view logs: docker-compose logs -f [service-name]"
    echo ""
}

show_error_message() {
    print_error "Platform startup failed!"
    echo ""
    echo "Troubleshooting steps:"
    echo "1. Check Docker Desktop is running"
    echo "2. Review .env configuration"
    echo "3. Check available disk space and memory"
    echo "4. View logs: docker-compose logs"
    echo "5. Try cleanup: ./scripts/cleanup-platform.sh"
    echo ""
}

# Main execution
main() {
    print_banner
    
    # Check if we should skip cleanup
    SKIP_CLEANUP=false
    if [[ "$1" == "--skip-cleanup" ]]; then
        SKIP_CLEANUP=true
        print_info "Skipping cleanup as requested"
    fi
    
    check_prerequisites
    check_environment
    
    if [[ "$SKIP_CLEANUP" != "true" ]]; then
        cleanup_containers
    fi
    
    start_infrastructure
    start_core_services
    start_microservices
    start_frontend_services
    
    # Give services time to fully start
    print_info "Waiting for all services to stabilize..."
    sleep 10
    
    verify_services
    show_success_message
}

# Handle errors
trap 'show_error_message' ERR

# Execute main function
main "$@"