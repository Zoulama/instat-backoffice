module.exports = {
  apps: [{
    name: 'instat-backoffice',
    script: 'serve',
    args: '-s dist/instat-backoffice -l 4200 --single',
    cwd: '/opt/instat-backoffice/frontend/instat-backoffice',
    instances: 'max', // Use all available CPU cores
    exec_mode: 'cluster',
    
    // Environment variables
    env: {
      NODE_ENV: 'production',
      PORT: 4200
    },
    
    // Deployment configuration
    env_production: {
      NODE_ENV: 'production',
      API_URL: process.env.API_URL || 'https://api.instat-survey-platform.com',
      APP_BASE_URL: process.env.APP_BASE_URL || 'https://instat-backoffice.com',
      FORCE_HTTPS: 'true',
      CSP_ENABLED: 'true',
      ENABLE_PRODUCTION_OPTIMIZATIONS: 'true',
      LOG_LEVEL: 'warn',
      ENABLE_CONSOLE_LOGS: 'false',
      ENABLE_REMOTE_LOGGING: 'true'
    },
    
    // Logging configuration
    error_file: '/var/log/pm2/instat-backoffice.error.log',
    out_file: '/var/log/pm2/instat-backoffice.out.log',
    log_file: '/var/log/pm2/instat-backoffice.log',
    time: true,
    
    // Process management
    autorestart: true,
    max_restarts: 5,
    min_uptime: '10s',
    restart_delay: 4000,
    
    // Memory management
    max_memory_restart: '500M',
    
    // Monitoring
    pmx: true,
    
    // Health check
    health_check: {
      enabled: true,
      url: 'http://localhost:4200/health',
      timeout: '10s',
      interval: '30s',
      max_failures: 3
    }
  }],

  // Deployment configuration
  deploy: {
    production: {
      user: 'instat-admin',
      host: ['your-production-server.com'],
      ref: 'origin/main',
      repo: 'git@github.com:your-org/instat-survey-platform.git',
      path: '/opt/instat-backoffice',
      'pre-deploy-local': '',
      'post-deploy': 'cd frontend/instat-backoffice && npm ci && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'mkdir -p /var/log/pm2 && chown instat-admin:instat-admin /var/log/pm2'
    },
    
    staging: {
      user: 'instat-admin',
      host: ['your-staging-server.com'],
      ref: 'origin/develop',
      repo: 'git@github.com:your-org/instat-survey-platform.git',
      path: '/opt/instat-backoffice-staging',
      'post-deploy': 'cd frontend/instat-backoffice && npm ci && npm run build && pm2 reload ecosystem.config.js --env staging',
      env: {
        NODE_ENV: 'staging',
        API_URL: 'https://staging-api.instat-survey-platform.com',
        APP_BASE_URL: 'https://staging.instat-backoffice.com'
      }
    }
  }
};