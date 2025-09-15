# INSTAT Back Office - Frontend

Angular front-end application for the INSTAT Survey Platform back office management system.

## Features

### 🔐 Authentication
- Secure login with JWT token authentication
- Role-based access control
- Session management with automatic logout

### 📊 Dashboard
- Survey statistics overview
- Template usage analytics  
- Recent activity monitoring
- Quick action buttons

### 📝 Template Management
- List and filter survey templates
- View template details with section/question breakdown
- Create, edit, and delete templates
- Template usage tracking

### 🛠️ Form Generator
- **Dynamic form generation from templates**
- **Interactive step-by-step form filling**
- **Support for all INSTAT question types:**
  - Text input
  - Number input
  - Date selection
  - Single/Multiple choice
  - Performance scales
  - Compliance checklists
  - Geographic selection
  - Budget allocation
  - And more...
- Form validation and progress tracking
- Export form responses
- Save as draft functionality

### 📋 Survey Management
- INSTAT survey CRUD operations
- File upload (Excel to Survey conversion)
- Survey filtering by domain, category, status
- Metrics and reporting

### 👥 User Management
- User administration (with proper permissions)
- Role assignment
- Activity monitoring

## Technical Stack

- **Framework**: Angular 18
- **UI Library**: Angular Material
- **HTTP Client**: Angular HttpClient with interceptors
- **Routing**: Angular Router with guards
- **Forms**: Reactive Forms with dynamic generation
- **State Management**: Services with RxJS
- **Authentication**: JWT with refresh token support

## Architecture

```
src/
├── app/
│   ├── core/                 # Core functionality
│   │   ├── models/          # TypeScript interfaces/models
│   │   ├── services/        # API services
│   │   ├── guards/          # Route guards
│   │   └── interceptors/    # HTTP interceptors
│   ├── shared/              # Shared components/utilities
│   ├── features/            # Feature modules
│   │   ├── auth/           # Authentication
│   │   ├── dashboard/      # Dashboard
│   │   ├── templates/      # Template management + Form Generator
│   │   ├── surveys/        # Survey management
│   │   └── users/          # User management
│   └── layouts/            # Layout components
└── environments/           # Environment configuration
```

## Key Components

### Form Generator (`form-generator.component.ts`)
The centerpiece component that dynamically generates interactive forms from survey templates:

- **Template Selection**: Choose from available templates
- **Dynamic Form Building**: Converts template structure to Angular reactive forms
- **Multi-step Interface**: Uses Material Stepper for better UX
- **Question Type Support**: Handles all INSTAT-specific question types
- **Validation**: Real-time form validation with progress tracking
- **Export/Save**: Export responses or save as draft

### Template Service (`template.service.ts`)
Provides template management and form generation capabilities:

- **Template CRUD**: Full template lifecycle management
- **Form Conversion**: Converts templates to Angular form structures
- **Question Type Mapping**: Maps INSTAT question types to form controls
- **Utility Methods**: Display name mappings and validation helpers

### Authentication Service (`auth.service.ts`)
Handles all authentication-related operations:

- **JWT Management**: Token storage and validation
- **Session Handling**: Automatic logout on token expiration
- **Permission Checking**: Role-based access control
- **API Integration**: Login/logout with the backend `/v1/api/auth/token`

## Setup and Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Angular CLI 18+

### Installation

```bash
# Navigate to frontend directory
cd frontend/instat-backoffice

# Install dependencies
npm install

# Start development server
npm start

# Application will be available at http://localhost:4200
```

### Build for Production

```bash
# Build for production
npm run build

# Output will be in dist/ directory
```

### Environment Configuration

Update `src/environments/environment.ts` with your backend API URL:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000' // Your backend URL
};
```

## API Integration

The application integrates with the INSTAT Survey Platform backend through these main endpoints:

### Authentication
- `POST /v1/api/auth/token` - Login
- `GET /v1/api/auth/me` - Get current user

### Templates
- `GET /v1/api/instat/templates` - List templates
- `GET /v1/api/instat/templates/{id}` - Get template details
- `GET /v1/api/instat/templates/dashboard` - Template statistics

### Surveys
- `GET /v1/api/instat/surveys` - List INSTAT surveys
- `POST /v1/api/instat/surveys` - Create survey
- `GET /v1/api/instat/dashboard/summary` - Dashboard data

### File Upload
- `POST /v1/files/upload-excel-and-create-survey` - Excel to survey conversion

## Form Generator Usage

The Form Generator is the key feature that allows users to:

1. **Select a Template**: Choose from available survey templates
2. **Generate Form**: Automatically convert template to interactive form
3. **Fill Form**: Step-through sections with validation
4. **Review**: Summary page showing all responses
5. **Submit/Save**: Submit final form or save as draft
6. **Export**: Export form data as JSON

### Supported Question Types

The form generator supports all INSTAT-specific question types:
- Standard: text, number, date, single/multiple choice
- Specialized: performance scales, compliance checklists
- INSTAT-specific: budget allocation, geographic selection, vulnerability assessment, indicator tracking

## Development Guidelines

### Adding New Question Types

To add a new question type to the form generator:

1. Add the type to `INSTATQuestionType` enum
2. Update `convertQuestionToFormField()` in `TemplateService`
3. Add template handling in `FormGeneratorComponent`
4. Update `getQuestionTypeDisplayName()` for UI display

### Authentication Integration

The app uses JWT authentication with automatic token management:

- Tokens are stored in localStorage
- HTTP interceptor adds Authorization header
- Guards protect routes requiring authentication
- Automatic logout on token expiration

## Features in Detail

### Dashboard
- Real-time statistics from `/v1/api/instat/dashboard/summary`
- Recent surveys and popular templates
- Quick action buttons for common tasks

### Template Management
- Paginated template listing with filters
- Template details with question/section analysis
- CRUD operations with permission checking

### Form Generator
- **Dynamic form creation from any template**
- **Step-by-step form filling with progress tracking**
- **All INSTAT question types supported**
- **Form validation and error handling**
- **Export capabilities**

### Survey Management  
- INSTAT survey lifecycle management
- Excel file upload and parsing
- Filtering and search capabilities

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Angular CLI Commands

```bash
# Development server
ng serve

# Build for production
ng build

# Run tests
ng test

# Generate components
ng generate component component-name
```

## Security

- JWT token validation
- Route guards for protected pages
- Permission-based UI elements
- XSS protection through Angular's built-in sanitization
- HTTP interceptors for consistent API communication

## Performance

- Lazy loading for feature modules
- OnPush change detection where appropriate
- Optimized bundle size with tree shaking
- Efficient Angular Material components

## On-Premise Linux Deployment Guide

This section provides a complete guide for deploying the INSTAT Back Office frontend on Linux servers in an on-premise environment.

### System Requirements

#### Hardware Requirements
- **CPU**: 2+ cores (4+ cores recommended for production)
- **RAM**: 4GB minimum (8GB+ recommended for production)
- **Storage**: 10GB minimum (SSD recommended)
- **Network**: Stable internet connection for initial setup

#### Software Requirements
- **Operating System**: Ubuntu 20.04+, CentOS 8+, or RHEL 8+
- **Node.js**: Version 18.x or 20.x (LTS recommended)
- **npm**: Version 8+ or Yarn 1.22+
- **Web Server**: Nginx 1.18+ or Apache 2.4+
- **Process Manager**: PM2 (recommended) or systemd
- **SSL/TLS**: Let's Encrypt or custom certificates

### Pre-Deployment Checklist

- [ ] Linux server with root/sudo access
- [ ] Domain name configured (if using custom domain)
- [ ] Firewall configured to allow HTTP/HTTPS traffic
- [ ] Backend API server deployed and accessible
- [ ] SSL certificates ready (if using HTTPS)
- [ ] Database and backend services running

### Step 1: System Preparation

#### 1.1 Update System Packages

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
# or for newer versions
sudo dnf update -y
```

#### 1.2 Install Required System Packages

```bash
# Ubuntu/Debian
sudo apt install -y curl wget git unzip build-essential

# CentOS/RHEL
sudo yum install -y curl wget git unzip gcc-c++ make
# or
sudo dnf install -y curl wget git unzip gcc-c++ make
```

#### 1.3 Configure Firewall

```bash
# Ubuntu (UFW)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw --force enable

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### Step 2: Install Node.js and npm

#### 2.1 Install Node.js using NodeSource Repository

```bash
# Install Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs  # Ubuntu/Debian

# For CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs
```

#### 2.2 Verify Installation

```bash
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x+
```

#### 2.3 Install Global Dependencies

```bash
# Install Angular CLI globally
sudo npm install -g @angular/cli@18

# Install PM2 for process management
sudo npm install -g pm2

# Verify installations
ng version
pm2 --version
```

### Step 3: Create Deployment User

```bash
# Create dedicated user for the application
sudo useradd -m -s /bin/bash instat-admin
sudo mkdir -p /opt/instat-backoffice
sudo chown instat-admin:instat-admin /opt/instat-backoffice

# Add user to necessary groups
sudo usermod -aG sudo instat-admin  # Ubuntu
sudo usermod -aG wheel instat-admin # CentOS/RHEL

# Switch to deployment user
sudo su - instat-admin
```

### Step 4: Deploy the Application

#### 4.1 Clone the Repository

```bash
# Navigate to deployment directory
cd /opt/instat-backoffice

# Clone the repository (replace with your actual repository URL)
git clone https://github.com/your-org/instat-survey-platform.git .

# Navigate to frontend directory
cd frontend/instat-backoffice
```

#### 4.2 Configure Environment Variables

```bash
# Copy environment template
cp .env.example .env

# Edit environment file
nano .env
```

Update the `.env` file with your production values:

```bash
# Essential production configuration
NODE_ENV=production
API_URL=https://your-api-domain.com
APP_BASE_URL=https://your-domain.com
FORCE_HTTPS=true
ENABLE_PRODUCTION_OPTIMIZATIONS=true
ENABLE_PRODUCTION_SOURCE_MAPS=false

# Security settings
CSP_ENABLED=true
ALLOWED_ORIGINS=https://your-domain.com
TRUST_PROXY=true

# Performance settings
ENABLE_SERVICE_WORKER=true
CACHE_EXPIRATION_MINUTES=60
```

#### 4.3 Install Dependencies

```bash
# Install production dependencies
npm ci --only=production

# Install Angular CLI locally if needed
npm install @angular/cli@18
```

#### 4.4 Build for Production

```bash
# Build the application
npm run build

# Verify build output
ls -la dist/instat-backoffice/
```

### Step 5: Web Server Configuration

#### 5.1 Install and Configure Nginx

```bash
# Install Nginx
sudo apt install -y nginx  # Ubuntu/Debian
sudo yum install -y nginx  # CentOS/RHEL

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/instat-backoffice
```

Nginx configuration file:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL Configuration
    ssl_certificate /etc/ssl/certs/your-domain.crt;
    ssl_certificate_key /etc/ssl/private/your-domain.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://your-api-domain.com;" always;
    
    # Document Root
    root /opt/instat-backoffice/frontend/instat-backoffice/dist/instat-backoffice;
    index index.html;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # Angular routing (SPA)
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, must-revalidate";
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # Logging
    access_log /var/log/nginx/instat-backoffice.access.log;
    error_log /var/log/nginx/instat-backoffice.error.log;
}
```

#### 5.2 Enable Nginx Configuration

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/instat-backoffice /etc/nginx/sites-enabled/

# Remove default configuration
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Start and enable Nginx
sudo systemctl enable nginx
sudo systemctl start nginx
sudo systemctl status nginx
```

### Step 6: SSL Certificate Configuration

#### 6.1 Option A: Using Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx  # Ubuntu/Debian
sudo yum install -y certbot python3-certbot-nginx  # CentOS/RHEL

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Setup automatic renewal
sudo crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

#### 6.2 Option B: Custom SSL Certificates

```bash
# Create SSL directory
sudo mkdir -p /etc/ssl/{certs,private}

# Copy your certificates
sudo cp your-domain.crt /etc/ssl/certs/
sudo cp your-domain.key /etc/ssl/private/
sudo chmod 644 /etc/ssl/certs/your-domain.crt
sudo chmod 600 /etc/ssl/private/your-domain.key
```

### Step 7: Process Management with PM2

#### 7.1 Create PM2 Configuration

```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'instat-backoffice',
    script: 'serve',
    args: '-s dist/instat-backoffice -l 4200',
    cwd: '/opt/instat-backoffice/frontend/instat-backoffice',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 4200
    },
    error_file: '/var/log/pm2/instat-backoffice.error.log',
    out_file: '/var/log/pm2/instat-backoffice.out.log',
    log_file: '/var/log/pm2/instat-backoffice.log',
    time: true,
    autorestart: true,
    max_restarts: 5,
    min_uptime: '10s'
  }]
};
EOF
```

#### 7.2 Install serve and Start Application

```bash
# Install serve globally
sudo npm install -g serve

# Create log directory
sudo mkdir -p /var/log/pm2
sudo chown instat-admin:instat-admin /var/log/pm2

# Start application with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
# Follow the instructions provided by the command
```

### Step 8: System Service Configuration

#### 8.1 Create Systemd Service (Alternative to PM2)

```bash
sudo nano /etc/systemd/system/instat-backoffice.service
```

```ini
[Unit]
Description=INSTAT Back Office Frontend
After=network.target
Wants=network.target

[Service]
Type=simple
User=instat-admin
Group=instat-admin
WorkingDirectory=/opt/instat-backoffice/frontend/instat-backoffice
ExecStart=/usr/bin/npx serve -s dist/instat-backoffice -l 4200
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=4200

# Logging
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=instat-backoffice

# Security
NoNewPrivileges=yes
PrivateTmp=yes
ProtectHome=yes
ProtectSystem=strict
ReadWritePaths=/opt/instat-backoffice

[Install]
WantedBy=multi-user.target
```

#### 8.2 Enable and Start Service

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable instat-backoffice

# Start service
sudo systemctl start instat-backoffice

# Check status
sudo systemctl status instat-backoffice
```

### Step 9: Monitoring and Logging

#### 9.1 Setup Log Rotation

```bash
sudo nano /etc/logrotate.d/instat-backoffice
```

```
/var/log/nginx/instat-backoffice.*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload nginx
    endscript
}

/var/log/pm2/instat-backoffice.*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 644 instat-admin instat-admin
    postrotate
        pm2 reloadLogs
    endscript
}
```

#### 9.2 System Monitoring

```bash
# Install monitoring tools
sudo apt install -y htop iotop netstat-ss  # Ubuntu/Debian
sudo yum install -y htop iotop net-tools   # CentOS/RHEL

# Setup basic monitoring script
cat > /opt/instat-backoffice/scripts/health-check.sh << 'EOF'
#!/bin/bash

# Health check script for INSTAT Back Office
DOMAIN="your-domain.com"
LOG_FILE="/var/log/instat-health-check.log"

echo "$(date): Starting health check" >> $LOG_FILE

# Check web server response
if curl -f -s "https://$DOMAIN/health" > /dev/null; then
    echo "$(date): Web server OK" >> $LOG_FILE
else
    echo "$(date): Web server FAILED" >> $LOG_FILE
    systemctl restart nginx
fi

# Check application process
if pm2 describe instat-backoffice > /dev/null 2>&1; then
    echo "$(date): Application OK" >> $LOG_FILE
else
    echo "$(date): Application FAILED" >> $LOG_FILE
    pm2 restart instat-backoffice
fi

echo "$(date): Health check completed" >> $LOG_FILE
EOF

chmod +x /opt/instat-backoffice/scripts/health-check.sh

# Add to crontab (every 5 minutes)
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/instat-backoffice/scripts/health-check.sh") | crontab -
```

### Step 10: Backup and Recovery

#### 10.1 Setup Automated Backup

```bash
# Create backup script
cat > /opt/instat-backoffice/scripts/backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/opt/backups/instat-backoffice"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
APP_DIR="/opt/instat-backoffice"

mkdir -p $BACKUP_DIR

echo "Starting backup at $(date)"

# Backup application files
tar -czf $BACKUP_DIR/app_$TIMESTAMP.tar.gz -C $APP_DIR .

# Backup Nginx configuration
cp /etc/nginx/sites-available/instat-backoffice $BACKUP_DIR/nginx_$TIMESTAMP.conf

# Backup PM2 configuration
pm2 save --force
cp ~/.pm2/dump.pm2 $BACKUP_DIR/pm2_$TIMESTAMP.json

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.conf" -mtime +7 -delete
find $BACKUP_DIR -name "*.json" -mtime +7 -delete

echo "Backup completed at $(date)"
EOF

chmod +x /opt/instat-backoffice/scripts/backup.sh

# Schedule daily backup
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/instat-backoffice/scripts/backup.sh") | crontab -
```

### Step 11: Security Hardening

#### 11.1 System Security

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install fail2ban
sudo apt install -y fail2ban

# Configure fail2ban for Nginx
sudo nano /etc/fail2ban/jail.local
```

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/instat-backoffice.error.log

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/instat-backoffice.error.log
maxretry = 10
```

```bash
# Start fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

#### 11.2 Application Security

```bash
# Set proper file permissions
sudo chown -R instat-admin:instat-admin /opt/instat-backoffice
find /opt/instat-backoffice -type f -exec chmod 644 {} \;
find /opt/instat-backoffice -type d -exec chmod 755 {} \;
chmod +x /opt/instat-backoffice/scripts/*.sh

# Secure sensitive files
chmod 600 /opt/instat-backoffice/frontend/instat-backoffice/.env
```

### Step 12: Testing and Verification

#### 12.1 Application Testing

```bash
# Test application locally
curl -I http://localhost:4200

# Test through Nginx
curl -I http://localhost
curl -I https://your-domain.com

# Test API connectivity
curl -I https://your-api-domain.com/health
```

#### 12.2 Load Testing (Optional)

```bash
# Install Apache Bench
sudo apt install -y apache2-utils

# Simple load test
ab -n 1000 -c 10 https://your-domain.com/
```

### Troubleshooting

#### Common Issues and Solutions

**1. Application won't start**
```bash
# Check logs
journalctl -u instat-backoffice -f
pm2 logs instat-backoffice

# Check Node.js and npm versions
node --version
npm --version

# Rebuild application
npm run build
```

**2. Nginx errors**
```bash
# Check Nginx configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/instat-backoffice.error.log

# Restart Nginx
sudo systemctl restart nginx
```

**3. SSL certificate issues**
```bash
# Check certificate validity
openssl x509 -in /etc/ssl/certs/your-domain.crt -text -noout

# Test SSL configuration
openssl s_client -connect your-domain.com:443

# Renew Let's Encrypt certificate
sudo certbot renew
```

**4. API connectivity issues**
```bash
# Test API endpoint
curl -v https://your-api-domain.com/v1/api/health

# Check environment variables
cat .env | grep API_URL

# Check CORS settings on backend
```

**5. Performance issues**
```bash
# Check system resources
htop
df -h
free -h

# Check application metrics
pm2 monit

# Analyze Nginx access logs
sudo tail -f /var/log/nginx/instat-backoffice.access.log
```

### Maintenance

#### Regular Maintenance Tasks

**Weekly:**
- Check system updates: `sudo apt update && sudo apt list --upgradable`
- Review application logs: `pm2 logs --lines 100`
- Check disk space: `df -h`
- Verify SSL certificate expiry: `certbot certificates`

**Monthly:**
- Update system packages: `sudo apt upgrade`
- Review and rotate logs: `sudo logrotate -f /etc/logrotate.d/instat-backoffice`
- Test backup restoration process
- Review security logs: `sudo fail2ban-client status`

**Application Updates:**
```bash
# Pull latest changes
cd /opt/instat-backoffice
git pull origin main

# Update dependencies
cd frontend/instat-backoffice
npm ci

# Rebuild application
npm run build

# Restart application
pm2 restart instat-backoffice

# Verify deployment
curl -I https://your-domain.com
```

### Performance Optimization

#### 1. Enable HTTP/2 and Gzip
Already configured in the Nginx setup above.

#### 2. CDN Configuration (Optional)
Configure CloudFlare, AWS CloudFront, or similar CDN service to cache static assets.

#### 3. Database Connection Pooling
Ensure your backend API uses proper database connection pooling.

#### 4. Monitoring Setup
Consider implementing monitoring solutions like:
- **Prometheus + Grafana** for metrics
- **ELK Stack** for log analysis
- **Uptime monitoring** services

### Security Best Practices

1. **Regular Updates**: Keep all system packages and dependencies updated
2. **Access Control**: Use strong passwords, SSH keys, and limit sudo access
3. **Network Security**: Configure proper firewall rules and use VPN if needed
4. **SSL/TLS**: Use strong cipher suites and regularly update certificates
5. **Backup Verification**: Regularly test backup restoration procedures
6. **Monitoring**: Implement comprehensive logging and monitoring
7. **Vulnerability Scanning**: Regularly scan for security vulnerabilities

### Contact and Support

For deployment issues or questions:
- Check the application logs first
- Review this documentation
- Contact the development team with specific error messages and logs

---

## License

This project is part of the INSTAT Survey Platform and follows the same licensing terms.
