#!/bin/bash

# INSTAT Back Office Frontend - Deployment Script
# Usage: ./scripts/deploy.sh [environment] [options]
# Environments: production, staging, development
# Options: --build-only, --no-backup, --force, --rollback

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DEPLOY_USER="instat-admin"
DEPLOY_PATH="/opt/instat-backoffice"
BACKUP_DIR="/opt/backups/instat-backoffice"
LOG_FILE="/var/log/instat-deploy.log"

# Default values
ENVIRONMENT="${1:-production}"
BUILD_ONLY=false
NO_BACKUP=false
FORCE_DEPLOY=false
ROLLBACK=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --build-only)
            BUILD_ONLY=true
            shift
            ;;
        --no-backup)
            NO_BACKUP=true
            shift
            ;;
        --force)
            FORCE_DEPLOY=true
            shift
            ;;
        --rollback)
            ROLLBACK=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [environment] [options]"
            echo "Environments: production, staging, development"
            echo "Options:"
            echo "  --build-only    Only build, don't deploy"
            echo "  --no-backup     Skip backup creation"
            echo "  --force         Force deployment without confirmation"
            echo "  --rollback      Rollback to previous version"
            echo "  -h, --help      Show this help message"
            exit 0
            ;;
        *)
            if [[ $1 != "production" && $1 != "staging" && $1 != "development" ]]; then
                echo "Unknown option: $1"
                exit 1
            fi
            shift
            ;;
    esac
done

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $1${NC}" | tee -a "$LOG_FILE"
}

# Check if running as correct user
check_user() {
    if [[ "$USER" != "$DEPLOY_USER" ]]; then
        error "This script must be run as $DEPLOY_USER user"
        exit 1
    fi
}

# Load environment variables
load_environment() {
    local env_file="$PROJECT_ROOT/.env"
    
    if [[ -f "$env_file" ]]; then
        info "Loading environment variables from $env_file"
        source "$env_file"
    else
        warning "Environment file not found: $env_file"
        info "Using default configuration"
    fi
    
    # Set environment-specific variables
    case $ENVIRONMENT in
        production)
            export NODE_ENV=production
            export API_URL="${API_URL:-https://api.instat-survey-platform.com}"
            export APP_BASE_URL="${APP_BASE_URL:-https://instat-backoffice.com}"
            ;;
        staging)
            export NODE_ENV=staging
            export API_URL="${API_URL:-https://staging-api.instat-survey-platform.com}"
            export APP_BASE_URL="${APP_BASE_URL:-https://staging.instat-backoffice.com}"
            ;;
        development)
            export NODE_ENV=development
            export API_URL="${API_URL:-http://localhost:8000}"
            export APP_BASE_URL="${APP_BASE_URL:-http://localhost:4200}"
            ;;
    esac
}

# Pre-deployment checks
pre_deployment_checks() {
    log "Running pre-deployment checks..."
    
    # Check if required commands exist
    local required_commands=("node" "npm" "nginx" "pm2")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            error "$cmd is not installed or not in PATH"
            exit 1
        fi
    done
    
    # Check Node.js version
    local node_version=$(node -v | sed 's/v//')
    local required_version="18.0.0"
    if [[ "$(printf '%s\n' "$required_version" "$node_version" | sort -V | head -n1)" != "$required_version" ]]; then
        error "Node.js version $node_version is less than required $required_version"
        exit 1
    fi
    
    # Check available disk space (at least 2GB)
    local available_space=$(df "$PROJECT_ROOT" | awk 'NR==2 {print $4}')
    if [[ $available_space -lt 2097152 ]]; then  # 2GB in KB
        error "Insufficient disk space. At least 2GB required."
        exit 1
    fi
    
    # Check if port is available (if not using nginx proxy)
    if ! netstat -tuln | grep -q ":4200 "; then
        info "Port 4200 is available"
    else
        warning "Port 4200 is in use - deployment may require service restart"
    fi
    
    log "Pre-deployment checks passed"
}

# Create backup
create_backup() {
    if [[ "$NO_BACKUP" == true ]]; then
        warning "Skipping backup creation"
        return
    fi
    
    log "Creating backup..."
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/backup_$timestamp.tar.gz"
    
    # Create backup directory if it doesn't exist
    mkdir -p "$BACKUP_DIR"
    
    # Create backup of current deployment
    if [[ -d "$PROJECT_ROOT/dist" ]]; then
        tar -czf "$backup_file" -C "$PROJECT_ROOT" dist
        log "Backup created: $backup_file"
    else
        warning "No existing deployment found to backup"
    fi
    
    # Clean old backups (keep last 5)
    find "$BACKUP_DIR" -name "backup_*.tar.gz" -type f | sort -r | tail -n +6 | xargs rm -f
    log "Old backups cleaned"
}

# Build application
build_application() {
    log "Building application for $ENVIRONMENT environment..."
    
    cd "$PROJECT_ROOT"
    
    # Install dependencies
    log "Installing dependencies..."
    npm ci --only=production
    
    # Build application
    log "Building application..."
    if [[ "$ENVIRONMENT" == "production" ]]; then
        npm run build --prod
    else
        npm run build
    fi
    
    # Verify build output
    if [[ ! -d "$PROJECT_ROOT/dist/instat-backoffice" ]]; then
        error "Build failed - output directory not found"
        exit 1
    fi
    
    local build_size=$(du -sh "$PROJECT_ROOT/dist/instat-backoffice" | cut -f1)
    log "Build completed successfully - Size: $build_size"
}

# Deploy application
deploy_application() {
    log "Deploying application..."
    
    # Stop current application
    log "Stopping current application..."
    if pm2 list | grep -q "instat-backoffice"; then
        pm2 stop instat-backoffice
        pm2 delete instat-backoffice
    fi
    
    # Start application with PM2
    log "Starting application with PM2..."
    cd "$PROJECT_ROOT"
    pm2 start ecosystem.config.js --env "$ENVIRONMENT"
    
    # Save PM2 configuration
    pm2 save
    
    # Wait for application to start
    sleep 10
    
    # Verify deployment
    if pm2 list | grep -q "instat-backoffice.*online"; then
        log "Application started successfully"
    else
        error "Application failed to start"
        exit 1
    fi
}

# Health check
health_check() {
    log "Performing health check..."
    
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if curl -f -s "http://localhost:4200/health" > /dev/null; then
            log "Health check passed"
            return 0
        fi
        
        info "Health check attempt $attempt/$max_attempts failed, waiting..."
        sleep 10
        ((attempt++))
    done
    
    error "Health check failed after $max_attempts attempts"
    return 1
}

# Rollback deployment
rollback_deployment() {
    log "Rolling back deployment..."
    
    # Find latest backup
    local latest_backup=$(find "$BACKUP_DIR" -name "backup_*.tar.gz" -type f | sort -r | head -n1)
    
    if [[ -z "$latest_backup" ]]; then
        error "No backup found for rollback"
        exit 1
    fi
    
    # Stop current application
    pm2 stop instat-backoffice || true
    
    # Remove current deployment
    rm -rf "$PROJECT_ROOT/dist"
    
    # Restore from backup
    tar -xzf "$latest_backup" -C "$PROJECT_ROOT"
    
    # Restart application
    pm2 start ecosystem.config.js --env "$ENVIRONMENT"
    
    log "Rollback completed using backup: $(basename "$latest_backup")"
}

# Update nginx configuration
update_nginx() {
    log "Updating Nginx configuration..."
    
    # Test nginx configuration
    if sudo nginx -t; then
        sudo systemctl reload nginx
        log "Nginx configuration updated"
    else
        error "Nginx configuration test failed"
        exit 1
    fi
}

# Main deployment function
main() {
    log "Starting deployment process for $ENVIRONMENT environment"
    
    # Check if rollback is requested
    if [[ "$ROLLBACK" == true ]]; then
        rollback_deployment
        health_check
        log "Rollback completed successfully"
        exit 0
    fi
    
    # Run checks and prepare
    check_user
    load_environment
    pre_deployment_checks
    
    # Ask for confirmation unless forced
    if [[ "$FORCE_DEPLOY" != true ]]; then
        echo -e "\n${YELLOW}Deployment Summary:${NC}"
        echo "Environment: $ENVIRONMENT"
        echo "API URL: $API_URL"
        echo "App URL: $APP_BASE_URL"
        echo "Build only: $BUILD_ONLY"
        echo "Skip backup: $NO_BACKUP"
        echo
        read -p "Continue with deployment? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            info "Deployment cancelled by user"
            exit 0
        fi
    fi
    
    # Create backup
    create_backup
    
    # Build application
    build_application
    
    # Exit if build-only mode
    if [[ "$BUILD_ONLY" == true ]]; then
        log "Build-only mode - deployment skipped"
        exit 0
    fi
    
    # Deploy application
    deploy_application
    
    # Update nginx
    update_nginx
    
    # Health check
    if health_check; then
        log "Deployment completed successfully!"
        info "Application is running at: $APP_BASE_URL"
    else
        error "Deployment completed but health check failed"
        error "Check application logs: pm2 logs instat-backoffice"
        exit 1
    fi
}

# Run main function
main "$@"