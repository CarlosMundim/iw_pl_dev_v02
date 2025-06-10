#!/bin/bash

# =============================================================================
# iWORKZ Platform Monitoring Stack Startup Script
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
MONITORING_DIR="$PROJECT_ROOT/2_SERVICES/monitoring"

# Functions
print_banner() {
    echo -e "${BLUE}"
    echo "=================================================================="
    echo "        📊 iWORKZ MONITORING STACK STARTUP 📊"
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
    
    # Check if main platform network exists
    if ! docker network inspect iworkz-network &> /dev/null; then
        print_info "Creating iworkz-network..."
        docker network create iworkz-network
    fi
    print_success "iworkz-network is available"
    
    echo ""
}

setup_monitoring_directories() {
    print_section "Setting Up Monitoring Directories"
    
    # Create necessary directories
    mkdir -p "$MONITORING_DIR/prometheus/rules"
    mkdir -p "$MONITORING_DIR/grafana/provisioning/datasources"
    mkdir -p "$MONITORING_DIR/grafana/provisioning/dashboards"
    mkdir -p "$MONITORING_DIR/grafana/dashboards"
    mkdir -p "$MONITORING_DIR/loki"
    mkdir -p "$MONITORING_DIR/promtail"
    mkdir -p "$MONITORING_DIR/alertmanager"
    
    print_success "Monitoring directories created"
    echo ""
}

start_monitoring_stack() {
    print_section "Starting Monitoring Stack"
    
    cd "$MONITORING_DIR"
    
    # Start monitoring services
    print_info "Starting Prometheus..."
    docker-compose -f docker-compose.monitoring.yml up -d prometheus
    
    print_info "Starting Grafana..."
    docker-compose -f docker-compose.monitoring.yml up -d grafana
    
    print_info "Starting Loki..."
    docker-compose -f docker-compose.monitoring.yml up -d loki
    
    print_info "Starting Promtail..."
    docker-compose -f docker-compose.monitoring.yml up -d promtail
    
    print_info "Starting AlertManager..."
    docker-compose -f docker-compose.monitoring.yml up -d alertmanager
    
    print_info "Starting Node Exporter..."
    docker-compose -f docker-compose.monitoring.yml up -d node-exporter
    
    print_info "Starting cAdvisor..."
    docker-compose -f docker-compose.monitoring.yml up -d cadvisor
    
    print_info "Starting Jaeger..."
    docker-compose -f docker-compose.monitoring.yml up -d jaeger
    
    print_info "Starting Uptime Kuma..."
    docker-compose -f docker-compose.monitoring.yml up -d uptime-kuma
    
    print_success "Monitoring stack started"
    echo ""
}

wait_for_services() {
    print_section "Waiting for Services to be Ready"
    
    # Wait for Prometheus
    print_info "Waiting for Prometheus..."
    while ! curl -s http://localhost:9090/-/ready &> /dev/null; do
        echo -n "."
        sleep 2
    done
    echo ""
    print_success "Prometheus is ready"
    
    # Wait for Grafana
    print_info "Waiting for Grafana..."
    while ! curl -s http://localhost:3100/api/health &> /dev/null; do
        echo -n "."
        sleep 2
    done
    echo ""
    print_success "Grafana is ready"
    
    # Wait for Loki
    print_info "Waiting for Loki..."
    while ! curl -s http://localhost:3101/ready &> /dev/null; do
        echo -n "."
        sleep 2
    done
    echo ""
    print_success "Loki is ready"
    
    echo ""
}

show_monitoring_urls() {
    print_section "📊 Monitoring Stack Access URLs"
    
    echo "Monitoring Services:"
    echo "  📈 Prometheus:          http://localhost:9090"
    echo "  📊 Grafana:             http://localhost:3100 (admin/admin123)"
    echo "  📋 Logs (Loki):         http://localhost:3101"
    echo "  🚨 AlertManager:        http://localhost:9093"
    echo "  🖥️  System Metrics:      http://localhost:9100"
    echo "  📦 Container Metrics:   http://localhost:8080"
    echo "  🔍 Distributed Tracing: http://localhost:16686"
    echo "  ⏰ Uptime Monitoring:   http://localhost:3102"
    echo ""
    echo "Key Features:"
    echo "  • Real-time metrics collection and visualization"
    echo "  • Centralized log aggregation and searching"
    echo "  • Automated alerting for critical issues"
    echo "  • Service uptime monitoring"
    echo "  • Distributed request tracing"
    echo "  • Container and system resource monitoring"
    echo ""
}

configure_default_dashboards() {
    print_section "Configuring Default Dashboards"
    
    # Create a basic iWORKZ platform dashboard
    cat > "$MONITORING_DIR/grafana/dashboards/iworkz-platform-overview.json" << 'EOF'
{
  "dashboard": {
    "id": null,
    "title": "iWORKZ Platform Overview",
    "tags": ["iworkz", "platform"],
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "Service Status",
        "type": "stat",
        "targets": [
          {
            "expr": "up",
            "legendFormat": "{{instance}}"
          }
        ],
        "gridPos": {"h": 8, "w": 12, "x": 0, "y": 0}
      },
      {
        "id": 2,
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{instance}}"
          }
        ],
        "gridPos": {"h": 8, "w": 12, "x": 12, "y": 0}
      }
    ],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "refresh": "30s"
  }
}
EOF
    
    print_success "Default dashboards configured"
    echo ""
}

main() {
    print_banner
    
    check_prerequisites
    setup_monitoring_directories
    configure_default_dashboards
    start_monitoring_stack
    wait_for_services
    show_monitoring_urls
    
    print_success "🎉 Monitoring stack is ready!"
    echo ""
    echo "Next steps:"
    echo "1. Visit Grafana at http://localhost:3100 (admin/admin123)"
    echo "2. Import additional dashboards from grafana.com"
    echo "3. Configure alert notifications in AlertManager"
    echo "4. Set up uptime monitors in Uptime Kuma"
    echo ""
}

# Handle errors
trap 'print_error "Monitoring stack startup failed"' ERR

# Execute main function
main "$@"