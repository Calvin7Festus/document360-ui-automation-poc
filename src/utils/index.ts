/**
 * Utils Module - Centralized Export (Cleaned Up)
 * 
 * This module provides a centralized export point for all utility classes and functions.
 * Only includes actively used utilities.
 */

// Configuration Management (Singleton Pattern)
export { ConfigManager, getConfig } from './config/config-manager';

// API Specification Parsing
export {
  ApiSpecParser,
  ApiSpecParserFactory,
  ApiSpecSourceType,
  ApiSpecParserOptions,
  ApiSpec
} from './api/api-spec-parser';

// Data Management
export {
  TestDataProvider,
  TestDataFile,
  getTestDataProvider
} from './data/test-data-provider';

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
} from './logging/logger';

export {
  LoggerFactory,
  loggers,
  getLogger,
  defaultLogger
} from './logging/logger-factory';

// Export API Factory (new organized approach)
export * from '../api-factory';
export * from '../commons/api-actions';

// Export Data Seeding utilities
export * from './data-seeding/api-data-seeder';

// Export Locator utilities (from commons)
export {
  escapeTextForSelector,
  createSafeTextSelector,
  createMultipleSelectors
} from '../commons/locator-utils';

/**
 * Design Patterns Summary (Active):
 * 
 * 1. Singleton Pattern - ConfigManager ensures single instance of configuration
 * 2. Factory Pattern - ApiSpecParserFactory creates appropriate parsers based on format
 * 3. Singleton Pattern - Logger ensures consistent logging across the framework
 * 4. Factory Pattern - ApiFactory provides organized API class instances with shared configuration
 * 5. Template Method Pattern - ApiActions provides common API operation templates
 * 6. Builder Pattern - ApiDataSeeder builds complex test data scenarios
 */