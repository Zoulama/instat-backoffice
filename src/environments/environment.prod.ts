export const environment = {
  production: true,
  
  // API Configuration
  apiUrl: process.env['API_URL'] || 'https://api.instat-survey-platform.com',
  apiVersion: process.env['API_VERSION'] || 'v1',
  apiTimeout: parseInt(process.env['API_TIMEOUT'] || '30000'),
  
  // Application Configuration
  appBaseUrl: process.env['APP_BASE_URL'] || 'https://instat-backoffice.com',
  baseHref: process.env['BASE_HREF'] || '/',
  
  // Authentication Configuration
  jwtTokenKey: process.env['JWT_TOKEN_KEY'] || 'instat_access_token',
  jwtRefreshTokenKey: process.env['JWT_REFRESH_TOKEN_KEY'] || 'instat_refresh_token',
  sessionTimeout: parseInt(process.env['SESSION_TIMEOUT'] || '30'),
  enableRememberMe: process.env['ENABLE_REMEMBER_ME'] === 'true',
  
  // Security Configuration (stricter defaults for production)
  cspEnabled: process.env['CSP_ENABLED'] !== 'false',
  forceHttps: process.env['FORCE_HTTPS'] !== 'false',
  allowedOrigins: process.env['ALLOWED_ORIGINS']?.split(',') || ['https://instat-backoffice.com'],
  
  // Feature Flags
  enableFormGenerator: process.env['ENABLE_FORM_GENERATOR'] !== 'false',
  enableUserManagement: process.env['ENABLE_USER_MANAGEMENT'] !== 'false',
  enableFileUpload: process.env['ENABLE_FILE_UPLOAD'] !== 'false',
  enableAdvancedSurveys: process.env['ENABLE_ADVANCED_SURVEYS'] !== 'false',
  enableDashboardAnalytics: process.env['ENABLE_DASHBOARD_ANALYTICS'] !== 'false',
  
  // UI/UX Configuration
  defaultTheme: process.env['DEFAULT_THEME'] || 'light',
  defaultLanguage: process.env['DEFAULT_LANGUAGE'] || 'en',
  defaultPageSize: parseInt(process.env['DEFAULT_PAGE_SIZE'] || '10'),
  maxFileSizeMB: parseInt(process.env['MAX_FILE_SIZE_MB'] || '10'),
  supportedFileTypes: process.env['SUPPORTED_FILE_TYPES']?.split(',') || ['.xlsx', '.xls', '.csv', '.json'],
  
  // Performance Configuration (optimized for production)
  enableServiceWorker: process.env['ENABLE_SERVICE_WORKER'] !== 'false',
  cacheExpirationMinutes: parseInt(process.env['CACHE_EXPIRATION_MINUTES'] || '60'),
  enableLazyLoading: process.env['ENABLE_LAZY_LOADING'] !== 'false',
  
  // Logging Configuration (reduced for production)
  logLevel: process.env['LOG_LEVEL'] || 'warn',
  enableConsoleLogs: process.env['ENABLE_CONSOLE_LOGS'] === 'true',
  enableRemoteLogging: process.env['ENABLE_REMOTE_LOGGING'] !== 'false',
  remoteLogEndpoint: process.env['REMOTE_LOG_ENDPOINT'] || '',
  
  // Monitoring & Analytics
  googleAnalyticsId: process.env['GOOGLE_ANALYTICS_ID'] || '',
  sentryDsn: process.env['SENTRY_DSN'] || '',
  enablePerformanceMonitoring: process.env['ENABLE_PERFORMANCE_MONITORING'] !== 'false',
  
  // External Services
  documentationUrl: process.env['DOCUMENTATION_URL'] || 'https://docs.instat-platform.com',
  supportUrl: process.env['SUPPORT_URL'] || 'https://support.instat-platform.com',
  termsUrl: process.env['TERMS_URL'] || 'https://instat-platform.com/terms',
  privacyUrl: process.env['PRIVACY_URL'] || 'https://instat-platform.com/privacy',
  
  // Storage Configuration
  localStorageQuotaMB: parseInt(process.env['LOCAL_STORAGE_QUOTA_MB'] || '50'),
  enableOfflineMode: process.env['ENABLE_OFFLINE_MODE'] === 'true',
  
  // Development Configuration (disabled for production)
  enableDevTools: false,
  enableMockData: false,
  devProxyEnabled: false,
  devProxyTarget: '',
  hotReloadEnabled: false,
  
  // Testing Configuration (disabled for production)
  testMode: false,
  testDataSeed: 0,
  
  // Build Configuration (production optimized)
  buildOutputPath: process.env['BUILD_OUTPUT_PATH'] || 'dist/instat-backoffice',
  enableProductionOptimizations: process.env['ENABLE_PRODUCTION_OPTIMIZATIONS'] !== 'false',
  enableProductionSourceMaps: process.env['ENABLE_PRODUCTION_SOURCE_MAPS'] === 'true'
};
