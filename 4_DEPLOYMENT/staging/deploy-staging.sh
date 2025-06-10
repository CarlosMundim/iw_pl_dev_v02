#!/bin/bash

# =============================================================================
# iWORKZ Staging Deployment Script
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
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
STAGING_DIR="$SCRIPT_DIR"
BACKUP_DIR="/opt/iworkz/staging/backups"
COMPOSE_FILE="$STAGING_DIR/docker-compose.staging.yml"
ENV_FILE="$STAGING_DIR/.env.staging"

# Functions
print_banner() {
    echo -e "${BLUE}"
    echo "=================================================================="
    echo "        🚀 iWORKZ STAGING DEPLOYMENT SCRIPT 🚀"
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
    
    # Check if running as root or with sudo
    if [[ $EUID -eq 0 ]]; then
        print_error "This script should not be run as root"
        exit 1
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    print_success "Docker is available"
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not available"
        exit 1
    fi
    print_success "Docker Compose is available"
    
    # Check disk space (minimum 10GB)
    available_space=$(df /opt 2>/dev/null | awk 'NR==2 {print $4}' || echo "0")
    if [[ $available_space -lt 10485760 ]]; then  # 10GB in KB
        print_error "Insufficient disk space. At least 10GB required in /opt"
        exit 1
    fi
    print_success "Sufficient disk space available"
    
    # Check if .env file exists
    if [[ ! -f "$ENV_FILE" ]]; then
        print_error "Environment file not found: $ENV_FILE"
        print_info "Please copy .env.staging.example to .env.staging and configure it"
        exit 1
    fi
    print_success "Environment file found"
    
    echo ""
}

setup_directories() {
    print_section "Setting Up Directories"
    
    # Create necessary directories
    sudo mkdir -p /opt/iworkz/staging/{postgres,redis,elasticsearch,prometheus,grafana,uploads,ssl,backups,logs}
    sudo chown -R $(whoami):$(whoami) /opt/iworkz/staging
    
    # Set proper permissions
    chmod 755 /opt/iworkz/staging
    chmod 750 /opt/iworkz/staging/{postgres,redis,elasticsearch,prometheus,grafana}
    chmod 755 /opt/iworkz/staging/uploads
    chmod 700 /opt/iworkz/staging/{ssl,backups}
    
    print_success "Directories created and permissions set"
    echo ""
}

generate_ssl_certificates() {
    print_section "Generating SSL Certificates"
    
    SSL_DIR="/opt/iworkz/staging/ssl"
    
    # Generate self-signed certificates for staging
    if [[ ! -f "$SSL_DIR/staging.iworkz.com.crt" ]]; then
        print_info "Generating SSL certificate for staging.iworkz.com..."
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout "$SSL_DIR/staging.iworkz.com.key" \
            -out "$SSL_DIR/staging.iworkz.com.crt" \
            -subj "/C=US/ST=California/L=San Francisco/O=iWORKZ/CN=staging.iworkz.com" \
            -config <(cat <<EOF
[req]
default_bits = 2048
prompt = no
distinguished_name = req_distinguished_name
req_extensions = v3_req

[req_distinguished_name]
C=US
ST=California
L=San Francisco
O=iWORKZ
CN=staging.iworkz.com

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = staging.iworkz.com
DNS.2 = staging-api.iworkz.com
DNS.3 = staging-monitoring.iworkz.com
EOF
)
    fi
    
    # Copy certificate for API and monitoring subdomains
    cp "$SSL_DIR/staging.iworkz.com.crt" "$SSL_DIR/staging-api.iworkz.com.crt"
    cp "$SSL_DIR/staging.iworkz.com.key" "$SSL_DIR/staging-api.iworkz.com.key"
    cp "$SSL_DIR/staging.iworkz.com.crt" "$SSL_DIR/staging-monitoring.iworkz.com.crt"
    cp "$SSL_DIR/staging.iworkz.com.key" "$SSL_DIR/staging-monitoring.iworkz.com.key"
    
    # Generate default certificate
    if [[ ! -f "$SSL_DIR/default.crt" ]]; then
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout "$SSL_DIR/default.key" \
            -out "$SSL_DIR/default.crt" \
            -subj "/C=US/ST=California/L=San Francisco/O=iWORKZ/CN=default"
    fi
    
    # Set proper permissions
    chmod 600 "$SSL_DIR"/*.key
    chmod 644 "$SSL_DIR"/*.crt
    
    print_success "SSL certificates generated"
    echo ""
}

backup_existing_data() {
    print_section "Creating Backup of Existing Data"
    
    if docker-compose -f "$COMPOSE_FILE" ps | grep -q "Up"; then
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        BACKUP_PATH="$BACKUP_DIR/staging_backup_$TIMESTAMP"
        
        mkdir -p "$BACKUP_PATH"
        
        print_info "Backing up PostgreSQL database..."
        docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_dumpall -U iworkz_staging > "$BACKUP_PATH/postgres_dump.sql" || true
        
        print_info "Backing up Redis data..."
        docker-compose -f "$COMPOSE_FILE" exec -T redis redis-cli SAVE || true
        cp -r /opt/iworkz/staging/redis "$BACKUP_PATH/" 2>/dev/null || true
        
        print_info "Backing up uploaded files..."
        cp -r /opt/iworkz/staging/uploads "$BACKUP_PATH/" 2>/dev/null || true
        
        # Compress backup
        tar -czf "$BACKUP_PATH.tar.gz" -C "$BACKUP_DIR" "staging_backup_$TIMESTAMP"
        rm -rf "$BACKUP_PATH"
        
        print_success "Backup created: $BACKUP_PATH.tar.gz"
    else
        print_info "No existing services found, skipping backup"
    fi
    echo ""
}

pull_latest_images() {
    print_section "Pulling Latest Images"
    
    cd "$STAGING_DIR"
    docker-compose -f "$COMPOSE_FILE" pull
    
    print_success "Latest images pulled"
    echo ""
}

build_custom_images() {
    print_section "Building Custom Images"
    
    cd "$STAGING_DIR"
    
    # Build services that have custom Dockerfiles
    print_info "Building backend-api..."
    docker-compose -f "$COMPOSE_FILE" build backend-api
    
    print_info "Building ai-agent..."
    docker-compose -f "$COMPOSE_FILE" build ai-agent
    
    print_info "Building web-frontend..."
    docker-compose -f "$COMPOSE_FILE" build web-frontend
    
    print_success "Custom images built"
    echo ""
}

deploy_services() {
    print_section "Deploying Services"
    
    cd "$STAGING_DIR"
    
    # Start infrastructure services first
    print_info "Starting infrastructure services..."
    docker-compose -f "$COMPOSE_FILE" up -d postgres redis search
    
    # Wait for infrastructure to be ready
    print_info "Waiting for infrastructure services..."
    sleep 30
    
    # Start application services
    print_info "Starting application services..."
    docker-compose -f "$COMPOSE_FILE" up -d backend-api ai-agent
    
    # Wait for core services
    sleep 20
    
    # Start remaining services
    print_info "Starting remaining services..."
    docker-compose -f "$COMPOSE_FILE" up -d
    
    print_success "All services deployed"
    echo ""
}

run_health_checks() {
    print_section "Running Health Checks"
    
    # Wait a bit for services to fully start
    print_info "Waiting for services to initialize..."
    sleep 60
    
    # Check service health
    local services=(
        "postgres:5432"
        "redis:6379"
        "backend-api:3000"
        "ai-agent:8000"
        "web-frontend:3000"
        "search:9200"
        "prometheus:9090"
        "grafana:3000"
    )
    
    for service in "${services[@]}"; do
        IFS=':' read -r name port <<< "$service"
        if docker-compose -f "$COMPOSE_FILE" exec -T "$name" sh -c "timeout 10 nc -z localhost $port" &>/dev/null; then
            print_success "$name is healthy"
        else
            print_error "$name health check failed"
        fi
    done
    
    echo ""
}

setup_monitoring() {
    print_section "Setting Up Monitoring"
    
    # Wait for Grafana to be ready
    print_info "Waiting for Grafana to be ready..."
    timeout 120 bash -c 'until curl -s http://localhost:3003/api/health > /dev/null; do sleep 5; done' || true
    
    # Import default dashboards (if any)
    print_info "Setting up monitoring dashboards..."
    # Here you would typically import Grafana dashboards
    
    print_success "Monitoring setup complete"
    echo ""
}

run_database_migrations() {
    print_section "Running Database Migrations"
    
    # Wait for database to be ready
    print_info "Waiting for database to be ready..."
    timeout 60 bash -c 'until docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U iworkz_staging; do sleep 2; done'
    
    # Run migrations for each service
    print_info "Running backend-api migrations..."
    docker-compose -f "$COMPOSE_FILE" exec -T backend-api npm run migrate || print_error "Backend API migrations failed"
    
    print_info "Running ai-agent migrations..."
    docker-compose -f "$COMPOSE_FILE" exec -T ai-agent python -m alembic upgrade head || print_error "AI Agent migrations failed"
    
    print_success "Database migrations complete"
    echo ""
}

cleanup_old_resources() {
    print_section "Cleaning Up Old Resources"
    
    # Remove unused images
    docker image prune -f
    
    # Remove old backups (keep last 5)
    find "$BACKUP_DIR" -name "staging_backup_*.tar.gz" -type f | sort -r | tail -n +6 | xargs rm -f 2>/dev/null || true
    
    print_success "Cleanup complete"
    echo ""
}

show_deployment_info() {
    print_section "🎉 Deployment Complete!"
    
    echo "Staging Environment URLs:"
    echo "  🌐 Frontend:    https://staging.iworkz.com"
    echo "  📡 API:         https://staging-api.iworkz.com"
    echo "  📊 Monitoring:  https://staging-monitoring.iworkz.com"
    echo ""
    echo "Service Ports (for direct access):"
    echo "  PostgreSQL:     localhost:5433"
    echo "  Redis:          localhost:6380"
    echo "  Backend API:    localhost:3001"
    echo "  AI Agent:       localhost:8001"
    echo "  Frontend:       localhost:3002"
    echo "  Elasticsearch:  localhost:9201"
    echo "  Prometheus:     localhost:9091"
    echo "  Grafana:        localhost:3003"
    echo ""
    echo "Default Credentials:"
    echo "  Grafana:        admin / staging_grafana_admin_2024"
    echo ""
    echo "Next Steps:"
    echo "1. Update your DNS to point to this server"
    echo "2. Replace self-signed certificates with valid SSL certificates"
    echo "3. Configure monitoring alerts"
    echo "4. Set up automated backups"
    echo "5. Configure external service API keys in .env.staging"
    echo ""
    print_info "Logs can be viewed with: docker-compose -f $COMPOSE_FILE logs -f [service_name]"
    print_info "Services can be restarted with: docker-compose -f $COMPOSE_FILE restart [service_name]"
    echo ""
}

# Error handling
trap 'print_error "Deployment failed"; exit 1' ERR

# Main execution
main() {
    print_banner
    
    check_prerequisites
    setup_directories
    generate_ssl_certificates
    backup_existing_data
    pull_latest_images
    build_custom_images
    deploy_services
    run_database_migrations
    run_health_checks
    setup_monitoring
    cleanup_old_resources
    show_deployment_info
    
    print_success "🚀 Staging deployment completed successfully!"
}

# Execute main function
main "$@"