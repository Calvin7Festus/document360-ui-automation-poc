import { Page } from '@playwright/test';
import { ApiFactory, ApiDefinitionApi, AuthApi, FileUploadApi } from '../../api-factory';
import { TestDataFile } from '../data/test-data-provider';
import { loggers } from '../logging/logger-factory';
import { ApiSpecParser } from '../api/api-spec-parser';
import * as path from 'path';

/**
 * API Data Seeder
 * Orchestrates API-based data seeding for tests
 * Provides clean methods for Category 2 and Category 3 test setup
 */
export class ApiDataSeeder {
  private page: Page;
  private apiFactory: ApiFactory;
  private apiDefinition: ApiDefinitionApi;
  private auth: AuthApi;
  private fileUpload: FileUploadApi;
  private createdApiDefinitions: string[] = [];

  constructor(page: Page, authToken?: string) {
    this.page = page;
    this.apiFactory = new ApiFactory(page, authToken);
    
    const apis = this.apiFactory.createAllApis();
    this.apiDefinition = apis.apiDefinition;
    this.auth = apis.auth;
    this.fileUpload = apis.fileUpload;
  }

  /**
   * Setup authentication interceptor to capture tokens from login API
   */
  async setupAuthInterceptor(): Promise<void> {
    await this.apiDefinition.setupAuthInterceptor();
  }

  /**
   * Setup API creation interceptor for Category 1 (UI-based) tests
   * Intercepts the API definition creation call and tracks the apiDefinitionId
   */
  async setupApiCreationInterceptor(): Promise<void> {
    await this.page.route('**/api/v2/apidefinitions', async (route) => {
      // Only intercept POST requests (creation)
      if (route.request().method() === 'POST') {
        const response = await route.fetch();
        const responseText = await response.text();
        
        try {
          const apiResponse = JSON.parse(responseText);
          
          // Check if API definition was successfully created
          if (apiResponse.success && apiResponse.result?.apiDefinitionId) {
            const apiDefinitionId = apiResponse.result.apiDefinitionId;
            const projectDocumentVersionId = apiResponse.result.projectDocumentVersionId;
            
            // Track for cleanup
            this.createdApiDefinitions.push(apiDefinitionId);
            
            // Store project version ID globally for cleanup
            (globalThis as any).__capturedProjectVersionId = projectDocumentVersionId;
            
            loggers.setup.info(`🎯 [Category 1] Intercepted API definition creation: ${apiDefinitionId}`);
          }
        } catch (error) {
          loggers.setup.debug('Error parsing API creation response:', error);
        }
        
        // Continue with the original response
        await route.fulfill({ response });
      } else {
        // For non-POST requests, just continue
        await route.continue();
      }
    });
  }

  /**
   * Wait for authentication token to be available
   */
  async waitForAuthToken(timeoutMs: number = 15000): Promise<string | null> {
    return await this.apiDefinition.waitForAuthToken(timeoutMs);
  }

  /**
   * Simple method for Category 2: Upload File -> Create API Definition
   */
  async seedForCategory2(testDataFile: TestDataFile): Promise<string> {
    try {
      loggers.setup.info(`🌱 [Category 2] Seeding API definition: ${testDataFile.file}`);

      // Wait for auth token
      const token = await this.apiDefinition.waitForAuthToken(15000);
      if (!token) {
        throw new Error('Authentication token not available after waiting');
      }

      const filePath = path.join(__dirname, '../../../test-data', testDataFile.file);

      // Step 1: Upload -> Step 2: Create (no publishing)
      const fileUrl = await this.apiDefinition.uploadSpecFile(filePath);
      const result = await this.apiDefinition.createApiDefinition(fileUrl, false);

      // Track for cleanup
      this.createdApiDefinitions.push(result.apiDefinitionId);

      loggers.setup.info(`✅ [Category 2] API definition created: ${result.apiDefinitionId}`);
      return result.apiDefinitionId;

    } catch (error) {
      loggers.setup.error(`❌ [Category 2] Failed to seed API definition:`, error);
      throw error;
    }
  }

  /**
   * Simple method for Category 3: Upload File -> Create API Definition -> Publish
   */
  async seedForCategory3(testDataFile: TestDataFile): Promise<string> {
    try {
      loggers.setup.info(`🌱 [Category 3] Seeding and publishing API definition: ${testDataFile.file}`);

      // Wait for auth token
      const token = await this.apiDefinition.waitForAuthToken(15000);
      if (!token) {
        throw new Error('Authentication token not available after waiting');
      }

      const filePath = path.join(__dirname, '../../../test-data', testDataFile.file);

      // Step 1: Upload -> Step 2: Create -> Step 3: Publish
      const fileUrl = await this.apiDefinition.uploadSpecFile(filePath);
      const result = await this.apiDefinition.createApiDefinition(fileUrl, false);
      
      await this.apiDefinition.publishApiDefinitionExact(
        result.apiDefinitionId,
        result.projectId,
        result.projectDocumentVersionId
      );

      // Track for cleanup
      this.createdApiDefinitions.push(result.apiDefinitionId);

      loggers.setup.info(`✅ [Category 3] API definition created and published: ${result.apiDefinitionId}`);
      return result.apiDefinitionId;

    } catch (error) {
      loggers.setup.error(`❌ [Category 3] Failed to seed and publish API definition:`, error);
      throw error;
    }
  }

  /**
   * Cleanup all created API definitions using the exact bulk delete API
   */
  async cleanup(): Promise<void> {
    if (this.createdApiDefinitions.length === 0) {
      loggers.setup.info('📋 No API definitions to cleanup');
      return;
    }

    loggers.setup.info(`🧹 Cleaning up ${this.createdApiDefinitions.length} API definitions`);
    
    try {
      // Get project info for cleanup
      const configManager = this.apiDefinition['configManager'];
      const projectId = configManager.get<string>('PROJECT_ID');
      const projectVersionId = (globalThis as any).__capturedProjectVersionId || configManager.get<string>('PROJECT_VERSION_ID');
      
      if (!projectVersionId) {
        loggers.setup.warn('⚠️ Project version ID not available for cleanup');
        return;
      }

      // Use the bulk delete API with all API definition IDs
      const requestBody = {
        apiDefinitionList: this.createdApiDefinitions,
        projectDocumentVersionId: projectVersionId
      };

      // Get base URL from config
      const baseUrl = configManager.get<string>('API_BASE_URL');
      
      const response = await this.page.request.post(`${baseUrl}/api/v2/apidefinitions/bulkdelete`, {
        headers: {
          'accept': 'application/json, text/plain, */*',
          'accept-language': 'en-US,en;q=0.9',
          'authorization': `Bearer ${this.apiDefinition.getAuthToken()}`,
          'content-type': 'application/json',
          'origin': 'https://portal.document360.io',
          'priority': 'u=1, i',
          'projectid': projectId,
          'referer': `https://portal.document360.io/${projectId}/api-documentation`,
          'request-context': 'appId=cid-v1:4902addb-5aa7-47de-91d3-6476474b5e05',
          'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
          'versiontype': '1'
        },
        data: JSON.stringify(requestBody)
      });

      if (response.ok()) {
        loggers.setup.info(`🗑️ Bulk deleted ${this.createdApiDefinitions.length} API definitions`);
      } else {
        const errorText = await response.text();
        loggers.setup.warn(`⚠️ Bulk delete failed: ${response.status()} - ${errorText}`);
      }

    } catch (error) {
      loggers.setup.warn(`⚠️ Failed to cleanup API definitions:`, error);
    }
    
    // Clear the tracking array regardless of success/failure
    this.createdApiDefinitions = [];
    loggers.setup.info('✅ API cleanup completed');
  }

  /**
   * Get list of created API definitions for tracking
   */
  getCreatedApiDefinitions(): string[] {
    return [...this.createdApiDefinitions];
  }

  /**
   * Set authentication token for all API instances
   */
  setAuthToken(token: string): void {
    this.apiFactory.setAuthToken(token);
  }

  /**
   * Get API spec parser for a test data file
   */
  async getApiSpecParser(testDataFile: TestDataFile): Promise<any> {
    const filePath = path.join(__dirname, '../../../test-data', testDataFile.file);
    return ApiSpecParser.fromFile(filePath);
  }

  /**
   * Get parsed test data from a test data file
   */
  async getTestData(testDataFile: TestDataFile): Promise<any> {
    const apiSpecParser = await this.getApiSpecParser(testDataFile);
    
    const testData = {
      apiTitle: apiSpecParser.getApiTitle(),
      apiVersion: apiSpecParser.getApiVersion(),
      apiDescription: apiSpecParser.getApiDescription(),
      termsOfService: apiSpecParser.getTermsOfService(),
      contactInfo: apiSpecParser.getContactInfo(),
      licenseInfo: apiSpecParser.getLicenseInfo(),
      servers: apiSpecParser.getServers(),
      tags: apiSpecParser.getTags(),
      endpointPaths: apiSpecParser.getEndpointPaths(),
      endpoints: apiSpecParser.getEndpointPaths().map((path: string) => ({
        path,
        methods: apiSpecParser.getEndpointMethods(path).map((method: string) => ({
          method,
          summary: apiSpecParser.getEndpointSummary(path, method),
          description: apiSpecParser.getEndpointDescription(path, method),
          parameters: apiSpecParser.getEndpointParameters(path, method),
          responses: apiSpecParser.getEndpointResponses(path, method),
          security: apiSpecParser.getEndpointSecurity(path, method)
        }))
      })),
      schemas: apiSpecParser.getSchemas(),
      securitySchemes: apiSpecParser.getSecuritySchemes()
    };
    
    return testData;
  }
}