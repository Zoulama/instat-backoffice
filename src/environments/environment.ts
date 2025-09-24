export const environment = {
  production: false,
  
  // API Configuration
  apiUrl: 'http://localhost:8000',
  apiVersion: 'v1',
  apiTimeout: 30000,
  
  // Application Configuration
  appBaseUrl: 'http://localhost:4200',
  baseHref: '/',
  
  // Authentication Configuration
  jwtTokenKey: 'instat_access_token',
  jwtRefreshTokenKey: 'instat_refresh_token',
  sessionTimeout: 30,
  enableRememberMe: false,
  
  // Security Configuration
  cspEnabled: false,
  forceHttps: false,
  allowedOrigins: ['http://localhost:4200'],
  
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
  
  // Performance Configuration
  enableServiceWorker: false,
  cacheExpirationMinutes: 60,
  enableLazyLoading: true,
  
  // Logging Configuration
  logLevel: 'info',
  enableConsoleLogs: true,
  enableRemoteLogging: false,
  remoteLogEndpoint: '',
  
  // Monitoring & Analytics
  googleAnalyticsId: '',
  sentryDsn: '',
  enablePerformanceMonitoring: false,
  
  // External Services
  documentationUrl: 'https://docs.instat-platform.com',
  supportUrl: 'https://support.instat-platform.com',
  termsUrl: 'https://instat-platform.com/terms',
  privacyUrl: 'https://instat-platform.com/privacy',
  
  // Storage Configuration
  localStorageQuotaMB: 50,
  enableOfflineMode: false,
  
  // Development Configuration
  enableDevTools: true,
  enableMockData: false,
  devProxyEnabled: false,
  devProxyTarget: 'http://localhost:8000',
  hotReloadEnabled: true,
  
  // Testing Configuration
  testMode: false,
  testDataSeed: 12345,
  
  // Build Configuration
  buildOutputPath: 'dist/instat-backoffice',
  enableProductionOptimizations: true,
  enableProductionSourceMaps: false
};
