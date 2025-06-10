#!/bin/bash

# =============================================================================
# iWORKZ Platform Backup Script
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
BACKUP_DIR="$PROJECT_ROOT/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="iworkz_backup_$TIMESTAMP"

# Database credentials (source from .env if available)
if [[ -f "$PROJECT_ROOT/.env" ]]; then
    source "$PROJECT_ROOT/.env"
fi

POSTGRES_USER=${POSTGRES_USER:-postgres}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-password}
POSTGRES_DB=${POSTGRES_DB:-iworkz_platform}
MONGO_ROOT_USERNAME=${MONGO_ROOT_USERNAME:-admin}
MONGO_ROOT_PASSWORD=${MONGO_ROOT_PASSWORD:-password}

# Functions
print_banner() {
    echo -e "${BLUE}"
    echo "=================================================================="
    echo "            💾 iWORKZ PLATFORM BACKUP SCRIPT 💾"
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

create_backup_directory() {
    print_section "Creating Backup Directory"
    
    mkdir -p "$BACKUP_DIR/$BACKUP_NAME"
    
    print_success "Backup directory created: $BACKUP_DIR/$BACKUP_NAME"
    echo ""
}

backup_postgresql() {
    print_section "Backing up PostgreSQL Database"
    
    # Check if PostgreSQL container is running
    if ! docker-compose ps postgres | grep -q "Up"; then
        print_error "PostgreSQL container is not running"
        return 1
    fi
    
    print_info "Dumping PostgreSQL database..."
    
    # Create PostgreSQL backup
    docker-compose exec -T postgres pg_dump \
        -U "$POSTGRES_USER" \
        -d "$POSTGRES_DB" \
        --verbose \
        --clean \
        --if-exists \
        --create \
        --format=custom \
        > "$BACKUP_DIR/$BACKUP_NAME/postgresql_backup.dump"
    
    # Also create a plain SQL backup for easier inspection
    docker-compose exec -T postgres pg_dump \
        -U "$POSTGRES_USER" \
        -d "$POSTGRES_DB" \
        --verbose \
        --clean \
        --if-exists \
        --create \
        > "$BACKUP_DIR/$BACKUP_NAME/postgresql_backup.sql"
    
    print_success "PostgreSQL backup completed"
    echo ""
}

backup_mongodb() {
    print_section "Backing up MongoDB Database"
    
    # Check if MongoDB container is running
    if ! docker-compose ps mongo | grep -q "Up"; then
        print_error "MongoDB container is not running"
        return 1
    fi
    
    print_info "Dumping MongoDB database..."
    
    # Create MongoDB backup directory
    mkdir -p "$BACKUP_DIR/$BACKUP_NAME/mongodb"
    
    # Create MongoDB backup
    docker-compose exec -T mongo mongodump \
        --username "$MONGO_ROOT_USERNAME" \
        --password "$MONGO_ROOT_PASSWORD" \
        --authenticationDatabase admin \
        --db iworkz_credentials \
        --out /tmp/backup
    
    # Copy backup from container
    docker cp "$(docker-compose ps -q mongo):/tmp/backup/." "$BACKUP_DIR/$BACKUP_NAME/mongodb/"
    
    print_success "MongoDB backup completed"
    echo ""
}

backup_redis() {
    print_section "Backing up Redis Data"
    
    # Check if Redis container is running
    if ! docker-compose ps redis | grep -q "Up"; then
        print_error "Redis container is not running"
        return 1
    fi
    
    print_info "Creating Redis backup..."
    
    # Force Redis to save current state
    docker-compose exec -T redis redis-cli BGSAVE
    
    # Wait for background save to complete
    while [ "$(docker-compose exec -T redis redis-cli LASTSAVE)" == "$(docker-compose exec -T redis redis-cli LASTSAVE)" ]; do
        sleep 1
    done
    
    # Copy Redis dump file
    docker cp "$(docker-compose ps -q redis):/data/dump.rdb" "$BACKUP_DIR/$BACKUP_NAME/redis_dump.rdb"
    
    print_success "Redis backup completed"
    echo ""
}

backup_elasticsearch() {
    print_section "Backing up Elasticsearch Indices"
    
    # Check if Elasticsearch container is running
    if ! docker-compose ps elasticsearch | grep -q "Up"; then
        print_error "Elasticsearch container is not running"
        return 1
    fi
    
    print_info "Creating Elasticsearch backup..."
    
    # Create Elasticsearch backup directory
    mkdir -p "$BACKUP_DIR/$BACKUP_NAME/elasticsearch"
    
    # Get all indices
    INDICES=$(curl -s "http://localhost:9200/_cat/indices?h=index" | grep -v "^\." || true)
    
    if [[ -n "$INDICES" ]]; then
        # Export each index
        while IFS= read -r index; do
            if [[ -n "$index" ]]; then
                print_info "Backing up index: $index"
                curl -s "http://localhost:9200/$index/_search?scroll=1m&size=1000" \
                    -H "Content-Type: application/json" \
                    -d '{"query": {"match_all": {}}}' \
                    > "$BACKUP_DIR/$BACKUP_NAME/elasticsearch/${index}.json"
            fi
        done <<< "$INDICES"
    else
        print_info "No Elasticsearch indices found to backup"
    fi
    
    # Also backup cluster settings
    curl -s "http://localhost:9200/_cluster/settings" > "$BACKUP_DIR/$BACKUP_NAME/elasticsearch/cluster_settings.json"
    
    print_success "Elasticsearch backup completed"
    echo ""
}

backup_application_files() {
    print_section "Backing up Application Files"
    
    print_info "Copying configuration files..."
    
    # Copy important configuration files
    cp "$PROJECT_ROOT/.env.example" "$BACKUP_DIR/$BACKUP_NAME/"
    [[ -f "$PROJECT_ROOT/.env" ]] && cp "$PROJECT_ROOT/.env" "$BACKUP_DIR/$BACKUP_NAME/"
    cp "$PROJECT_ROOT/docker-compose.yml" "$BACKUP_DIR/$BACKUP_NAME/"
    
    # Copy upload directories if they exist
    if [[ -d "$PROJECT_ROOT/uploads" ]]; then
        cp -r "$PROJECT_ROOT/uploads" "$BACKUP_DIR/$BACKUP_NAME/"
    fi
    
    # Copy any custom data directories
    for dir in "data" "logs" "temp"; do
        if [[ -d "$PROJECT_ROOT/$dir" ]]; then
            cp -r "$PROJECT_ROOT/$dir" "$BACKUP_DIR/$BACKUP_NAME/"
        fi
    done
    
    print_success "Application files backup completed"
    echo ""
}

backup_docker_volumes() {
    print_section "Backing up Docker Volumes"
    
    print_info "Creating volume backups..."
    
    # Create volumes backup directory
    mkdir -p "$BACKUP_DIR/$BACKUP_NAME/volumes"
    
    # List of volumes to backup
    VOLUMES=(
        "postgres_data"
        "redis_data"
        "mongo_data"
        "elasticsearch_data"
        "voice_models"
        "voice_audio"
        "notification_templates"
        "credential_uploads"
    )
    
    for volume in "${VOLUMES[@]}"; do
        FULL_VOLUME_NAME="iw_pl_dev_v02_${volume}"
        
        if docker volume inspect "$FULL_VOLUME_NAME" &>/dev/null; then
            print_info "Backing up volume: $volume"
            
            # Create a temporary container to access the volume
            docker run --rm \
                -v "$FULL_VOLUME_NAME:/source" \
                -v "$BACKUP_DIR/$BACKUP_NAME/volumes:/backup" \
                alpine \
                tar czf "/backup/${volume}.tar.gz" -C /source .
        else
            print_info "Volume $volume does not exist, skipping..."
        fi
    done
    
    print_success "Docker volumes backup completed"
    echo ""
}

create_backup_manifest() {
    print_section "Creating Backup Manifest"
    
    MANIFEST_FILE="$BACKUP_DIR/$BACKUP_NAME/backup_manifest.txt"
    
    cat > "$MANIFEST_FILE" << EOF
iWORKZ Platform Backup Manifest
================================

Backup Date: $(date)
Backup Name: $BACKUP_NAME
Platform Version: 1.0.0

Included Components:
- PostgreSQL Database (Main application data)
- MongoDB Database (Credential engine data)
- Redis Data (Cache and session data)
- Elasticsearch Indices (Search data)
- Application Configuration Files
- Docker Volumes
- Upload Files and Assets

Backup Contents:
$(ls -la "$BACKUP_DIR/$BACKUP_NAME/")

Database Sizes:
$(du -sh "$BACKUP_DIR/$BACKUP_NAME"/* 2>/dev/null || echo "Size calculation failed")

Total Backup Size: $(du -sh "$BACKUP_DIR/$BACKUP_NAME" | cut -f1)

Restoration Instructions:
1. Stop the platform: ./scripts/stop-platform.sh --remove-data
2. Restore databases using the provided dump files
3. Copy configuration files back to project root
4. Restore docker volumes
5. Start the platform: ./scripts/start-platform.sh

Notes:
- This backup was created while the platform was running
- Database consistency is ensured through proper dump procedures
- Sensitive data (passwords, keys) may be included in configuration files
EOF
    
    print_success "Backup manifest created"
    echo ""
}

compress_backup() {
    print_section "Compressing Backup"
    
    print_info "Creating compressed archive..."
    
    cd "$BACKUP_DIR"
    tar czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME/"
    
    # Remove uncompressed directory
    rm -rf "$BACKUP_NAME"
    
    COMPRESSED_SIZE=$(du -sh "${BACKUP_NAME}.tar.gz" | cut -f1)
    
    print_success "Backup compressed: ${BACKUP_NAME}.tar.gz ($COMPRESSED_SIZE)"
    echo ""
}

cleanup_old_backups() {
    print_section "Cleaning Up Old Backups"
    
    # Keep only the last 5 backups
    KEEP_BACKUPS=5
    
    cd "$BACKUP_DIR"
    
    # Count existing backups
    BACKUP_COUNT=$(ls -1 iworkz_backup_*.tar.gz 2>/dev/null | wc -l)
    
    if [[ $BACKUP_COUNT -gt $KEEP_BACKUPS ]]; then
        print_info "Found $BACKUP_COUNT backups, keeping newest $KEEP_BACKUPS..."
        
        # Remove oldest backups
        ls -1t iworkz_backup_*.tar.gz | tail -n +$((KEEP_BACKUPS + 1)) | xargs rm -f
        
        print_success "Old backups cleaned up"
    else
        print_info "Found $BACKUP_COUNT backups, no cleanup needed"
    fi
    
    echo ""
}

show_completion_message() {
    print_section "🎉 Backup Completed Successfully!"
    
    BACKUP_PATH="$BACKUP_DIR/${BACKUP_NAME}.tar.gz"
    BACKUP_SIZE=$(du -sh "$BACKUP_PATH" | cut -f1)
    
    echo "Backup Details:"
    echo "  📁 Location: $BACKUP_PATH"
    echo "  📏 Size: $BACKUP_SIZE"
    echo "  🕐 Created: $(date)"
    echo ""
    echo "To restore this backup:"
    echo "  1. Stop platform: ./scripts/stop-platform.sh --remove-data"
    echo "  2. Extract backup: tar xzf $BACKUP_PATH"
    echo "  3. Follow restoration instructions in backup_manifest.txt"
    echo ""
    echo "Available backups:"
    ls -lht "$BACKUP_DIR"/iworkz_backup_*.tar.gz 2>/dev/null | head -5 || echo "  No previous backups found"
    echo ""
}

show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --no-compress    Don't compress the backup (keeps directory structure)"
    echo "  --no-cleanup     Don't clean up old backups"
    echo "  --db-only        Backup only databases (PostgreSQL, MongoDB, Redis)"
    echo "  --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                    # Full backup with compression"
    echo "  $0 --no-compress      # Full backup without compression"
    echo "  $0 --db-only          # Database backup only"
    echo ""
}

# Main execution
main() {
    print_banner
    
    # Parse command line arguments
    COMPRESS_BACKUP=true
    CLEANUP_OLD=true
    DB_ONLY=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --no-compress)
                COMPRESS_BACKUP=false
                shift
                ;;
            --no-cleanup)
                CLEANUP_OLD=false
                shift
                ;;
            --db-only)
                DB_ONLY=true
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
    
    # Check prerequisites
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed."
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running."
        exit 1
    fi
    
    # Create backup directory
    create_backup_directory
    
    # Perform backups
    backup_postgresql
    backup_mongodb
    backup_redis
    backup_elasticsearch
    
    if [[ "$DB_ONLY" != "true" ]]; then
        backup_application_files
        backup_docker_volumes
    fi
    
    create_backup_manifest
    
    if [[ "$COMPRESS_BACKUP" == "true" ]]; then
        compress_backup
    fi
    
    if [[ "$CLEANUP_OLD" == "true" ]]; then
        cleanup_old_backups
    fi
    
    show_completion_message
}

# Handle errors
trap 'print_error "Backup failed! Check the error messages above."' ERR

# Execute main function
main "$@"