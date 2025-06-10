#!/bin/bash

# =============================================================================
# Kubernetes Deployment Script for iWORKZ Platform
# =============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE_PLATFORM="iworkz-platform"
NAMESPACE_MONITORING="iworkz-monitoring"
NAMESPACE_INGRESS="iworkz-ingress"
DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Functions
print_header() {
    echo -e "${BLUE}==============================================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}==============================================================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check if kubectl is installed
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed. Please install kubectl first."
    fi
    print_success "kubectl is installed"
    
    # Check if kubectl can connect to cluster
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster. Please check your kubeconfig."
    fi
    print_success "Connected to Kubernetes cluster"
    
    # Check if NGINX Ingress Controller is installed
    if ! kubectl get deployment -n ingress-nginx ingress-nginx-controller &> /dev/null; then
        print_warning "NGINX Ingress Controller not found. Installing..."
        kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml
        
        # Wait for ingress controller to be ready
        print_info "Waiting for NGINX Ingress Controller to be ready..."
        kubectl wait --namespace ingress-nginx \
            --for=condition=ready pod \
            --selector=app.kubernetes.io/component=controller \
            --timeout=300s
    fi
    print_success "NGINX Ingress Controller is ready"
    
    # Check if cert-manager is installed
    if ! kubectl get namespace cert-manager &> /dev/null; then
        print_warning "cert-manager not found. Installing..."
        kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.2/cert-manager.yaml
        
        # Wait for cert-manager to be ready
        print_info "Waiting for cert-manager to be ready..."
        kubectl wait --namespace cert-manager \
            --for=condition=ready pod \
            --selector=app.kubernetes.io/component=controller \
            --timeout=300s
    fi
    print_success "cert-manager is ready"
}

create_namespaces() {
    print_header "Creating Namespaces"
    
    kubectl apply -f "${DEPLOY_DIR}/namespaces.yaml"
    print_success "Namespaces created"
}

create_secrets_and_configs() {
    print_header "Creating Secrets and ConfigMaps"
    
    kubectl apply -f "${DEPLOY_DIR}/secrets.yaml"
    kubectl apply -f "${DEPLOY_DIR}/configmaps.yaml"
    print_success "Secrets and ConfigMaps created"
}

deploy_databases() {
    print_header "Deploying Databases"
    
    # Deploy PostgreSQL
    print_info "Deploying PostgreSQL..."
    kubectl apply -f "${DEPLOY_DIR}/deployments/postgres.yaml"
    
    # Deploy Redis
    print_info "Deploying Redis..."
    kubectl apply -f "${DEPLOY_DIR}/deployments/redis.yaml"
    
    # Wait for databases to be ready
    print_info "Waiting for databases to be ready..."
    kubectl wait --namespace ${NAMESPACE_PLATFORM} \
        --for=condition=ready pod \
        --selector=app.kubernetes.io/name=postgres \
        --timeout=300s
    
    kubectl wait --namespace ${NAMESPACE_PLATFORM} \
        --for=condition=ready pod \
        --selector=app.kubernetes.io/name=redis \
        --timeout=300s
    
    print_success "Databases deployed and ready"
}

deploy_applications() {
    print_header "Deploying Applications"
    
    # Deploy Backend API
    print_info "Deploying Backend API..."
    kubectl apply -f "${DEPLOY_DIR}/deployments/backend-api.yaml"
    
    # Deploy AI Agent
    print_info "Deploying AI Agent..."
    kubectl apply -f "${DEPLOY_DIR}/deployments/ai-agent.yaml"
    
    # Deploy Web Frontend
    print_info "Deploying Web Frontend..."
    kubectl apply -f "${DEPLOY_DIR}/deployments/web-frontend.yaml"
    
    # Wait for applications to be ready
    print_info "Waiting for applications to be ready..."
    kubectl wait --namespace ${NAMESPACE_PLATFORM} \
        --for=condition=ready pod \
        --selector=app.kubernetes.io/name=backend-api \
        --timeout=300s
    
    kubectl wait --namespace ${NAMESPACE_PLATFORM} \
        --for=condition=ready pod \
        --selector=app.kubernetes.io/name=ai-agent \
        --timeout=300s
    
    kubectl wait --namespace ${NAMESPACE_PLATFORM} \
        --for=condition=ready pod \
        --selector=app.kubernetes.io/name=web-frontend \
        --timeout=300s
    
    print_success "Applications deployed and ready"
}

deploy_monitoring() {
    print_header "Deploying Monitoring Stack"
    
    # Deploy Prometheus
    print_info "Deploying Prometheus..."
    kubectl apply -f "${DEPLOY_DIR}/monitoring/prometheus.yaml"
    
    # Deploy Grafana
    print_info "Deploying Grafana..."
    kubectl apply -f "${DEPLOY_DIR}/monitoring/grafana.yaml"
    
    # Deploy AlertManager
    print_info "Deploying AlertManager..."
    kubectl apply -f "${DEPLOY_DIR}/monitoring/alertmanager.yaml"
    
    # Deploy Loki
    print_info "Deploying Loki..."
    kubectl apply -f "${DEPLOY_DIR}/monitoring/loki.yaml"
    
    # Wait for monitoring to be ready
    print_info "Waiting for monitoring stack to be ready..."
    kubectl wait --namespace ${NAMESPACE_MONITORING} \
        --for=condition=ready pod \
        --selector=app.kubernetes.io/name=prometheus \
        --timeout=300s
    
    kubectl wait --namespace ${NAMESPACE_MONITORING} \
        --for=condition=ready pod \
        --selector=app.kubernetes.io/name=grafana \
        --timeout=300s
    
    print_success "Monitoring stack deployed and ready"
}

deploy_ingress() {
    print_header "Deploying Ingress"
    
    kubectl apply -f "${DEPLOY_DIR}/ingress.yaml"
    
    # Wait for ingress to be ready
    print_info "Waiting for ingress to be ready..."
    sleep 30  # Give time for ingress to propagate
    
    print_success "Ingress deployed"
}

verify_deployment() {
    print_header "Verifying Deployment"
    
    # Check all pods are running
    print_info "Checking pod status..."
    kubectl get pods -n ${NAMESPACE_PLATFORM}
    kubectl get pods -n ${NAMESPACE_MONITORING}
    
    # Check services
    print_info "Checking services..."
    kubectl get services -n ${NAMESPACE_PLATFORM}
    kubectl get services -n ${NAMESPACE_MONITORING}
    
    # Check ingress
    print_info "Checking ingress..."
    kubectl get ingress -n ${NAMESPACE_PLATFORM}
    kubectl get ingress -n ${NAMESPACE_MONITORING}
    
    # Get external IP
    external_ip=$(kubectl get service -n ingress-nginx ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "Not available yet")
    
    print_success "Deployment verification complete"
    print_info "External IP: ${external_ip}"
}

show_access_info() {
    print_header "Access Information"
    
    echo -e "${GREEN}Platform URLs:${NC}"
    echo "  • Main Website: https://iworkz.com"
    echo "  • API: https://api.iworkz.com"
    echo "  • Staging: https://staging.iworkz.com"
    echo ""
    echo -e "${GREEN}Monitoring URLs:${NC}"
    echo "  • Grafana: https://monitoring.iworkz.com"
    echo "  • Prometheus: https://monitoring.iworkz.com/prometheus"
    echo ""
    echo -e "${GREEN}Default Credentials:${NC}"
    echo "  • Grafana: admin / iworkz-grafana-2024"
    echo "  • PostgreSQL: iworkz_user / iworkz_secure_password_2024"
    echo "  • Redis: iworkz_redis_secure_password_2024"
    echo ""
    echo -e "${YELLOW}Note: Update DNS records to point your domains to the external IP${NC}"
}

cleanup() {
    print_header "Cleanup"
    read -p "Do you want to delete all resources? [y/N]: " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Deleting all resources..."
        kubectl delete namespace ${NAMESPACE_PLATFORM} --ignore-not-found
        kubectl delete namespace ${NAMESPACE_MONITORING} --ignore-not-found
        print_success "All resources deleted"
    else
        print_info "Cleanup cancelled"
    fi
}

# Main deployment function
deploy_all() {
    print_header "Starting iWORKZ Platform Deployment"
    
    check_prerequisites
    create_namespaces
    create_secrets_and_configs
    deploy_databases
    deploy_applications
    deploy_monitoring
    deploy_ingress
    verify_deployment
    show_access_info
    
    print_header "Deployment Complete!"
    print_success "iWORKZ Platform has been successfully deployed to Kubernetes"
}

# Script usage
usage() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  deploy     Deploy the entire iWORKZ platform"
    echo "  verify     Verify the current deployment"
    echo "  cleanup    Delete all resources"
    echo "  help       Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 deploy    # Deploy everything"
    echo "  $0 verify    # Check deployment status"
    echo "  $0 cleanup   # Delete all resources"
}

# Main script logic
case "${1:-deploy}" in
    "deploy")
        deploy_all
        ;;
    "verify")
        verify_deployment
        show_access_info
        ;;
    "cleanup")
        cleanup
        ;;
    "help"|"-h"|"--help")
        usage
        ;;
    *)
        print_error "Unknown option: $1"
        usage
        exit 1
        ;;
esac