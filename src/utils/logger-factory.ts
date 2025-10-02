/**
 * Logger Factory - Creates configured logger instances
 * Integrates with ConfigManager for environment-based configuration
 */

import { Logger, LogLevel, LoggerConfig, ChildLogger } from './logger';
import { ConfigManager } from './config-manager';

/**
 * Logger Factory class for creating configured logger instances
 */
export class LoggerFactory {
  private static configManager = ConfigManager.getInstance();

  /**
   * Create a logger instance with configuration from environment
   */
  public static createLogger(prefix?: string): Logger {
    const config = LoggerFactory.getLoggerConfig();
    if (prefix) {
      config.prefix = prefix;
    }
    return Logger.getInstance(config);
  }

  /**
   * Create a child logger for a specific category
   */
  public static createChildLogger(category: string): ChildLogger {
    const logger = LoggerFactory.createLogger();
    return logger.createChildLogger(category);
  }

  /**
   * Create a logger for API operations
   */
  public static createApiLogger(): ChildLogger {
    return LoggerFactory.createChildLogger('API');
  }

  /**
   * Create a logger for UI operations
   */
  public static createUILogger(): ChildLogger {
    return LoggerFactory.createChildLogger('UI');
  }

  /**
   * Create a logger for test operations
   */
  public static createTestLogger(): ChildLogger {
    return LoggerFactory.createChildLogger('TEST');
  }

  /**
   * Create a logger for setup/teardown operations
   */
  public static createSetupLogger(): ChildLogger {
    return LoggerFactory.createChildLogger('SETUP');
  }

  /**
   * Create a logger for validation operations
   */
  public static createValidationLogger(): ChildLogger {
    return LoggerFactory.createChildLogger('VALIDATION');
  }

  /**
   * Create a logger for cleanup operations
   */
  public static createCleanupLogger(): ChildLogger {
    return LoggerFactory.createChildLogger('CLEANUP');
  }

  /**
   * Get logger configuration from ConfigManager
   */
  private static getLoggerConfig(): LoggerConfig {
    const logLevelString = LoggerFactory.configManager.get<string>('LOG_LEVEL');
    const logLevel = LoggerFactory.parseLogLevel(logLevelString);

    return {
      level: logLevel,
      enableTimestamp: LoggerFactory.configManager.get<boolean>('LOG_ENABLE_TIMESTAMP'),
      enableColors: LoggerFactory.configManager.get<boolean>('LOG_ENABLE_COLORS'),
      enableEmojis: LoggerFactory.configManager.get<boolean>('LOG_ENABLE_EMOJIS'),
      outputToFile: LoggerFactory.configManager.get<boolean>('LOG_OUTPUT_TO_FILE'),
      filePath: LoggerFactory.configManager.get<string>('LOG_FILE_PATH')
    };
  }

  /**
   * Parse log level string to LogLevel enum
   */
  private static parseLogLevel(levelString: string): LogLevel {
    switch (levelString.toUpperCase()) {
      case 'ERROR':
        return LogLevel.ERROR;
      case 'WARN':
      case 'WARNING':
        return LogLevel.WARN;
      case 'INFO':
        return LogLevel.INFO;
      case 'DEBUG':
        return LogLevel.DEBUG;
      case 'TRACE':
        return LogLevel.TRACE;
      default:
        return LogLevel.INFO;
    }
  }

  /**
   * Update logger configuration at runtime
   */
  public static updateLogLevel(level: LogLevel): void {
    const logger = Logger.getInstance();
    logger.setLevel(level);
  }

  /**
   * Enable/disable verbose logging
   */
  public static setVerboseLogging(enabled: boolean): void {
    const level = enabled ? LogLevel.DEBUG : LogLevel.INFO;
    LoggerFactory.updateLogLevel(level);
  }

  /**
   * Enable/disable trace logging
   */
  public static setTraceLogging(enabled: boolean): void {
    const level = enabled ? LogLevel.TRACE : LogLevel.INFO;
    LoggerFactory.updateLogLevel(level);
  }
}

/**
 * Pre-configured logger instances for common use cases
 */
export const loggers = {
  api: LoggerFactory.createApiLogger(),
  ui: LoggerFactory.createUILogger(),
  test: LoggerFactory.createTestLogger(),
  setup: LoggerFactory.createSetupLogger(),
  validation: LoggerFactory.createValidationLogger(),
  cleanup: LoggerFactory.createCleanupLogger()
};

/**
 * Convenience function to get a logger for a specific category
 */
export function getLogger(category: string): ChildLogger {
  return LoggerFactory.createChildLogger(category);
}

/**
 * Default logger instance
 */
export const defaultLogger = LoggerFactory.createLogger('FRAMEWORK');
