/**
 * Configuration Manager - Singleton Pattern
 * Provides centralized configuration management for the entire test framework
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private config: Map<string, any> = new Map();

  private constructor() {
    this.initializeDefaultConfig();
  }

  /**
   * Get the singleton instance of ConfigManager
   */
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * Initialize configuration values from environment variables
   */
  private initializeDefaultConfig(): void {
    // Load environment variables with fallbacks
    this.config.set('BASE_URL', process.env.TEST_URL || 'https://portal.document360.io/1bff9bc5-3c41-43fe-852a-5442d48212ca/api-documentation');
    this.config.set('PROJECT_ID', process.env.PROJECT_ID || '1bff9bc5-3c41-43fe-852a-5442d48212ca');
    this.config.set('API_BASE_URL', process.env.API_BASE_URL || 'https://portal.document360.io');
    this.config.set('CUSTOMER_PORTAL_URL', process.env.CUSTOMER_PORTAL_URL || 'https://your-customer-portal.com');
    this.config.set('FALLBACK_URL', process.env.FALLBACK_URL || 'https://portal.document360.io');
    this.config.set('DASHBOARD_URL', process.env.DASHBOARD_URL || 'https://portal.document360.io/dashboard');
    
    // File paths
    this.config.set('TEST_DATA_DIR', process.env.TEST_DATA_DIR || '../test-data/create-api-doc');
    this.config.set('SCREENSHOT_DIR', process.env.SCREENSHOT_DIR || 'test-results/validation-screenshots');
    this.config.set('STORAGE_STATE_FILE', process.env.STORAGE_STATE_FILE || 'storageState.json');
    
    // Timeouts
    this.config.set('DEFAULT_TIMEOUT', parseInt(process.env.DEFAULT_TIMEOUT || '10000'));
    this.config.set('API_CREATION_TIMEOUT', parseInt(process.env.API_CREATION_TIMEOUT || '30000'));
    this.config.set('NAVIGATION_TIMEOUT', parseInt(process.env.NAVIGATION_TIMEOUT || '60000'));
    this.config.set('API_TIMEOUT', parseInt(process.env.API_TIMEOUT || '30000'));
    this.config.set('UI_TIMEOUT', parseInt(process.env.UI_TIMEOUT || '5000'));
    this.config.set('ACTION_TIMEOUT', parseInt(process.env.ACTION_TIMEOUT || '30000'));
    
    // Validation limits
    this.config.set('MAX_SERVERS_TO_VALIDATE', parseInt(process.env.MAX_SERVERS_TO_VALIDATE || '3'));
    this.config.set('MAX_TAGS_TO_VALIDATE', parseInt(process.env.MAX_TAGS_TO_VALIDATE || '5'));
    this.config.set('MAX_ENDPOINTS_TO_VALIDATE', parseInt(process.env.MAX_ENDPOINTS_TO_VALIDATE || '10'));
    
    // Logging
    this.config.set('ENABLE_VERBOSE_LOGGING', process.env.ENABLE_VERBOSE_LOGGING === 'true');
    
    // Authentication
    this.config.set('USERNAME', process.env.USERNAME || 'calvin@rocketlane.com');
    this.config.set('PASSWORD', process.env.PASSWORD || 'Abcd1234@');
    
    // External URLs
    this.config.set('PETSTORE_API_URL', process.env.PETSTORE_API_URL || 'https://petstore.swagger.io/v2/swagger.json');
    this.config.set('INVALID_API_URL', process.env.INVALID_API_URL || 'https://invalid-url.com/api');
    this.config.set('EXAMPLE_SUPPORT_URL', process.env.EXAMPLE_SUPPORT_URL || 'https://example.com/support');
    
    // Test data
    this.config.set('API_SPEC_FILE', process.env.API_SPEC_FILE || 'comprehensive-api.yaml');
    
    // Screenshot configuration
    this.config.set('SCREENSHOT_FULL_PAGE', process.env.SCREENSHOT_FULL_PAGE === 'true');
    this.config.set('SCREENSHOT_TYPE', process.env.SCREENSHOT_TYPE || 'png');
    
    // Browser configuration
    this.config.set('BROWSER_DISABLE_WEB_SECURITY', process.env.BROWSER_DISABLE_WEB_SECURITY === 'true');
    this.config.set('BROWSER_DISABLE_VIZ_COMPOSITOR', process.env.BROWSER_DISABLE_VIZ_COMPOSITOR === 'true');
    
    // Performance configuration
    this.config.set('FULLY_PARALLEL', process.env.FULLY_PARALLEL === 'true');
    this.config.set('RETRIES_ON_CI', parseInt(process.env.RETRIES_ON_CI || '2'));
    this.config.set('WORKERS_ON_CI', parseInt(process.env.WORKERS_ON_CI || '1'));
    
    // Test categories
    this.config.set('CATEGORY_1_TESTS', parseInt(process.env.CATEGORY_1_TESTS || '6'));
    this.config.set('CATEGORY_2_TESTS', parseInt(process.env.CATEGORY_2_TESTS || '2'));
    this.config.set('CATEGORY_3_TESTS', parseInt(process.env.CATEGORY_3_TESTS || '4'));
    this.config.set('TOTAL_TESTS', parseInt(process.env.TOTAL_TESTS || '12'));
    
    // Debug configuration
    this.config.set('DEBUG_MODE', process.env.DEBUG_MODE === 'true');
    this.config.set('HEADED_MODE', process.env.HEADED_MODE === 'true');
    this.config.set('TRACE_ON_RETRY', process.env.TRACE_ON_RETRY === 'true');
    this.config.set('VIDEO_ON_FAILURE', process.env.VIDEO_ON_FAILURE === 'true');
    this.config.set('SCREENSHOT_ON_FAILURE', process.env.SCREENSHOT_ON_FAILURE === 'true');
    
    // Reporting
    this.config.set('HTML_REPORT_DIR', process.env.HTML_REPORT_DIR || 'playwright-report');
    this.config.set('JSON_REPORT_FILE', process.env.JSON_REPORT_FILE || 'test-results/results.json');
    this.config.set('JUNIT_REPORT_FILE', process.env.JUNIT_REPORT_FILE || 'test-results/results.xml');
    
    // Environment
    this.config.set('NODE_ENV', process.env.NODE_ENV || 'test');
    this.config.set('CI', process.env.CI === 'true');
    
    // Logger configuration
    this.config.set('LOG_LEVEL', process.env.LOG_LEVEL || 'INFO');
    this.config.set('LOG_ENABLE_TIMESTAMP', process.env.LOG_ENABLE_TIMESTAMP !== 'false');
    this.config.set('LOG_ENABLE_COLORS', process.env.LOG_ENABLE_COLORS !== 'false');
    this.config.set('LOG_ENABLE_EMOJIS', process.env.LOG_ENABLE_EMOJIS !== 'false');
    this.config.set('LOG_OUTPUT_TO_FILE', process.env.LOG_OUTPUT_TO_FILE === 'true');
    this.config.set('LOG_FILE_PATH', process.env.LOG_FILE_PATH || 'test-results/test.log');
  }

  /**
   * Get a configuration value
   */
  public get<T>(key: string): T {
    return this.config.get(key) as T;
  }

  /**
   * Set a configuration value
   */
  public set<T>(key: string, value: T): void {
    this.config.set(key, value);
  }

  /**
   * Check if a configuration key exists
   */
  public has(key: string): boolean {
    return this.config.has(key);
  }

  /**
   * Get all configuration as an object
   */
  public getAll(): Record<string, any> {
    return Object.fromEntries(this.config);
  }

  /**
   * Update multiple configuration values at once
   */
  public updateConfig(newConfig: Record<string, any>): void {
    Object.entries(newConfig).forEach(([key, value]) => {
      this.config.set(key, value);
    });
  }

  /**
   * Reset configuration to defaults
   */
  public reset(): void {
    this.config.clear();
    this.initializeDefaultConfig();
  }

  /**
   * Get environment-specific configuration
   */
  public getEnvironmentConfig(): {
    baseUrl: string;
    projectId: string;
    apiBaseUrl: string;
    customerPortalUrl: string;
  } {
    return {
      baseUrl: this.get<string>('BASE_URL'),
      projectId: this.get<string>('PROJECT_ID'),
      apiBaseUrl: this.get<string>('API_BASE_URL'),
      customerPortalUrl: this.get<string>('CUSTOMER_PORTAL_URL')
    };
  }

  /**
   * Get test execution configuration
   */
  public getTestConfig(): {
    enableVerboseLogging: boolean;
    maxServersToValidate: number;
    apiTimeout: number;
    uiTimeout: number;
    testDataDir: string;
    screenshotDir: string;
  } {
    return {
      enableVerboseLogging: this.get<boolean>('ENABLE_VERBOSE_LOGGING'),
      maxServersToValidate: this.get<number>('MAX_SERVERS_TO_VALIDATE'),
      apiTimeout: this.get<number>('API_TIMEOUT'),
      uiTimeout: this.get<number>('UI_TIMEOUT'),
      testDataDir: this.get<string>('TEST_DATA_DIR'),
      screenshotDir: this.get<string>('SCREENSHOT_DIR')
    };
  }
}

/**
 * Convenience function to get the ConfigManager instance
 */
export const getConfig = (): ConfigManager => ConfigManager.getInstance();
