#!/bin/bash

# iWORKZ Platform Deployment Script
# Comprehensive deployment automation for production environment

set -euo pipefail

# ============================================
# CONFIGURATION
# ============================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
CONFIG_FILE="${SCRIPT_DIR}/deploy.config"

# Default values
ENVIRONMENT="staging"
VERSION="latest"
NAMESPACE="iworkz-prod"
DRY_RUN=false
VERBOSE=false
SKIP_TESTS=false
FORCE_REBUILD=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================
# UTILITY FUNCTIONS
# ============================================
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Print usage information
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Deploy the iWORKZ platform to the specified environment.

OPTIONS:
    -e, --environment ENV    Target environment (staging, production) [default: staging]
    -v, --version VERSION    Version tag to deploy [default: latest]
    -n, --namespace NS       Kubernetes namespace [default: iworkz-prod]
    -d, --dry-run           Perform a dry run without making changes
    -f, --force-rebuild     Force rebuild of all Docker images
    -s, --skip-tests        Skip running tests before deployment
    --verbose               Enable verbose output
    -h, --help              Show this help message

EXAMPLES:
    $0 -e staging -v 1.2.3
    $0 -e production -v 2.0.0 --force-rebuild
    $0 --dry-run --verbose

EOF
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -e|--environment)
                ENVIRONMENT="$2"
                shift 2
                ;;
            -v|--version)
                VERSION="$2"
                shift 2
                ;;
            -n|--namespace)
                NAMESPACE="$2"
                shift 2
                ;;
            -d|--dry-run)
                DRY_RUN=true
                shift
                ;;
            -f|--force-rebuild)
                FORCE_REBUILD=true
                shift
                ;;
            -s|--skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            --verbose)
                VERBOSE=true
                shift
                ;;
            -h|--help)
                usage
                exit 0
                ;;
            *)
                error "Unknown option: $1"
                ;;
        esac
    done
}

# Load configuration
load_config() {
    if [[ -f "$CONFIG_FILE" ]]; then
        source "$CONFIG_FILE"
        log "Configuration loaded from $CONFIG_FILE"
    else
        warn "Configuration file not found: $CONFIG_FILE"
    fi
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check required tools
    local tools=("docker" "kubectl" "helm" "jq")
    for tool in "${tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            error "$tool is required but not installed"
        fi
    done
    
    # Check Docker daemon
    if ! docker info &> /dev/null; then
        error "Docker daemon is not running"
    fi
    
    # Check Kubernetes connection
    if ! kubectl cluster-info &> /dev/null; then
        error "Cannot connect to Kubernetes cluster"
    fi
    
    # Verify namespace exists
    if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
        warn "Namespace $NAMESPACE does not exist, creating it..."
        if [[ "$DRY_RUN" == "false" ]]; then
            kubectl create namespace "$NAMESPACE"
        fi
    fi
    
    log "Prerequisites check completed successfully"
}

# Validate environment configuration
validate_environment() {
    log "Validating environment configuration for: $ENVIRONMENT"
    
    case $ENVIRONMENT in
        staging|production)
            ;;
        *)
            error "Invalid environment: $ENVIRONMENT. Must be 'staging' or 'production'"
            ;;
    esac
    
    # Check required environment variables
    local required_vars=()
    case $ENVIRONMENT in
        production)
            required_vars=("POSTGRES_PASSWORD" "REDIS_PASSWORD" "JWT_SECRET" "SENDGRID_API_KEY")
            ;;
        staging)
            required_vars=("POSTGRES_PASSWORD" "REDIS_PASSWORD" "JWT_SECRET")
            ;;
    esac
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            error "Required environment variable $var is not set"
        fi
    done
    
    log "Environment validation completed"
}

# Run tests
run_tests() {
    if [[ "$SKIP_TESTS" == "true" ]]; then
        warn "Skipping tests as requested"
        return 0
    fi
    
    log "Running test suite..."
    
    # Unit tests
    info "Running unit tests..."
    if [[ "$DRY_RUN" == "false" ]]; then
        npm test --prefix="$PROJECT_ROOT"
    fi
    
    # Integration tests
    info "Running integration tests..."
    if [[ "$DRY_RUN" == "false" ]]; then
        npm run test:integration --prefix="$PROJECT_ROOT"
    fi
    
    # Security scan
    info "Running security scan..."
    if [[ "$DRY_RUN" == "false" ]]; then
        npm audit --audit-level high --prefix="$PROJECT_ROOT"
    fi
    
    log "All tests passed successfully"
}

# Build Docker images
build_images() {
    log "Building Docker images..."
    
    local services=(
        "backend-api"
        "ai-agent"
        "web-frontend"
        "admin-dashboard"
        "analytics-service"
        "compliance-engine"
        "credential-engine"
        "matching-engine"
        "notification-service"
        "search"
    )
    
    for service in "${services[@]}"; do
        info "Building $service..."
        
        local image_tag="iworkz/$service:$VERSION"
        local dockerfile="$PROJECT_ROOT/2_SERVICES/$service/Dockerfile"
        
        if [[ ! -f "$dockerfile" ]]; then
            # Use multi-service Dockerfile
            dockerfile="$PROJECT_ROOT/4_DEPLOYMENT/docker/Dockerfile.multi-service"
        fi
        
        if [[ "$DRY_RUN" == "false" ]]; then
            docker build \
                -f "$dockerfile" \
                --build-arg SERVICE_NAME="$service" \
                --build-arg BUILD_VERSION="$VERSION" \
                --build-arg BUILD_DATE="$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
                --build-arg GIT_COMMIT="$(git rev-parse HEAD)" \
                -t "$image_tag" \
                "$PROJECT_ROOT"
        fi
        
        info "Built $image_tag"
    done
    
    log "Docker images built successfully"
}

# Push images to registry
push_images() {
    log "Pushing images to registry..."
    
    local services=(
        "backend-api"
        "ai-agent"
        "web-frontend"
        "admin-dashboard"
        "analytics-service"
        "compliance-engine"
        "credential-engine"
        "matching-engine"
        "notification-service"
        "search"
    )
    
    for service in "${services[@]}"; do
        local image_tag="iworkz/$service:$VERSION"
        info "Pushing $image_tag..."
        
        if [[ "$DRY_RUN" == "false" ]]; then
            docker push "$image_tag"
        fi
    done
    
    log "Images pushed successfully"
}

# Deploy infrastructure
deploy_infrastructure() {
    log "Deploying infrastructure components..."
    
    # Deploy secrets
    info "Deploying secrets..."
    if [[ "$DRY_RUN" == "false" ]]; then
        kubectl apply -f "$PROJECT_ROOT/4_DEPLOYMENT/kubernetes/secrets.yaml" -n "$NAMESPACE"
    fi
    
    # Deploy ConfigMaps
    info "Deploying ConfigMaps..."
    if [[ "$DRY_RUN" == "false" ]]; then
        kubectl apply -f "$PROJECT_ROOT/4_DEPLOYMENT/kubernetes/configmaps.yaml" -n "$NAMESPACE"
    fi
    
    # Deploy databases
    info "Deploying databases..."
    if [[ "$DRY_RUN" == "false" ]]; then
        kubectl apply -f "$PROJECT_ROOT/4_DEPLOYMENT/kubernetes/deployments/postgres.yaml" -n "$NAMESPACE"
        kubectl apply -f "$PROJECT_ROOT/4_DEPLOYMENT/kubernetes/deployments/redis.yaml" -n "$NAMESPACE"
    fi
    
    # Wait for databases to be ready
    info "Waiting for databases to be ready..."
    if [[ "$DRY_RUN" == "false" ]]; then
        kubectl wait --for=condition=ready pod -l app=postgres -n "$NAMESPACE" --timeout=300s
        kubectl wait --for=condition=ready pod -l app=redis -n "$NAMESPACE" --timeout=300s
    fi
    
    log "Infrastructure deployed successfully"
}

# Deploy applications
deploy_applications() {
    log "Deploying application services..."
    
    local services=(
        "backend-api"
        "ai-agent"
        "web-frontend"
        "admin-dashboard"
        "analytics-service"
        "compliance-engine"
        "credential-engine"
        "matching-engine"
        "notification-service"
        "search"
    )
    
    for service in "${services[@]}"; do
        info "Deploying $service..."
        
        # Update image tag in deployment
        local deployment_file="$PROJECT_ROOT/4_DEPLOYMENT/kubernetes/deployments/$service.yaml"
        
        if [[ -f "$deployment_file" ]]; then
            if [[ "$DRY_RUN" == "false" ]]; then
                # Replace image tag
                sed -i.bak "s|image: iworkz/$service:.*|image: iworkz/$service:$VERSION|g" "$deployment_file"
                
                # Apply deployment
                kubectl apply -f "$deployment_file" -n "$NAMESPACE"
                
                # Restore original file
                mv "$deployment_file.bak" "$deployment_file"
            fi
        else
            warn "Deployment file not found for $service: $deployment_file"
        fi
    done
    
    # Deploy services
    info "Deploying Kubernetes services..."
    if [[ "$DRY_RUN" == "false" ]]; then
        kubectl apply -f "$PROJECT_ROOT/4_DEPLOYMENT/kubernetes/services/" -n "$NAMESPACE"
    fi
    
    # Deploy ingress
    info "Deploying ingress..."
    if [[ "$DRY_RUN" == "false" ]]; then
        kubectl apply -f "$PROJECT_ROOT/4_DEPLOYMENT/kubernetes/ingress.yaml" -n "$NAMESPACE"
    fi
    
    log "Applications deployed successfully"
}

# Wait for deployment
wait_for_deployment() {
    log "Waiting for deployment to complete..."
    
    local services=(
        "backend-api"
        "ai-agent"
        "web-frontend"
        "admin-dashboard"
    )
    
    for service in "${services[@]}"; do
        info "Waiting for $service to be ready..."
        
        if [[ "$DRY_RUN" == "false" ]]; then
            kubectl wait --for=condition=available deployment/$service -n "$NAMESPACE" --timeout=600s
        fi
    done
    
    log "All services are ready"
}

# Run health checks
run_health_checks() {
    log "Running health checks..."
    
    local services=(
        "backend-api"
        "ai-agent"
        "web-frontend"
    )
    
    for service in "${services[@]}"; do
        info "Health check for $service..."
        
        if [[ "$DRY_RUN" == "false" ]]; then
            # Get service endpoint
            local service_url=$(kubectl get service $service -n "$NAMESPACE" -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
            
            if [[ -n "$service_url" ]]; then
                # Perform health check
                if curl -f "http://$service_url/health" &> /dev/null; then
                    info "$service health check passed"
                else
                    warn "$service health check failed"
                fi
            else
                warn "Could not determine URL for $service"
            fi
        fi
    done
    
    log "Health checks completed"
}

# Deploy monitoring
deploy_monitoring() {
    log "Deploying monitoring stack..."
    
    if [[ "$DRY_RUN" == "false" ]]; then
        # Deploy Prometheus
        helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
            --namespace "$NAMESPACE" \
            --values "$PROJECT_ROOT/4_DEPLOYMENT/monitoring/prometheus/values.yaml"
        
        # Deploy custom dashboards
        kubectl apply -f "$PROJECT_ROOT/4_DEPLOYMENT/monitoring/grafana/dashboards/" -n "$NAMESPACE"
    fi
    
    log "Monitoring stack deployed successfully"
}

# Cleanup old deployments
cleanup() {
    log "Cleaning up old resources..."
    
    if [[ "$DRY_RUN" == "false" ]]; then
        # Remove unused images
        docker image prune -f
        
        # Clean up old ReplicaSets
        kubectl delete replicaset --all -n "$NAMESPACE"
    fi
    
    log "Cleanup completed"
}

# Send deployment notification
send_notification() {
    log "Sending deployment notification..."
    
    local status="SUCCESS"
    local message="iWORKZ platform deployed successfully to $ENVIRONMENT (version: $VERSION)"
    
    if [[ "$DRY_RUN" == "false" ]] && [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$message\"}" \
            "$SLACK_WEBHOOK_URL"
    fi
    
    log "Deployment notification sent"
}

# Main deployment function
main() {
    log "Starting iWORKZ platform deployment"
    log "Environment: $ENVIRONMENT"
    log "Version: $VERSION"
    log "Namespace: $NAMESPACE"
    log "Dry run: $DRY_RUN"
    
    parse_args "$@"
    load_config
    check_prerequisites
    validate_environment
    
    if [[ "$FORCE_REBUILD" == "true" ]] || [[ "$DRY_RUN" == "true" ]]; then
        run_tests
        build_images
        push_images
    fi
    
    deploy_infrastructure
    deploy_applications
    wait_for_deployment
    run_health_checks
    
    if [[ "$ENVIRONMENT" == "production" ]]; then
        deploy_monitoring
    fi
    
    cleanup
    send_notification
    
    log "Deployment completed successfully!"
    info "Access the platform at: https://app.iworkz.jp"
}

# Run main function with all arguments
main "$@"