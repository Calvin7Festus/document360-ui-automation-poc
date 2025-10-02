/**
 * Logger utility for consistent logging across the framework
 * Supports different log levels, formatting, and configuration
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4
}

export interface LoggerConfig {
  level: LogLevel;
  enableTimestamp: boolean;
  enableColors: boolean;
  enableEmojis: boolean;
  prefix?: string;
  outputToFile?: boolean;
  filePath?: string;
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  category?: string;
  data?: any;
}

/**
 * Centralized Logger class implementing Singleton pattern
 */
export class Logger {
  private static instance: Logger;
  private config: LoggerConfig;
  private logHistory: LogEntry[] = [];

  // Color codes for console output
  private readonly colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    green: '\x1b[32m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
    gray: '\x1b[90m'
  };

  // Emoji mappings for log levels
  private readonly emojis = {
    [LogLevel.ERROR]: '❌',
    [LogLevel.WARN]: '⚠️',
    [LogLevel.INFO]: 'ℹ️',
    [LogLevel.DEBUG]: '🔍',
    [LogLevel.TRACE]: '🔬'
  };

  // Level names for display
  private readonly levelNames = {
    [LogLevel.ERROR]: 'ERROR',
    [LogLevel.WARN]: 'WARN',
    [LogLevel.INFO]: 'INFO',
    [LogLevel.DEBUG]: 'DEBUG',
    [LogLevel.TRACE]: 'TRACE'
  };

  private constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      level: LogLevel.INFO,
      enableTimestamp: true,
      enableColors: true,
      enableEmojis: true,
      outputToFile: false,
      ...config
    };
  }

  /**
   * Get singleton instance of Logger
   */
  public static getInstance(config?: Partial<LoggerConfig>): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(config);
    }
    return Logger.instance;
  }

  /**
   * Update logger configuration
   */
  public configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Set log level
   */
  public setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  /**
   * Log error message
   */
  public error(message: string, category?: string, data?: any): void {
    this.log(LogLevel.ERROR, message, category, data);
  }

  /**
   * Log warning message
   */
  public warn(message: string, category?: string, data?: any): void {
    this.log(LogLevel.WARN, message, category, data);
  }

  /**
   * Log info message
   */
  public info(message: string, category?: string, data?: any): void {
    this.log(LogLevel.INFO, message, category, data);
  }

  /**
   * Log debug message
   */
  public debug(message: string, category?: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, category, data);
  }

  /**
   * Log trace message
   */
  public trace(message: string, category?: string, data?: any): void {
    this.log(LogLevel.TRACE, message, category, data);
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, category?: string, data?: any): void {
    // Check if log level is enabled
    if (level > this.config.level) {
      return;
    }

    const logEntry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      category,
      data
    };

    // Add to history
    this.logHistory.push(logEntry);

    // Format and output the log
    const formattedMessage = this.formatMessage(logEntry);
    this.output(level, formattedMessage);

    // Write to file if enabled
    if (this.config.outputToFile && this.config.filePath) {
      this.writeToFile(formattedMessage);
    }
  }

  /**
   * Format log message
   */
  private formatMessage(entry: LogEntry): string {
    let parts: string[] = [];

    // Add timestamp
    if (this.config.enableTimestamp) {
      const timestamp = entry.timestamp.toISOString().replace('T', ' ').substring(0, 19);
      parts.push(`[${timestamp}]`);
    }

    // Add emoji and level
    let levelPart = '';
    if (this.config.enableEmojis) {
      levelPart += this.emojis[entry.level] + ' ';
    }
    levelPart += this.levelNames[entry.level];
    parts.push(`[${levelPart}]`);

    // Add category if provided
    if (entry.category) {
      parts.push(`[${entry.category}]`);
    }

    // Add prefix if configured
    if (this.config.prefix) {
      parts.push(`[${this.config.prefix}]`);
    }

    // Add message
    parts.push(entry.message);

    // Add data if provided
    if (entry.data) {
      parts.push(`- Data: ${JSON.stringify(entry.data)}`);
    }

    return parts.join(' ');
  }

  /**
   * Output formatted message to console
   */
  private output(level: LogLevel, message: string): void {
    if (this.config.enableColors) {
      const coloredMessage = this.colorizeMessage(level, message);
      console.log(coloredMessage);
    } else {
      console.log(message);
    }
  }

  /**
   * Add colors to message based on log level
   */
  private colorizeMessage(level: LogLevel, message: string): string {
    let color: string;
    
    switch (level) {
      case LogLevel.ERROR:
        color = this.colors.red;
        break;
      case LogLevel.WARN:
        color = this.colors.yellow;
        break;
      case LogLevel.INFO:
        color = this.colors.blue;
        break;
      case LogLevel.DEBUG:
        color = this.colors.green;
        break;
      case LogLevel.TRACE:
        color = this.colors.gray;
        break;
      default:
        color = this.colors.reset;
    }

    return `${color}${message}${this.colors.reset}`;
  }

  /**
   * Write log to file (placeholder implementation)
   */
  private writeToFile(message: string): void {
    // Implementation would depend on environment (Node.js vs browser)
    // For now, this is a placeholder
    if (typeof require !== 'undefined') {
      try {
        const fs = require('fs');
        const logMessage = message + '\n';
        fs.appendFileSync(this.config.filePath!, logMessage);
      } catch (error) {
        // Silently fail if file writing is not available
      }
    }
  }

  /**
   * Get log history
   */
  public getHistory(): LogEntry[] {
    return [...this.logHistory];
  }

  /**
   * Clear log history
   */
  public clearHistory(): void {
    this.logHistory = [];
  }

  /**
   * Get logs by level
   */
  public getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logHistory.filter(entry => entry.level === level);
  }

  /**
   * Get logs by category
   */
  public getLogsByCategory(category: string): LogEntry[] {
    return this.logHistory.filter(entry => entry.category === category);
  }

  /**
   * Export logs as JSON
   */
  public exportLogs(): string {
    return JSON.stringify(this.logHistory, null, 2);
  }

  /**
   * Create a child logger with a specific category
   */
  public createChildLogger(category: string): ChildLogger {
    return new ChildLogger(this, category);
  }
}

/**
 * Child logger for category-specific logging
 */
export class ChildLogger {
  constructor(private parent: Logger, private category: string) {}

  error(message: string, data?: any): void {
    this.parent.error(message, this.category, data);
  }

  warn(message: string, data?: any): void {
    this.parent.warn(message, this.category, data);
  }

  info(message: string, data?: any): void {
    this.parent.info(message, this.category, data);
  }

  debug(message: string, data?: any): void {
    this.parent.debug(message, this.category, data);
  }

  trace(message: string, data?: any): void {
    this.parent.trace(message, this.category, data);
  }
}

/**
 * Factory function to create logger instances
 */
export function createLogger(config?: Partial<LoggerConfig>): Logger {
  return Logger.getInstance(config);
}

/**
 * Default logger instance
 */
export const logger = Logger.getInstance();

/**
 * Convenience functions for quick logging
 */
export const log = {
  error: (message: string, category?: string, data?: any) => logger.error(message, category, data),
  warn: (message: string, category?: string, data?: any) => logger.warn(message, category, data),
  info: (message: string, category?: string, data?: any) => logger.info(message, category, data),
  debug: (message: string, category?: string, data?: any) => logger.debug(message, category, data),
  trace: (message: string, category?: string, data?: any) => logger.trace(message, category, data)
};
