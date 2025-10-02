// Test Data Configuration and Constants
export const TEST_DATA_CONFIG = {
  // API spec file from environment variable with fallback
  apiSpecFile: process.env.API_SPEC_FILE || 'comprehensive-api.yaml',
};

// Test Data Interface - Structure of extracted API specification data
export interface TestDataInterface {
  apiTitle: string;
  apiVersion: string;
  apiDescription?: string;
  termsOfService?: string;
  contactInfo?: { 
    name?: string; 
    email?: string; 
    url?: string; 
  };
  licenseInfo?: { 
    name?: string; 
    url?: string; 
  };
  servers: Array<{ 
    url: string; 
    description?: string;
    variables?: { [key: string]: { default: string; description?: string; enum?: string[] } };
  }>;
  tags: Array<{ 
    name: string; 
    description?: string; 
  }>;
  endpointPaths: string[];
  endpoints: Array<{ path: string; methods: string[] }>;
}

// Test Configuration Constants - Now loaded from environment variables
export const TEST_CONFIG = {
  // Timeouts
  DEFAULT_TIMEOUT: parseInt(process.env.DEFAULT_TIMEOUT || '10000'),
  API_CREATION_TIMEOUT: parseInt(process.env.API_CREATION_TIMEOUT || '30000'),
  NAVIGATION_TIMEOUT: parseInt(process.env.NAVIGATION_TIMEOUT || '60000'),
  
  // URLs
  BASE_URL: process.env.TEST_URL || 'https://portal.document360.io/1bff9bc5-3c41-43fe-852a-5442d48212ca/api-documentation',
  FALLBACK_URL: process.env.FALLBACK_URL || 'https://portal.document360.io',
  
  // Test Data Paths
  TEST_DATA_DIR: process.env.TEST_DATA_DIR || '../../../../test-data/create-api-doc/',
  
  // Screenshot Configuration
  SCREENSHOT_DIR: process.env.SCREENSHOT_DIR || 'test-results/validation-screenshots/',
  SCREENSHOT_OPTIONS: {
    fullPage: process.env.SCREENSHOT_FULL_PAGE === 'true',
    type: (process.env.SCREENSHOT_TYPE || 'png') as 'png' | 'jpeg'
  },
  
  // Validation Limits
  MAX_SERVERS_TO_VALIDATE: parseInt(process.env.MAX_SERVERS_TO_VALIDATE || '3'),
  MAX_TAGS_TO_VALIDATE: parseInt(process.env.MAX_TAGS_TO_VALIDATE || '5'),
  MAX_ENDPOINTS_TO_VALIDATE: parseInt(process.env.MAX_ENDPOINTS_TO_VALIDATE || '10'),
  
  // Console Logging
  ENABLE_VERBOSE_LOGGING: process.env.ENABLE_VERBOSE_LOGGING === 'true',
  LOG_PREFIXES: {
    FILE_USAGE: '📄',
    EXTRACTED_DATA: '📋',
    VALIDATION: '🔍',
    SUCCESS: '✅',
    WARNING: '⚠️',
    INFO: 'ℹ️',
    CLEANUP: '🧹'
  }
};

// Available Test Data Files Registry
export const AVAILABLE_TEST_FILES = {
  SIMPLE: {
    file: 'simple-doc.yaml',
    description: 'Hello World API v1.0.0 - Basic API with minimal endpoints',
    expectedTitle: 'Hello World API',
    expectedVersion: '1.0.0'
  },
  MINIMAL: {
    file: 'minimal-api.yaml',
    description: 'Minimal API v1.0.0 - API without description field (tests negative validation)',
    expectedTitle: 'Minimal API',
    expectedVersion: '1.0.0'
  },
  YAML: {
    file: 'yaml-api.yaml', 
    description: 'YAML API Specification v1.0.0 - YAML format testing',
    expectedTitle: 'YAML API Specification',
    expectedVersion: '1.0.0'
  },
  JSON: {
    file: 'json-api.json',
    description: 'JSON API Specification v2.0.0 - JSON format testing', 
    expectedTitle: 'JSON API Specification',
    expectedVersion: '2.0.0'
  },
  YML: {
    file: 'yml-api.yml',
    description: 'YML API Specification v3.0.0 - YML format testing',
    expectedTitle: 'YML API Specification', 
    expectedVersion: '3.0.0'
  },
  COMPREHENSIVE: {
    file: 'comprehensive-api.yaml',
    description: 'Comprehensive Test API v1.0.0 - Full featured API with all OpenAPI elements',
    expectedTitle: 'Comprehensive Test API',
    expectedVersion: '1.0.0'
  }
};

// Test Messages and Labels
export const TEST_MESSAGES = {
  VALIDATION: {
    API_TITLE: (title: string) => `${TEST_CONFIG.LOG_PREFIXES.VALIDATION} Validating API title: "${title}"`,
    API_VERSION: (version: string) => `${TEST_CONFIG.LOG_PREFIXES.VALIDATION} Validating API version: "${version}"`,
    API_DESCRIPTION: (description: string) => `${TEST_CONFIG.LOG_PREFIXES.VALIDATION} Validating API description: "${description}"`,
    API_DESCRIPTION_ABSENT: `${TEST_CONFIG.LOG_PREFIXES.VALIDATION} Validating that API description is not displayed`,
    CONTACT_NAME: (name: string) => `${TEST_CONFIG.LOG_PREFIXES.VALIDATION} Validating contact name: "${name}"`,
    CONTACT_EMAIL: (email: string) => `${TEST_CONFIG.LOG_PREFIXES.VALIDATION} Validating contact email: "${email}"`,
    CONTACT_URL: (url: string) => `${TEST_CONFIG.LOG_PREFIXES.VALIDATION} Validating contact URL: "${url}"`,
    LICENSE_NAME: (name: string) => `${TEST_CONFIG.LOG_PREFIXES.VALIDATION} Validating license name: "${name}"`,
    LICENSE_URL: (url: string) => `${TEST_CONFIG.LOG_PREFIXES.VALIDATION} Validating license URL: "${url}"`,
    TERMS_OF_SERVICE: (terms: string) => `${TEST_CONFIG.LOG_PREFIXES.VALIDATION} Validating terms of service: "${terms}"`,
    SERVERS: (count: number) => `${TEST_CONFIG.LOG_PREFIXES.VALIDATION} Validating ${count} server URL(s)`,
    SERVER_DESCRIPTIONS: (count: number) => `${TEST_CONFIG.LOG_PREFIXES.VALIDATION} Validating ${count} server description(s)`,
    SERVER_DETAIL: (index: number, url: string) => `   Server ${index + 1}: "${url}"`,
    SERVER_DESC_DETAIL: (index: number, description: string) => `   Server ${index + 1} description: "${description}"`,
    ELEMENT_NOT_DISPLAYED: (element: string) => `${TEST_CONFIG.LOG_PREFIXES.VALIDATION} Verified ${element} element is not displayed`,
    ELEMENT_EMPTY: (element: string) => `${TEST_CONFIG.LOG_PREFIXES.VALIDATION} Verified ${element} is empty/not displayed`
  },
  SKIPPING: {
    NO_DESCRIPTION: `${TEST_CONFIG.LOG_PREFIXES.INFO} No API description found in test data, skipping validation`,
    NO_TERMS: `${TEST_CONFIG.LOG_PREFIXES.INFO} No terms of service found in test data, skipping validation`,
    NO_CONTACT_NAME: `${TEST_CONFIG.LOG_PREFIXES.INFO} No contact name found in test data, skipping validation`,
    NO_CONTACT_EMAIL: `${TEST_CONFIG.LOG_PREFIXES.INFO} No contact email found in test data, skipping validation`,
    NO_CONTACT_URL: `${TEST_CONFIG.LOG_PREFIXES.INFO} No contact URL found in test data, skipping validation`,
    NO_LICENSE_NAME: `${TEST_CONFIG.LOG_PREFIXES.INFO} No license name found in test data, skipping validation`,
    NO_LICENSE_URL: `${TEST_CONFIG.LOG_PREFIXES.INFO} No license URL found in test data, skipping validation`,
    NO_SERVERS: `${TEST_CONFIG.LOG_PREFIXES.INFO} No servers found in test data, skipping validation`
  },
  SETUP: {
    FILE_USAGE: (file: string) => `${TEST_CONFIG.LOG_PREFIXES.FILE_USAGE} Using test data file: ${file}`,
    EXTRACTED_DATA: `${TEST_CONFIG.LOG_PREFIXES.EXTRACTED_DATA} Extracted Test Data:`,
    TITLE: (title: string) => `   Title: "${title}"`,
    VERSION: (version: string) => `   Version: "${version}"`,
    DESCRIPTION: (description: string) => `   Description: "${description || 'N/A'}"`,
    SERVERS: (count: number) => `   Servers: ${count} server(s)`,
    TAGS: (count: number) => `   Tags: ${count} tag(s)`,
    ENDPOINTS: (count: number) => `   Endpoints: ${count} endpoint(s)`,
    API_CREATED: (id: string) => `${TEST_CONFIG.LOG_PREFIXES.SUCCESS} Captured API creation: ${id}`,
    CLEANUP_START: `${TEST_CONFIG.LOG_PREFIXES.CLEANUP} Starting cleanup...`,
    CLEANUP_RESULT: (result: boolean) => `${TEST_CONFIG.LOG_PREFIXES.CLEANUP} Cleanup result: ${result}`
  }
};

// Helper function to get current test data file info
export function getCurrentTestFileInfo() {
  const currentFile = TEST_DATA_CONFIG.apiSpecFile;
  const fileInfo = Object.values(AVAILABLE_TEST_FILES).find(info => info.file === currentFile);
  return fileInfo || {
    file: currentFile,
    description: 'Custom test file',
    expectedTitle: 'Unknown',
    expectedVersion: 'Unknown'
  };
}

// Helper function to validate test data configuration
export function validateTestConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!TEST_DATA_CONFIG.apiSpecFile) {
    errors.push('API spec file is not specified');
  }
  
  if (!TEST_DATA_CONFIG.apiSpecFile.match(/\.(yaml|yml|json)$/i)) {
    errors.push('API spec file must be a YAML, YML, or JSON file');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
