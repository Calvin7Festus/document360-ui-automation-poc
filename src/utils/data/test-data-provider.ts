import path from 'path';
import fs from 'fs';

/**
 * Test Data Provider - Manages data-driven testing with multiple test data files
 */

export interface TestDataFile {
  file: string;
  description: string;
  expectedTitle: string;
  expectedVersion: string;
  format: 'yaml' | 'json' | 'yml';
  category: 'simple' | 'comprehensive' | 'domain-specific' | 'minimal';
  complexity: 'low' | 'medium' | 'high';
  hasAuth?: boolean;
  hasServers?: boolean;
  hasExternalDocs?: boolean;
  tags: string[];
}

/**
 * Comprehensive test data registry with all available test files
 */
export const TEST_DATA_REGISTRY: Record<string, TestDataFile> = {
  // Simple APIs
  SIMPLE_YAML: {
    file: 'valid-apis/simple/simple-doc.yaml',
    description: 'Hello World API v1.0.0 - Basic API with minimal endpoints',
    expectedTitle: 'Hello World API',
    expectedVersion: '1.0.0',
    format: 'yaml',
    category: 'simple',
    complexity: 'low',
    hasAuth: false,
    hasServers: true,
    hasExternalDocs: false,
    tags: ['basic', 'minimal', 'hello-world']
  },
  SIMPLE_JSON: {
    file: 'valid-apis/simple/simple-doc.json',
    description: 'Simple User API v1.0.0 - Basic API in JSON format',
    expectedTitle: 'Simple User API',
    expectedVersion: '1.0.0',
    format: 'json',
    category: 'simple',
    complexity: 'low',
    hasAuth: false,
    hasServers: true,
    hasExternalDocs: false,
    tags: ['basic', 'minimal', 'json']
  },
  SIMPLE_YML: {
    file: 'valid-apis/simple/simple-doc.yml',
    description: 'Hello World API v1.0.0 - Basic API in YML format',
    expectedTitle: 'Hello World API',
    expectedVersion: '1.0.0',
    format: 'yml',
    category: 'simple',
    complexity: 'low',
    hasAuth: false,
    hasServers: true,
    hasExternalDocs: false,
    tags: ['basic', 'minimal', 'yml']
  },
  
  // Minimal APIs
  MINIMAL_API: {
    file: 'valid-apis/minimal/minimal-api.yaml',
    description: 'Minimal API v1.0.0 - API without description field (tests negative validation)',
    expectedTitle: 'Minimal API',
    expectedVersion: '1.0.0',
    format: 'yaml',
    category: 'minimal',
    complexity: 'low',
    hasAuth: false,
    hasServers: false,
    hasExternalDocs: false,
    tags: ['minimal', 'negative-testing']
  },
  
  // Format-specific APIs
  YAML_API: {
    file: 'format-specific/yaml/yaml-api.yaml',
    description: 'YAML API Specification v1.0.0 - YAML format testing',
    expectedTitle: 'YAML API Specification',
    expectedVersion: '1.0.0',
    format: 'yaml',
    category: 'simple',
    complexity: 'medium',
    hasAuth: false,
    hasServers: true,
    hasExternalDocs: false,
    tags: ['yaml', 'format-testing']
  },
  JSON_API: {
    file: 'format-specific/json/json-api.json',
    description: 'JSON API Specification v2.0.0 - JSON format testing',
    expectedTitle: 'JSON API Specification',
    expectedVersion: '2.0.0',
    format: 'json',
    category: 'simple',
    complexity: 'medium',
    hasAuth: false,
    hasServers: true,
    hasExternalDocs: false,
    tags: ['json', 'format-testing']
  },
  YML_API: {
    file: 'format-specific/yaml/yml-api.yml',
    description: 'YML API Specification v3.0.0 - YML format testing',
    expectedTitle: 'YML API Specification',
    expectedVersion: '3.0.0',
    format: 'yml',
    category: 'simple',
    complexity: 'medium',
    hasAuth: false,
    hasServers: true,
    hasExternalDocs: false,
    tags: ['yml', 'format-testing']
  },
  
  // Comprehensive APIs
  COMPREHENSIVE: {
    file: 'valid-apis/comprehensive/comprehensive-api.yaml',
    description: 'Comprehensive Test API v1.0.0 - Full featured API with all OpenAPI elements',
    expectedTitle: 'Comprehensive Test API',
    expectedVersion: '1.0.0',
    format: 'yaml',
    category: 'comprehensive',
    complexity: 'high',
    hasAuth: true,
    hasServers: true,
    hasExternalDocs: true,
    tags: ['comprehensive', 'full-featured', 'complex']
  },
  
  // Domain-specific APIs
  PETSTORE: {
    file: 'valid-apis/domain-specific/petstore-api.yaml',
    description: 'Swagger Petstore v1.0.11 - Classic OpenAPI example with OAuth2 and API Key auth',
    expectedTitle: 'Swagger Petstore',
    expectedVersion: '1.0.11',
    format: 'yaml',
    category: 'domain-specific',
    complexity: 'high',
    hasAuth: true,
    hasServers: true,
    hasExternalDocs: true,
    tags: ['petstore', 'oauth2', 'api-key', 'classic']
  },
  ECOMMERCE: {
    file: 'valid-apis/domain-specific/ecommerce-api.json',
    description: 'E-commerce API v2.1.0 - Comprehensive e-commerce API with JWT authentication',
    expectedTitle: 'E-commerce API',
    expectedVersion: '2.1.0',
    format: 'json',
    category: 'domain-specific',
    complexity: 'high',
    hasAuth: true,
    hasServers: true,
    hasExternalDocs: true,
    tags: ['ecommerce', 'jwt', 'products', 'orders']
  },
  BANKING: {
    file: 'valid-apis/domain-specific/banking-api.yml',
    description: 'Banking API v3.2.1 - Secure banking API with multiple auth methods',
    expectedTitle: 'Banking API',
    expectedVersion: '3.2.1',
    format: 'yml',
    category: 'domain-specific',
    complexity: 'high',
    hasAuth: true,
    hasServers: true,
    hasExternalDocs: true,
    tags: ['banking', 'financial', 'secure', 'multi-auth']
  }
};

/**
 * Test data provider class for managing data-driven tests
 */
export class TestDataProvider {
  private static instance: TestDataProvider;
  private testDataDir: string;

  private constructor() {
    this.testDataDir = path.join(__dirname, '../../../test-data');
  }

  public static getInstance(): TestDataProvider {
    if (!TestDataProvider.instance) {
      TestDataProvider.instance = new TestDataProvider();
    }
    return TestDataProvider.instance;
  }

  /**
   * Get all available test data files
   */
  public getAllTestData(): TestDataFile[] {
    return Object.values(TEST_DATA_REGISTRY).filter(testData => 
      this.fileExists(testData.file)
    );
  }

  /**
   * Get test data files filtered by criteria
   */
  public getTestDataBy(criteria: {
    format?: 'yaml' | 'json' | 'yml' | 'all';
    category?: 'simple' | 'comprehensive' | 'domain-specific' | 'minimal' | 'all';
    complexity?: 'low' | 'medium' | 'high' | 'all';
    hasAuth?: boolean;
    hasServers?: boolean;
    hasExternalDocs?: boolean;
    tags?: string[];
  }): TestDataFile[] {
    let filteredData = this.getAllTestData();

    if (criteria.format && criteria.format !== 'all') {
      filteredData = filteredData.filter(data => data.format === criteria.format);
    }

    if (criteria.category && criteria.category !== 'all') {
      filteredData = filteredData.filter(data => data.category === criteria.category);
    }

    if (criteria.complexity && criteria.complexity !== 'all') {
      filteredData = filteredData.filter(data => data.complexity === criteria.complexity);
    }

    if (criteria.hasAuth !== undefined) {
      filteredData = filteredData.filter(data => data.hasAuth === criteria.hasAuth);
    }

    if (criteria.hasServers !== undefined) {
      filteredData = filteredData.filter(data => data.hasServers === criteria.hasServers);
    }

    if (criteria.hasExternalDocs !== undefined) {
      filteredData = filteredData.filter(data => data.hasExternalDocs === criteria.hasExternalDocs);
    }

    if (criteria.tags && criteria.tags.length > 0) {
      filteredData = filteredData.filter(data => 
        criteria.tags!.some(tag => data.tags.includes(tag))
      );
    }

    return filteredData;
  }

  /**
   * Get test data for format testing (YAML, JSON, YML)
   */
  public getFormatTestData(): TestDataFile[] {
    return this.getTestDataBy({ tags: ['format-testing'] });
  }

  /**
   * Get test data for comprehensive testing
   */
  public getComprehensiveTestData(): TestDataFile[] {
    return this.getTestDataBy({ category: 'comprehensive' });
  }

  /**
   * Get test data for simple/basic testing
   */
  public getSimpleTestData(): TestDataFile[] {
    return this.getTestDataBy({ category: 'simple' });
  }

  /**
   * Get test data for domain-specific testing
   */
  public getDomainSpecificTestData(): TestDataFile[] {
    return this.getTestDataBy({ category: 'domain-specific' });
  }

  /**
   * Get test data with authentication
   */
  public getAuthTestData(): TestDataFile[] {
    return this.getTestDataBy({ hasAuth: true });
  }

  /**
   * Get test data without authentication
   */
  public getNoAuthTestData(): TestDataFile[] {
    return this.getTestDataBy({ hasAuth: false });
  }

  /**
   * Get a specific test data file by key
   */
  public getTestDataByKey(key: string): TestDataFile | null {
    return TEST_DATA_REGISTRY[key] || null;
  }

  /**
   * Get the full path to a test data file
   */
  public getTestDataPath(filename: string): string {
    return path.join(this.testDataDir, filename);
  }

  /**
   * Check if a test data file exists
   */
  private fileExists(filename: string): boolean {
    const filePath = this.getTestDataPath(filename);
    return fs.existsSync(filePath);
  }

  /**
   * Validate test data file content and metadata
   */
  private async validateTestDataFile(testData: TestDataFile): Promise<boolean> {
    try {
      if (!this.fileExists(testData.file)) {
        return false;
      }

      // Additional validation can be added here
      // e.g., parse the file and verify title/version match
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get validated test data files (only existing and valid files)
   */
  public async getValidatedTestData(): Promise<TestDataFile[]> {
    const allTestData = Object.values(TEST_DATA_REGISTRY);
    const validatedData: TestDataFile[] = [];

    for (const testData of allTestData) {
      if (await this.validateTestDataFile(testData)) {
        validatedData.push(testData);
      }
    }

    return validatedData;
  }

  /**
   * Get test data combinations for data-driven testing
   * Returns an array of test data files suitable for parameterized tests
   */
  public async getTestDataCombinations(testType: 'import' | 'validation' | 'customer-portal' | 'all'): Promise<TestDataFile[]> {
    const validatedData = await this.getValidatedTestData();
    
    switch (testType) {
      case 'import':
        // For import tests, use simple and stable test data
        return validatedData.filter(data => 
          data.category === 'simple' || 
          (data.category === 'comprehensive' && data.complexity === 'medium')
        );
      
      case 'validation':
        // For validation tests, focus on well-structured APIs
        return validatedData.filter(data => 
          data.complexity === 'medium' || 
          (data.complexity === 'high' && data.category === 'comprehensive')
        );
      
      case 'customer-portal':
        // For customer portal tests, use APIs with complete documentation
        return validatedData.filter(data => 
          data.hasExternalDocs === true && 
          data.hasServers === true &&
          data.complexity !== 'low'
        );
      
      case 'all':
      default:
        return validatedData;
    }
  }

  /**
   * Generate test case names for data-driven tests
   */
  public generateTestCaseName(testData: TestDataFile, baseTestName: string): string {
    const formatSuffix = testData.format.toUpperCase();
    const complexitySuffix = testData.complexity.charAt(0).toUpperCase() + testData.complexity.slice(1);
    return `${baseTestName} [${formatSuffix}-${complexitySuffix}] - ${testData.expectedTitle}`;
  }
}

/**
 * Helper function to get test data provider instance
 */
export function getTestDataProvider(): TestDataProvider {
  return TestDataProvider.getInstance();
}

/**
 * Decorator for data-driven tests
 */
export function withTestData(testType: 'import' | 'validation' | 'customer-portal' | 'all' = 'all') {
  const provider = getTestDataProvider();
  return provider.getTestDataCombinations(testType);
}
