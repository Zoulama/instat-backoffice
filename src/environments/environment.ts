export const environment = {
  production: false,
  
  // API Configuration
  apiUrl: process.env['API_URL'] || 'http://localhost:8000',
  apiVersion: process.env['API_VERSION'] || 'v1',
  apiTimeout: parseInt(process.env['API_TIMEOUT'] || '30000'),
  
  // Application Configuration
  appBaseUrl: process.env['APP_BASE_URL'] || 'http://localhost:4200',
  baseHref: process.env['BASE_HREF'] || '/',
  
  // Authentication Configuration
  jwtTokenKey: process.env['JWT_TOKEN_KEY'] || 'instat_access_token',
  jwtRefreshTokenKey: process.env['JWT_REFRESH_TOKEN_KEY'] || 'instat_refresh_token',
  sessionTimeout: parseInt(process.env['SESSION_TIMEOUT'] || '30'),
  enableRememberMe: process.env['ENABLE_REMEMBER_ME'] === 'true',
  
  // Security Configuration
  cspEnabled: process.env['CSP_ENABLED'] === 'true',
  forceHttps: process.env['FORCE_HTTPS'] === 'true',
  allowedOrigins: process.env['ALLOWED_ORIGINS']?.split(',') || ['http://localhost:4200'],
  
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
  
  // Performance Configuration
  enableServiceWorker: process.env['ENABLE_SERVICE_WORKER'] === 'true',
  cacheExpirationMinutes: parseInt(process.env['CACHE_EXPIRATION_MINUTES'] || '60'),
  enableLazyLoading: process.env['ENABLE_LAZY_LOADING'] !== 'false',
  
  // Logging Configuration
  logLevel: process.env['LOG_LEVEL'] || 'info',
  enableConsoleLogs: process.env['ENABLE_CONSOLE_LOGS'] !== 'false',
  enableRemoteLogging: process.env['ENABLE_REMOTE_LOGGING'] === 'true',
  remoteLogEndpoint: process.env['REMOTE_LOG_ENDPOINT'] || '',
  
  // Monitoring & Analytics
  googleAnalyticsId: process.env['GOOGLE_ANALYTICS_ID'] || '',
  sentryDsn: process.env['SENTRY_DSN'] || '',
  enablePerformanceMonitoring: process.env['ENABLE_PERFORMANCE_MONITORING'] === 'true',
  
  // External Services
  documentationUrl: process.env['DOCUMENTATION_URL'] || 'https://docs.instat-platform.com',
  supportUrl: process.env['SUPPORT_URL'] || 'https://support.instat-platform.com',
  termsUrl: process.env['TERMS_URL'] || 'https://instat-platform.com/terms',
  privacyUrl: process.env['PRIVACY_URL'] || 'https://instat-platform.com/privacy',
  
  // Storage Configuration
  localStorageQuotaMB: parseInt(process.env['LOCAL_STORAGE_QUOTA_MB'] || '50'),
  enableOfflineMode: process.env['ENABLE_OFFLINE_MODE'] === 'true',
  
  // Development Configuration
  enableDevTools: process.env['ENABLE_DEV_TOOLS'] === 'true',
  enableMockData: process.env['ENABLE_MOCK_DATA'] === 'true',
  devProxyEnabled: process.env['DEV_PROXY_ENABLED'] === 'true',
  devProxyTarget: process.env['DEV_PROXY_TARGET'] || 'http://localhost:8000',
  hotReloadEnabled: process.env['HOT_RELOAD_ENABLED'] !== 'false',
  
  // Testing Configuration
  testMode: process.env['TEST_MODE'] === 'true',
  testDataSeed: parseInt(process.env['TEST_DATA_SEED'] || '12345'),
  
  // Build Configuration
  buildOutputPath: process.env['BUILD_OUTPUT_PATH'] || 'dist/instat-backoffice',
  enableProductionOptimizations: process.env['ENABLE_PRODUCTION_OPTIMIZATIONS'] !== 'false',
  enableProductionSourceMaps: process.env['ENABLE_PRODUCTION_SOURCE_MAPS'] === 'true'
};
