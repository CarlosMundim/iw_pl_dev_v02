#!/bin/bash

# =============================================================================
# iWORKZ Platform Validation Script
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
VALIDATION_RESULTS="$PROJECT_ROOT/validation_results.json"

# Global counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Functions
print_banner() {
    echo -e "${BLUE}"
    echo "=================================================================="
    echo "         🧪 iWORKZ PLATFORM VALIDATION SUITE 🧪"
    echo "=================================================================="
    echo -e "${NC}"
}

print_section() {
    echo -e "${YELLOW}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASSED_TESTS++))
}

print_failure() {
    echo -e "${RED}❌ $1${NC}"
    ((FAILED_TESTS++))
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

increment_test() {
    ((TOTAL_TESTS++))
}

# Test functions
test_docker_environment() {
    print_section "Testing Docker Environment"
    
    increment_test
    if command -v docker &> /dev/null; then
        print_success "Docker is installed"
    else
        print_failure "Docker is not installed"
        return 1
    fi
    
    increment_test
    if docker info &> /dev/null; then
        print_success "Docker daemon is running"
    else
        print_failure "Docker daemon is not running"
        return 1
    fi
    
    increment_test
    if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
        print_success "Docker Compose is available"
    else
        print_failure "Docker Compose is not available"
        return 1
    fi
    
    echo ""
}

test_environment_config() {
    print_section "Testing Environment Configuration"
    
    cd "$PROJECT_ROOT"
    
    increment_test
    if [[ -f ".env" ]]; then
        print_success ".env file exists"
    else
        print_warning ".env file not found, using .env.example"
        if [[ -f ".env.example" ]]; then
            cp ".env.example" ".env"
            print_info "Created .env from .env.example"
        else
            print_failure ".env.example not found"
            return 1
        fi
    fi
    
    increment_test
    if [[ -f "docker-compose.yml" ]]; then
        print_success "docker-compose.yml exists"
    else
        print_failure "docker-compose.yml not found"
        return 1
    fi
    
    echo ""
}

test_service_containers() {
    print_section "Testing Service Container Status"
    
    cd "$PROJECT_ROOT"
    
    # Define all expected services
    local services=(
        "postgres"
        "redis"
        "mongo"
        "elasticsearch"
        "backend-api"
        "ai-agent"
        "web-frontend"
        "admin-dashboard"
        "matching-engine"
        "compliance-engine"
        "analytics-service"
        "integration-hub"
        "voice-assistant"
        "notification-service"
        "search-service"
        "credential-engine"
        "investors-website"
    )
    
    print_info "Checking container status for ${#services[@]} services..."
    
    for service in "${services[@]}"; do
        increment_test
        if docker-compose ps "$service" 2>/dev/null | grep -q "Up"; then
            print_success "Service $service is running"
        else
            print_failure "Service $service is not running"
        fi
    done
    
    echo ""
}

test_infrastructure_health() {
    print_section "Testing Infrastructure Health"
    
    # PostgreSQL
    increment_test
    if docker-compose exec -T postgres pg_isready -U postgres &>/dev/null; then
        print_success "PostgreSQL is healthy"
    else
        print_failure "PostgreSQL health check failed"
    fi
    
    # Redis
    increment_test
    if docker-compose exec -T redis redis-cli ping 2>/dev/null | grep -q "PONG"; then
        print_success "Redis is healthy"
    else
        print_failure "Redis health check failed"
    fi
    
    # MongoDB
    increment_test
    if docker-compose exec -T mongo mongosh --eval "db.adminCommand('ping')" &>/dev/null; then
        print_success "MongoDB is healthy"
    else
        print_failure "MongoDB health check failed"
    fi
    
    # Elasticsearch
    increment_test
    if curl -s --max-time 10 "http://localhost:9200/_cluster/health" | grep -q "yellow\|green"; then
        print_success "Elasticsearch is healthy"
    else
        print_failure "Elasticsearch health check failed"
    fi
    
    echo ""
}

test_service_endpoints() {
    print_section "Testing Service HTTP Endpoints"
    
    # Define service endpoints
    declare -A endpoints=(
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
    
    for service in "${!endpoints[@]}"; do
        increment_test
        local url="${endpoints[$service]}"
        local response_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")
        
        if [[ "$response_code" =~ ^(200|201|204)$ ]]; then
            print_success "$service endpoint responding (HTTP $response_code)"
        elif [[ "$response_code" =~ ^(3[0-9][0-9])$ ]]; then
            print_warning "$service endpoint redirecting (HTTP $response_code)"
        else
            print_failure "$service endpoint not responding (HTTP $response_code) at $url"
        fi
    done
    
    echo ""
}

test_api_functionality() {
    print_section "Testing Core API Functionality"
    
    local base_url="http://localhost:3001"
    
    # Test health endpoint with detailed response
    increment_test
    local health_response=$(curl -s --max-time 10 "$base_url/health" 2>/dev/null || echo "{}")
    if echo "$health_response" | grep -q '"status":\s*"healthy"'; then
        print_success "Backend API health endpoint returns healthy status"
    else
        print_failure "Backend API health endpoint not returning healthy status"
    fi
    
    # Test API documentation endpoint
    increment_test
    local docs_response_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$base_url/docs" 2>/dev/null || echo "000")
    if [[ "$docs_response_code" == "200" ]]; then
        print_success "Backend API documentation available"
    else
        print_failure "Backend API documentation not available"
    fi
    
    echo ""
}

test_ai_services() {
    print_section "Testing AI Services Integration"
    
    local ai_base_url="http://localhost:8001"
    
    # Test AI Agent health
    increment_test
    local ai_health=$(curl -s --max-time 10 "$ai_base_url/health" 2>/dev/null || echo "{}")
    if echo "$ai_health" | grep -q '"status":\s*"healthy"'; then
        print_success "AI Agent health endpoint responding"
    else
        print_failure "AI Agent health endpoint not responding"
    fi
    
    # Test AI Agent docs
    increment_test
    local ai_docs_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$ai_base_url/docs" 2>/dev/null || echo "000")
    if [[ "$ai_docs_code" == "200" ]]; then
        print_success "AI Agent documentation available"
    else
        print_failure "AI Agent documentation not available"
    fi
    
    echo ""
}

test_database_connectivity() {
    print_section "Testing Database Connectivity"
    
    # Test PostgreSQL connection
    increment_test
    if docker-compose exec -T postgres psql -U postgres -d iworkz_platform -c "SELECT 1;" &>/dev/null; then
        print_success "PostgreSQL database connection working"
    else
        print_failure "PostgreSQL database connection failed"
    fi
    
    # Test Redis connection
    increment_test
    if docker-compose exec -T redis redis-cli set test_key "test_value" &>/dev/null; then
        print_success "Redis database connection working"
        docker-compose exec -T redis redis-cli del test_key &>/dev/null
    else
        print_failure "Redis database connection failed"
    fi
    
    # Test MongoDB connection
    increment_test
    if docker-compose exec -T mongo mongosh iworkz_credentials --eval "db.test.insertOne({test: 'data'})" &>/dev/null; then
        print_success "MongoDB database connection working"
        docker-compose exec -T mongo mongosh iworkz_credentials --eval "db.test.deleteMany({})" &>/dev/null
    else
        print_failure "MongoDB database connection failed"
    fi
    
    echo ""
}

test_search_functionality() {
    print_section "Testing Search Service"
    
    local search_url="http://localhost:8007"
    
    # Test search service status
    increment_test
    local search_status=$(curl -s --max-time 10 "$search_url/status" 2>/dev/null || echo "{}")
    if echo "$search_status" | grep -q '"status":\s*"operational"'; then
        print_success "Search service operational"
    else
        print_failure "Search service not operational"
    fi
    
    # Test Elasticsearch connectivity
    increment_test
    if echo "$search_status" | grep -q '"elasticsearch"'; then
        print_success "Search service connected to Elasticsearch"
    else
        print_failure "Search service not connected to Elasticsearch"
    fi
    
    echo ""
}

test_blockchain_services() {
    print_section "Testing Blockchain Services"
    
    local credential_url="http://localhost:8008"
    
    # Test credential engine status
    increment_test
    local cred_status=$(curl -s --max-time 10 "$credential_url/status" 2>/dev/null || echo "{}")
    if echo "$cred_status" | grep -q '"status":\s*"operational"'; then
        print_success "Credential engine operational"
    else
        print_failure "Credential engine not operational"
    fi
    
    # Test blockchain connectivity
    increment_test
    if echo "$cred_status" | grep -q '"blockchain"'; then
        print_success "Credential engine blockchain configuration loaded"
    else
        print_failure "Credential engine blockchain configuration missing"
    fi
    
    echo ""
}

test_notification_services() {
    print_section "Testing Notification Services"
    
    local notification_url="http://localhost:8006"
    
    # Test notification service status
    increment_test
    local notif_status=$(curl -s --max-time 10 "$notification_url/status" 2>/dev/null || echo "{}")
    if echo "$notif_status" | grep -q '"status":\s*"operational"'; then
        print_success "Notification service operational"
    else
        print_failure "Notification service not operational"
    fi
    
    echo ""
}

test_frontend_services() {
    print_section "Testing Frontend Services"
    
    # Test main web frontend
    increment_test
    local frontend_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "http://localhost:3000" 2>/dev/null || echo "000")
    if [[ "$frontend_code" == "200" ]]; then
        print_success "Web frontend responding"
    else
        print_failure "Web frontend not responding"
    fi
    
    # Test admin dashboard
    increment_test
    local admin_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "http://localhost:3002" 2>/dev/null || echo "000")
    if [[ "$admin_code" == "200" ]]; then
        print_success "Admin dashboard responding"
    else
        print_failure "Admin dashboard not responding"
    fi
    
    # Test investors website
    increment_test
    local investors_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "http://localhost:3005" 2>/dev/null || echo "000")
    if [[ "$investors_code" == "200" ]]; then
        print_success "Investors website responding"
    else
        print_failure "Investors website not responding"
    fi
    
    echo ""
}

generate_validation_report() {
    print_section "Generating Validation Report"
    
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    local success_rate=$(( PASSED_TESTS * 100 / TOTAL_TESTS ))
    
    cat > "$VALIDATION_RESULTS" << EOF
{
  "validation_timestamp": "$timestamp",
  "platform_version": "1.0.0",
  "total_tests": $TOTAL_TESTS,
  "passed_tests": $PASSED_TESTS,
  "failed_tests": $FAILED_TESTS,
  "success_rate": $success_rate,
  "status": "$([ $FAILED_TESTS -eq 0 ] && echo "PASS" || echo "FAIL")",
  "environment": {
    "docker_version": "$(docker --version 2>/dev/null || echo 'Unknown')",
    "compose_version": "$(docker-compose --version 2>/dev/null || echo 'Unknown')",
    "platform": "$(uname -s)",
    "architecture": "$(uname -m)"
  },
  "services_tested": [
    "postgres", "redis", "mongo", "elasticsearch",
    "backend-api", "ai-agent", "web-frontend", "admin-dashboard",
    "matching-engine", "compliance-engine", "analytics-service",
    "integration-hub", "voice-assistant", "notification-service",
    "search-service", "credential-engine", "investors-website"
  ]
}
EOF
    
    print_success "Validation report saved to: $VALIDATION_RESULTS"
    echo ""
}

show_final_results() {
    print_section "🏁 Validation Complete!"
    
    echo "Test Results Summary:"
    echo "  📊 Total Tests: $TOTAL_TESTS"
    echo "  ✅ Passed: $PASSED_TESTS"
    echo "  ❌ Failed: $FAILED_TESTS"
    echo "  📈 Success Rate: $(( PASSED_TESTS * 100 / TOTAL_TESTS ))%"
    echo ""
    
    if [[ $FAILED_TESTS -eq 0 ]]; then
        echo -e "${GREEN}🎉 ALL TESTS PASSED! Platform is fully operational.${NC}"
        echo ""
        echo "Platform Access URLs:"
        echo "  🌐 Web Frontend:        http://localhost:3000"
        echo "  🔧 Admin Dashboard:     http://localhost:3002"
        echo "  📊 Investors Website:   http://localhost:3005"
        echo "  🔌 Backend API:         http://localhost:3001/docs"
        echo "  🤖 AI Agent:           http://localhost:8001/docs"
        echo ""
        echo "The platform is ready for stakeholder demonstrations! 🚀"
    else
        echo -e "${RED}⚠️  Some tests failed. Platform may not be fully operational.${NC}"
        echo ""
        echo "Troubleshooting:"
        echo "  1. Check failed services: docker-compose logs [service-name]"
        echo "  2. Restart platform: ./scripts/stop-platform.sh && ./scripts/start-platform.sh"
        echo "  3. Check environment: review .env configuration"
        echo ""
    fi
    
    echo "Detailed report: $VALIDATION_RESULTS"
    echo ""
}

# Main execution
main() {
    print_banner
    
    # Check if platform is running
    if ! docker-compose ps | grep -q "Up"; then
        print_info "Platform appears to be stopped. Starting platform first..."
        "$SCRIPT_DIR/start-platform.sh" --skip-cleanup
        sleep 30  # Give services time to stabilize
    fi
    
    # Run all validation tests
    test_docker_environment
    test_environment_config
    test_service_containers
    test_infrastructure_health
    test_service_endpoints
    test_api_functionality
    test_ai_services
    test_database_connectivity
    test_search_functionality
    test_blockchain_services
    test_notification_services
    test_frontend_services
    
    # Generate report and show results
    generate_validation_report
    show_final_results
}

# Handle errors gracefully
trap 'echo -e "${RED}Validation interrupted${NC}"' INT

# Execute main function
main "$@"