export const environment = {
  production: true,
  
  // API Configuration
  apiUrl: 'https://api.instat-survey-platform.com',
  apiVersion: 'v1',
  apiTimeout: 30000,
  
  // Application Configuration
  appBaseUrl: 'https://instat-backoffice.com',
  baseHref: '/',
  
  // Authentication Configuration
  jwtTokenKey: 'instat_access_token',
  jwtRefreshTokenKey: 'instat_refresh_token',
  sessionTimeout: 30,
  enableRememberMe: false,
  
  // Security Configuration (stricter defaults for production)
  cspEnabled: true,
  forceHttps: true,
  allowedOrigins: ['https://instat-backoffice.com'],
  
  // Feature Flags
  enableFormGenerator: true,
  enableUserManagement: true,
  enableFileUpload: true,
  enableAdvancedSurveys: true,
  enableDashboardAnalytics: true,
  
  // UI/UX Configuration
  defaultTheme: 'light',
  defaultLanguage: 'en',
  defaultPageSize: 10,
  maxFileSizeMB: 10,
  supportedFileTypes: ['.xlsx', '.xls', '.csv', '.json'],
  
  // Performance Configuration (optimized for production)
  enableServiceWorker: true,
  cacheExpirationMinutes: 60,
  enableLazyLoading: true,
  
  // Logging Configuration (reduced for production)
  logLevel: 'warn',
  enableConsoleLogs: false,
  enableRemoteLogging: true,
  remoteLogEndpoint: '',
  
  // Monitoring & Analytics
  googleAnalyticsId: '',
  sentryDsn: '',
  enablePerformanceMonitoring: true,
  
  // External Services
  documentationUrl: 'https://docs.instat-platform.com',
  supportUrl: 'https://support.instat-platform.com',
  termsUrl: 'https://instat-platform.com/terms',
  privacyUrl: 'https://instat-platform.com/privacy',
  
  // Storage Configuration
  localStorageQuotaMB: 50,
  enableOfflineMode: false,
  
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
  buildOutputPath: 'dist/instat-backoffice',
  enableProductionOptimizations: true,
  enableProductionSourceMaps: false
};
