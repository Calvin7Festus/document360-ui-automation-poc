/**
 * Utils Module - Centralized Export
 * 
 * This module provides a centralized export point for all utility classes and functions.
 * It implements several design patterns to create a robust and maintainable test framework.
 */

// Configuration Management (Singleton Pattern)
export { ConfigManager, getConfig } from './config-manager';

// API Response Tracking (Observer Pattern)
export {
  ApiResponseObserver,
  ApiCreationObserver,
  ApiResponseLogger,
  IApiResponseObserver,
  ApiResponseData
} from './api-response-observer';

// Validation Strategies (Strategy Pattern)
export {
  ValidationContext,
  ValidationStrategyFactory,
  CompositeValidationStrategy,
  IValidationStrategy,
  ApiMetadataValidationStrategy,
  ApiEndpointsValidationStrategy,
  ApiSecurityValidationStrategy,
  ApiParametersValidationStrategy,
  ApiResponsesValidationStrategy
} from './validation-strategy';

// API Specification Parsing (Factory Pattern)
export {
  ApiSpecParser,
  ApiSpecParserFactory,
  ApiSpecSourceType,
  ApiSpecParserOptions,
  ApiSpec
} from './api-spec-parser';

// Test Setup Management
export {
  TestSetupManager,
  TestSetupContext,
  createTestSetupManager
} from './test-setup-manager';

export {
  ImportTestSetupManager,
  ImportTestSetupContext,
  createImportTestSetupManager
} from './import-test-setup-manager';

// API Helper
export { ApiHelper } from './api-helper';

// Logger (Singleton Pattern)
export {
  Logger,
  ChildLogger,
  LogLevel,
  LoggerConfig,
  LogEntry,
  createLogger,
  logger,
  log
} from './logger';

export {
  LoggerFactory,
  loggers,
  getLogger,
  defaultLogger
} from './logger-factory';

// Examples and Documentation
export { ApiSpecParserExamples } from './api-spec-parser-examples';

/**
 * Utility Factory - Creates commonly used utility instances
 */
export class UtilityFactory {
  /**
   * Create a complete test setup for Category 2 tests
   */
  static createCategory2Setup(page: any) {
    const { TestSetupManager } = require('./test-setup-manager');
    return new TestSetupManager(page);
  }

  /**
   * Create a complete test setup for Category 1 tests
   */
  static createCategory1Setup(page: any) {
    const { ImportTestSetupManager } = require('./import-test-setup-manager');
    return new ImportTestSetupManager(page);
  }

  /**
   * Create an API helper with observer pattern
   */
  static createApiHelper(page: any) {
    const { ApiHelper } = require('./api-helper');
    return new ApiHelper(page);
  }

  /**
   * Create a validation context with composite strategy
   */
  static createCompositeValidator() {
    const { CompositeValidationStrategy, ValidationStrategyFactory, ValidationContext } = require('./validation-strategy');
    const composite = new CompositeValidationStrategy();
    
    // Add all validation strategies
    composite.addStrategy(ValidationStrategyFactory.createStrategy('metadata'));
    composite.addStrategy(ValidationStrategyFactory.createStrategy('endpoints'));
    composite.addStrategy(ValidationStrategyFactory.createStrategy('security'));
    composite.addStrategy(ValidationStrategyFactory.createStrategy('parameters'));
    composite.addStrategy(ValidationStrategyFactory.createStrategy('responses'));
    
    return new ValidationContext(composite);
  }

  /**
   * Create an API spec parser using factory pattern
   */
  static createApiSpecParser(filePath: string) {
    const { ApiSpecParserFactory } = require('./api-spec-parser');
    return ApiSpecParserFactory.createFromFile(filePath);
  }

  /**
   * Create a logger for a specific category
   */
  static createLogger(category: string) {
    const { LoggerFactory } = require('./logger-factory');
    return LoggerFactory.createChildLogger(category);
  }

  /**
   * Create a complete logging setup for tests
   */
  static createTestLogging() {
    const { LoggerFactory } = require('./logger-factory');
    return {
      api: LoggerFactory.createApiLogger(),
      ui: LoggerFactory.createUILogger(),
      test: LoggerFactory.createTestLogger(),
      setup: LoggerFactory.createSetupLogger(),
      validation: LoggerFactory.createValidationLogger(),
      cleanup: LoggerFactory.createCleanupLogger()
    };
  }
}

/**
 * Design Patterns Summary:
 * 
 * 1. Singleton Pattern - ConfigManager ensures single instance of configuration
 * 2. Observer Pattern - ApiResponseObserver notifies multiple observers of API responses
 * 3. Strategy Pattern - ValidationStrategy allows different validation approaches
 * 4. Factory Pattern - ApiSpecParserFactory creates appropriate parsers based on format
 * 5. Composite Pattern - CompositeValidationStrategy combines multiple validation strategies
 * 6. Singleton Pattern - Logger ensures consistent logging across the framework
 */
