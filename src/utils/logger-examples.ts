/**
 * Logger Usage Examples
 * Demonstrates how to use the Logger functionality across the framework
 */

import { loggers, getLogger, LogLevel, LoggerFactory } from './logger-factory';
import { Logger } from './logger';

/**
 * Example 1: Using pre-configured loggers
 */
export function examplePreConfiguredLoggers() {
  // Use category-specific loggers
  loggers.api.info('Making API request to create definition');
  loggers.ui.debug('Clicking on create button');
  loggers.test.info('Starting test case TC-001');
  loggers.setup.info('Initializing test environment');
  loggers.validation.info('Validating API response structure');
  loggers.cleanup.info('Cleaning up test data');
}

/**
 * Example 2: Creating custom loggers
 */
export function exampleCustomLoggers() {
  // Create a logger for a specific component
  const modalLogger = getLogger('MODAL');
  modalLogger.info('Opening new API creation modal');
  modalLogger.debug('Modal animation completed');
  modalLogger.warn('Modal validation failed');

  // Create a logger for a specific test suite
  const importLogger = getLogger('IMPORT_TESTS');
  importLogger.info('Starting import functionality tests');
  importLogger.error('Import failed for invalid file');
}

/**
 * Example 3: Using logger with data
 */
export function exampleLoggerWithData() {
  const apiLogger = loggers.api;
  
  // Log with additional data
  apiLogger.info('API request completed', {
    endpoint: '/api/v2/definitions',
    method: 'POST',
    statusCode: 201,
    responseTime: 1250
  });

  // Log error with context
  apiLogger.error('API request failed', {
    endpoint: '/api/v2/definitions',
    method: 'DELETE',
    statusCode: 401,
    error: 'Unauthorized'
  });
}

/**
 * Example 4: Dynamic log level configuration
 */
export function exampleDynamicLogLevel() {
  // Enable debug logging for troubleshooting
  LoggerFactory.setVerboseLogging(true);
  loggers.test.debug('This debug message will now be visible');

  // Enable trace logging for detailed analysis
  LoggerFactory.setTraceLogging(true);
  loggers.api.trace('Detailed API request trace information');

  // Reset to normal logging
  LoggerFactory.setVerboseLogging(false);
  loggers.test.debug('This debug message will be hidden');
}

/**
 * Example 5: Logger in test methods
 */
export class TestExamples {
  private testLogger = getLogger('TEST_EXAMPLE');

  async exampleTestMethod() {
    this.testLogger.info('Starting test: Validate API creation');

    try {
      // Test logic here
      this.testLogger.debug('Navigating to API creation page');
      // await page.goto('/api/create');

      this.testLogger.debug('Filling form with test data');
      // await form.fill(testData);

      this.testLogger.info('API creation test completed successfully');
    } catch (error) {
      this.testLogger.error('Test failed', error);
      throw error;
    }
  }

  async exampleSetupMethod() {
    const setupLogger = loggers.setup;

    setupLogger.info('Initializing test environment');
    
    try {
      setupLogger.debug('Creating test data');
      // Create test data

      setupLogger.debug('Setting up authentication');
      // Setup auth

      setupLogger.info('Test environment ready');
    } catch (error) {
      setupLogger.error('Setup failed', error);
      throw error;
    }
  }

  async exampleCleanupMethod() {
    const cleanupLogger = loggers.cleanup;

    cleanupLogger.info('Starting test cleanup');

    try {
      cleanupLogger.debug('Deleting test API definitions');
      // Delete APIs

      cleanupLogger.debug('Clearing browser state');
      // Clear state

      cleanupLogger.info('Cleanup completed successfully');
    } catch (error) {
      cleanupLogger.warn('Cleanup encountered issues', error);
      // Continue with cleanup even if some steps fail
    }
  }
}

/**
 * Example 6: Logger configuration for different environments
 */
export function exampleEnvironmentConfiguration() {
  // Development environment - verbose logging
  if (process.env.NODE_ENV === 'development') {
    const logger = Logger.getInstance();
    logger.setLevel(LogLevel.DEBUG);
    logger.configure({
      enableColors: true,
      enableEmojis: true,
      enableTimestamp: true
    });
  }

  // Production environment - minimal logging
  if (process.env.NODE_ENV === 'production') {
    const logger = Logger.getInstance();
    logger.setLevel(LogLevel.WARN);
    logger.configure({
      enableColors: false,
      enableEmojis: false,
      outputToFile: true,
      filePath: 'logs/production.log'
    });
  }

  // CI environment - structured logging
  if (process.env.CI === 'true') {
    const logger = Logger.getInstance();
    logger.setLevel(LogLevel.INFO);
    logger.configure({
      enableColors: false,
      enableEmojis: false,
      enableTimestamp: true,
      outputToFile: true,
      filePath: 'test-results/ci.log'
    });
  }
}

/**
 * Example 7: Logger in Page Objects
 */
export class ExamplePageObject {
  private logger = getLogger('PAGE_OBJECT');

  async clickButton(buttonName: string) {
    this.logger.debug(`Clicking button: ${buttonName}`);
    
    try {
      // Click logic here
      this.logger.trace(`Button ${buttonName} clicked successfully`);
    } catch (error) {
      this.logger.error(`Failed to click button: ${buttonName}`, error);
      throw error;
    }
  }

  async validateElement(elementName: string, expectedValue: string) {
    this.logger.debug(`Validating ${elementName} equals "${expectedValue}"`);
    
    try {
      // Validation logic here
      this.logger.info(`Validation passed: ${elementName} = "${expectedValue}"`);
    } catch (error) {
      this.logger.error(`Validation failed: ${elementName}`, { 
        expected: expectedValue, 
        error: error 
      });
      throw error;
    }
  }
}

/**
 * Example 8: Performance logging
 */
export class PerformanceLogger {
  private perfLogger = getLogger('PERFORMANCE');

  async measureOperation(operationName: string, operation: () => Promise<void>) {
    const startTime = Date.now();
    this.perfLogger.info(`Starting operation: ${operationName}`);

    try {
      await operation();
      const duration = Date.now() - startTime;
      this.perfLogger.info(`Operation completed: ${operationName}`, { 
        duration: `${duration}ms` 
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      this.perfLogger.error(`Operation failed: ${operationName}`, { 
        duration: `${duration}ms`, 
        error 
      });
      throw error;
    }
  }
}

/**
 * Example usage in tests
 */
export const loggerUsageExamples = {
  // Quick logging
  info: (message: string) => loggers.test.info(message),
  error: (message: string, error?: any) => loggers.test.error(message, error),
  
  // API operations
  apiRequest: (endpoint: string) => loggers.api.debug(`Making request to ${endpoint}`),
  apiResponse: (status: number) => loggers.api.info(`Received response: ${status}`),
  
  // UI operations
  uiClick: (element: string) => loggers.ui.debug(`Clicking ${element}`),
  uiValidation: (element: string, value: string) => loggers.validation.info(`Validated ${element}: ${value}`),
  
  // Test lifecycle
  testStart: (testName: string) => loggers.test.info(`Starting test: ${testName}`),
  testEnd: (testName: string) => loggers.test.info(`Completed test: ${testName}`),
  
  // Setup and cleanup
  setupStart: () => loggers.setup.info('Starting test setup'),
  setupEnd: () => loggers.setup.info('Test setup completed'),
  cleanupStart: () => loggers.cleanup.info('Starting cleanup'),
  cleanupEnd: () => loggers.cleanup.info('Cleanup completed')
};
