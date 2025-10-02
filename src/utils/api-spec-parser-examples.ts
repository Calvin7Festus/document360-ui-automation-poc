/**
 * Examples and future format parsers for ApiSpecParser
 * This file demonstrates how to extend the ApiSpecParser with new formats using Factory Pattern
 */

import { ApiSpecParserFactory, ApiSpecSourceType, ApiSpec, ApiSpecParserOptions } from './api-spec-parser';

/**
 * Example: XML API Specification Parser (for SOAP/legacy APIs)
 */
class XmlApiSpecParser {
  canParse(source: string, sourceType: ApiSpecSourceType): boolean {
    if (sourceType === ApiSpecSourceType.FILE_PATH) {
      return source.toLowerCase().endsWith('.xml');
    }
    if (sourceType === ApiSpecSourceType.CONTENT_STRING) {
      const trimmed = source.trim();
      return trimmed.startsWith('<?xml') || trimmed.startsWith('<');
    }
    return false;
  }

  parse(content: string): ApiSpec {
    // This would require an XML parser like xml2js
    throw new Error('XML parsing not implemented - would need xml2js library');
  }

  getSupportedExtensions(): string[] {
    return ['.xml'];
  }
}

/**
 * Example: TOML API Specification Parser
 */
class TomlApiSpecParser {
  canParse(source: string, sourceType: ApiSpecSourceType): boolean {
    if (sourceType === ApiSpecSourceType.FILE_PATH) {
      return source.toLowerCase().endsWith('.toml');
    }
    if (sourceType === ApiSpecSourceType.CONTENT_STRING) {
      // Simple heuristic for TOML
      const trimmed = source.trim();
      return trimmed.includes('[') && trimmed.includes('=') && !trimmed.startsWith('{');
    }
    return false;
  }

  parse(content: string): ApiSpec {
    // This would require a TOML parser like @iarna/toml
    throw new Error('TOML parsing not implemented - would need @iarna/toml library');
  }

  getSupportedExtensions(): string[] {
    return ['.toml'];
  }
}

/**
 * Example usage demonstrations using Factory Pattern
 */
export class ApiSpecParserExamples {
  
  /**
   * Basic usage - from file (backward compatible)
   */
  static basicFileUsage(filePath: string) {
    const parser = ApiSpecParserFactory.createFromFile(filePath);
    return parser.parseApiSpec();
  }

  /**
   * Factory pattern - from file with custom options
   */
  static factoryFromFile(filePath: string) {
    const options: ApiSpecParserOptions = {
      validationEnabled: true,
      cacheEnabled: true
    };
    const parser = ApiSpecParserFactory.createFromFile(filePath, options);
    return parser.parseApiSpec();
  }

  /**
   * Factory pattern - from content string
   */
  static factoryFromContent(yamlContent: string) {
    const options: ApiSpecParserOptions = {
      validationEnabled: false, // Skip validation for raw content
      cacheEnabled: true
    };
    const parser = ApiSpecParserFactory.createFromContent(yamlContent, options);
    return parser.parseApiSpec();
  }

  /**
   * Factory pattern - with custom parsers
   */
  static factoryWithCustomParsers(filePath: string) {
    const customParsers = [
      new XmlApiSpecParser() as any, // Cast needed due to interface
      new TomlApiSpecParser() as any
    ];
    
    const options: ApiSpecParserOptions = {
      validationEnabled: true,
      cacheEnabled: true
    };
    
    const parser = ApiSpecParserFactory.createWithCustomParsers(
      filePath,
      ApiSpecSourceType.FILE_PATH,
      customParsers,
      options
    );
    
    return parser.parseApiSpec();
  }

  /**
   * Factory pattern - auto-detect format
   */
  static factoryAutoDetect(filePath: string) {
    const options: ApiSpecParserOptions = {
      validationEnabled: true,
      cacheEnabled: true
    };
    
    const parser = ApiSpecParserFactory.createAuto(filePath, ApiSpecSourceType.FILE_PATH, options);
    return parser.parseApiSpec();
  }

  /**
   * Future: URL-based parsing (when implemented)
   */
  static futureUrlUsage(url: string) {
    const options: ApiSpecParserOptions = {
      validationEnabled: true,
      cacheEnabled: false // Don't cache remote content
    };
    
    const parser = ApiSpecParserFactory.createFromUrl(url, options);
    return parser.parseApiSpec();
  }

  /**
   * Register global format parser
   */
  static registerCustomFormat() {
    // Register a new format parser globally
    ApiSpecParserFactory.registerFormatParser(new XmlApiSpecParser() as any);
    
    // Now all factory methods will support XML
    const parser = ApiSpecParserFactory.createFromFile('api.xml');
    return parser.parseApiSpec();
  }

  /**
   * Get supported extensions
   */
  static getSupportedFormats() {
    return ApiSpecParserFactory.getSupportedExtensions();
  }

  /**
   * Advanced: Multiple format support with fallback
   */
  static parseWithFallback(sources: string[]) {
    const options: ApiSpecParserOptions = {
      validationEnabled: false, // Skip validation during fallback attempts
      cacheEnabled: true
    };
    
    for (const source of sources) {
      try {
        const parser = ApiSpecParserFactory.createFromFile(source, options);
        return parser.parseApiSpec();
      } catch (error) {
        console.warn(`Failed to parse ${source}: ${error}`);
        continue;
      }
    }
    throw new Error('All parsing attempts failed');
  }
}

/**
 * Example API specifications in different formats
 */
export const ExampleApiSpecs = {
  
  /**
   * Minimal YAML API spec
   */
  minimalYaml: `
openapi: 3.0.0
info:
  title: Example API
  version: 1.0.0
  description: A simple example API
paths:
  /users:
    get:
      summary: Get users
      responses:
        '200':
          description: Success
`,

  /**
   * Minimal JSON API spec
   */
  minimalJson: `{
  "openapi": "3.0.0",
  "info": {
    "title": "Example API",
    "version": "1.0.0",
    "description": "A simple example API"
  },
  "paths": {
    "/users": {
      "get": {
        "summary": "Get users",
        "responses": {
          "200": {
            "description": "Success"
          }
        }
      }
    }
  }
}`,

  /**
   * Example TOML API spec (hypothetical format)
   */
  exampleToml: `
[info]
title = "Example API"
version = "1.0.0"
description = "A simple example API"

[paths."/users".get]
summary = "Get users"

[paths."/users".get.responses."200"]
description = "Success"
`
};
