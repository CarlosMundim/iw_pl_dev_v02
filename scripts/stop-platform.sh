#!/bin/bash

# =============================================================================
# iWORKZ Platform Stop Script
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

# Functions
print_banner() {
    echo -e "${BLUE}"
    echo "=================================================================="
    echo "            🛑 iWORKZ PLATFORM STOP SCRIPT 🛑"
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

graceful_stop() {
    print_section "Stopping Platform Services Gracefully"
    
    cd "$PROJECT_ROOT"
    
    print_info "Stopping frontend services..."
    docker-compose stop web-frontend admin-dashboard investors-website 2>/dev/null || true
    
    print_info "Stopping microservices..."
    docker-compose stop \
        matching-engine \
        compliance-engine \
        analytics-service \
        integration-hub \
        voice-assistant \
        notification-service \
        search-service \
        credential-engine 2>/dev/null || true
    
    print_info "Stopping core services..."
    docker-compose stop backend-api ai-agent 2>/dev/null || true
    
    print_info "Stopping infrastructure services..."
    docker-compose stop postgres redis mongo elasticsearch 2>/dev/null || true
    
    print_success "All services stopped gracefully"
    echo ""
}

force_stop() {
    print_section "Force Stopping All Services"
    
    cd "$PROJECT_ROOT"
    
    print_info "Killing all platform containers..."
    docker-compose kill 2>/dev/null || true
    
    print_info "Removing containers..."
    docker-compose down --remove-orphans 2>/dev/null || true
    
    print_success "All services force stopped"
    echo ""
}

cleanup_resources() {
    print_section "Cleaning Up Resources"
    
    # Clean up orphaned containers
    print_info "Removing orphaned containers..."
    docker container prune -f 2>/dev/null || true
    
    # Clean up orphaned networks
    print_info "Removing orphaned networks..."
    docker network prune -f 2>/dev/null || true
    
    # Clean up orphaned volumes (optional - commented out to preserve data)
    # print_info "Removing orphaned volumes..."
    # docker volume prune -f 2>/dev/null || true
    
    print_success "Resource cleanup completed"
    echo ""
}

show_status() {
    print_section "Platform Status"
    
    cd "$PROJECT_ROOT"
    
    # Check if any platform containers are still running
    RUNNING_CONTAINERS=$(docker-compose ps -q 2>/dev/null | wc -l)
    
    if [ "$RUNNING_CONTAINERS" -eq 0 ]; then
        print_success "All platform services are stopped"
    else
        print_info "Some containers may still be running:"
        docker-compose ps 2>/dev/null || true
    fi
    
    echo ""
}

remove_data() {
    print_section "Removing All Data (Volumes)"
    
    cd "$PROJECT_ROOT"
    
    print_info "This will permanently delete all data including:"
    print_info "- Database data"
    print_info "- Uploaded files"
    print_info "- Search indices"
    print_info "- Voice models"
    
    read -p "Are you sure you want to delete all data? (yes/no): " confirm
    
    if [[ $confirm == "yes" ]]; then
        print_info "Removing all volumes..."
        docker-compose down -v 2>/dev/null || true
        docker volume prune -f 2>/dev/null || true
        print_success "All data removed"
    else
        print_info "Data removal cancelled"
    fi
    
    echo ""
}

show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --force        Force stop all services (skip graceful shutdown)"
    echo "  --remove-data  Remove all persistent data (dangerous!)"
    echo "  --help         Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                 # Graceful stop"
    echo "  $0 --force         # Force stop"
    echo "  $0 --remove-data   # Stop and remove all data"
    echo ""
}

# Main execution
main() {
    print_banner
    
    # Parse command line arguments
    FORCE_STOP=false
    REMOVE_DATA=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --force)
                FORCE_STOP=true
                shift
                ;;
            --remove-data)
                REMOVE_DATA=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Check if Docker is available
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed."
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running."
        exit 1
    fi
    
    # Execute stop sequence
    if [[ "$FORCE_STOP" == "true" ]]; then
        force_stop
    else
        graceful_stop
    fi
    
    cleanup_resources
    
    if [[ "$REMOVE_DATA" == "true" ]]; then
        remove_data
    fi
    
    show_status
    
    print_success "Platform shutdown completed!"
    echo ""
    echo "To start the platform again: ./scripts/start-platform.sh"
    echo ""
}

# Handle errors
trap 'print_error "An error occurred during shutdown"' ERR

# Execute main function
main "$@"