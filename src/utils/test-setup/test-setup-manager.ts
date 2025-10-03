import { Page, expect } from '@playwright/test';
import * as path from 'path';
import { ApiDocPage } from '../../page-factory/pages/api-doc.page';
import { Header } from '../../page-factory/components/header.component';
import { NewApiCreationModal } from '../../page-factory/components/new-api-creation.modal';
import { ApiSpecParser } from '../api/api-spec-parser';
import { ApiHelper } from '../api/api-helper';
import { 
  TEST_CONFIG, 
  TEST_MESSAGES, 
  TEST_DATA_CONFIG, 
  TestDataInterface, 
  validateTestConfig, 
  getCurrentTestFileInfo 
} from '../../config/test-data.config';
import { TestDataFile, getTestDataProvider } from '../data/test-data-provider';
import { loggers } from '../logging/logger-factory';

/**
 * Interface for test setup context
 */
export interface TestSetupContext {
  apiDocPage: ApiDocPage;
  header: Header;
  newApiModal: NewApiCreationModal;
  apiSpecParser: ApiSpecParser;
  testData: TestDataInterface;
}

/**
 * Test Setup Manager - Handles test setup and teardown logic
 */
export class TestSetupManager {
  private page: Page;
  private context: TestSetupContext | null = null;
  private apiHelper: ApiHelper | null = null; // Store the ApiHelper instance for cleanup

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Complete test setup including validation, initialization, and API creation
   */
  async setupTest(shouldPublish: boolean = false): Promise<TestSetupContext> {
    // Reset cleanup state for new test
    const { ApiHelper } = await import('../api/api-helper');
    ApiHelper.resetCleanupState();
    
    // 1. Validate test configuration
    await this.validateConfiguration();
    
    // 2. Initialize page objects
    const pageObjects = this.initializePageObjects();
    
    // 3. Navigate to application
    await this.navigateToApplication();
    
    // 4. Parse API specification and extract test data
    const { apiSpecParser, testData } = await this.parseApiSpecification();
    
    // 5. Create API definition for testing
    await this.createApiDefinition(pageObjects, apiSpecParser, shouldPublish);
    
    // 6. Validate navigation success
    await this.validateNavigationSuccess();

    this.context = {
      ...pageObjects,
      apiSpecParser,
      testData
    };

    return this.context;
  }

  /**
   * Setup test specifically for customer portal (publishes API documentation)
   */
  async setupTestForCustomerPortal(): Promise<TestSetupContext> {
    return this.setupTest(true);
  }

  /**
   * Set up test with specific test data file
   */
  async setupTestWithData(testDataFile: TestDataFile, shouldPublish: boolean = false): Promise<TestSetupContext> {
    // Temporarily override the test data config
    const originalFile = TEST_DATA_CONFIG.apiSpecFile;
    TEST_DATA_CONFIG.apiSpecFile = testDataFile.file;
    
    try {
      const context = await this.setupTest(shouldPublish);
      
      // Add test data file info to context
      (context as any).testDataFile = testDataFile;
      
      return context;
    } finally {
      // Restore original config
      TEST_DATA_CONFIG.apiSpecFile = originalFile;
    }
  }

  /**
   * Set up test for customer portal with specific test data file
   */
  async setupTestForCustomerPortalWithData(testDataFile: TestDataFile): Promise<TestSetupContext> {
    return this.setupTestWithData(testDataFile, true);
  }

  /**
   * Complete test teardown including API cleanup and navigation reset
   */
  async teardownTest(): Promise<void> {
    try {
      await this.cleanupApiDefinitions();
    } catch (error) {
      console.warn(`${TEST_CONFIG.LOG_PREFIXES.WARNING} Failed to cleanup API definitions:`, error);
    }
    
    await this.resetNavigation();
  }

  /**
   * Get the current test context (throws if setup hasn't been called)
   */
  getContext(): TestSetupContext {
    if (!this.context) {
      throw new Error('Test setup has not been completed. Call setupTest() first.');
    }
    return this.context;
  }

  /**
   * Get the ApiHelper instance used during setup for cleanup
   */
  getApiHelper(): ApiHelper | null {
    return this.apiHelper;
  }

  // Private helper methods for setup steps

  private async validateConfiguration(): Promise<void> {
    const configValidation = validateTestConfig();
    if (!configValidation.isValid) {
      throw new Error(`Invalid test configuration: ${configValidation.errors.join(', ')}`);
    }
  }

  private initializePageObjects(): Omit<TestSetupContext, 'apiSpecParser' | 'testData'> {
    return {
      apiDocPage: new ApiDocPage(this.page),
      header: new Header(this.page),
      newApiModal: new NewApiCreationModal(this.page)
    };
  }

  private async navigateToApplication(): Promise<void> {
    await this.page.goto(TEST_CONFIG.BASE_URL);
  }

  private async parseApiSpecification(): Promise<{ apiSpecParser: ApiSpecParser; testData: TestDataInterface }> {
    // Get API file path
    const apiFilePath = path.join(__dirname, '../../../test-data', TEST_DATA_CONFIG.apiSpecFile);
    const currentFileInfo = getCurrentTestFileInfo();
    
    // Log file usage if verbose logging is enabled
    if (TEST_CONFIG.ENABLE_VERBOSE_LOGGING) {
      console.log(TEST_MESSAGES.SETUP.FILE_USAGE(TEST_DATA_CONFIG.apiSpecFile));
      console.log(`📖 File Info: ${currentFileInfo.description}`);
    }
    
    // Parse API specification using Factory pattern
    const apiSpecParser = ApiSpecParser.fromFile(apiFilePath);
    
    // Extract test data
    const testData: TestDataInterface = {
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
        methods: apiSpecParser.getEndpointMethods(path)
      }))
    };
    
    // Log extracted data if verbose logging is enabled
    if (TEST_CONFIG.ENABLE_VERBOSE_LOGGING) {
      this.logExtractedData(testData);
    }
    
    return { apiSpecParser, testData };
  }

  private logExtractedData(testData: TestDataInterface): void {
    if (TEST_CONFIG.ENABLE_VERBOSE_LOGGING) {
      loggers.setup.info(TEST_MESSAGES.SETUP.EXTRACTED_DATA);
      loggers.setup.info(TEST_MESSAGES.SETUP.TITLE(testData.apiTitle));
      loggers.setup.info(TEST_MESSAGES.SETUP.VERSION(testData.apiVersion));
      loggers.setup.info(TEST_MESSAGES.SETUP.DESCRIPTION(testData.apiDescription || 'N/A'));
      loggers.setup.info(TEST_MESSAGES.SETUP.SERVERS(testData.servers.length));
      loggers.setup.info(TEST_MESSAGES.SETUP.TAGS(testData.tags.length));
      loggers.setup.info(TEST_MESSAGES.SETUP.ENDPOINTS(testData.endpointPaths.length));
    }
  }

  private async createApiDefinition(
    pageObjects: Omit<TestSetupContext, 'apiSpecParser' | 'testData'>,
    apiSpecParser: ApiSpecParser,
    shouldPublish: boolean = false
  ): Promise<void> {
    const { header, newApiModal, apiDocPage } = pageObjects;
    this.apiHelper = new ApiHelper(this.page); // Store the instance for cleanup
    
    // Get API file path for upload
    const apiFilePath = path.join(__dirname, '../../../test-data', TEST_DATA_CONFIG.apiSpecFile);
    
    // Navigate through API creation flow
    await header.clickOnCreateButton();
    await header.clickOnNewApiButton();
    await expect(newApiModal.uploadApiDefinitionButton).toBeVisible();
    
    // Upload API specification file
    await newApiModal.uploadFromMyDeviceButton.setInputFiles(apiFilePath);
    
    // Create API and capture response for cleanup
    const apiResponsePromise = this.apiHelper.waitForApiCreationResponse();
    await newApiModal.clickOnNewApiReferenceButton();
    const apiResponse = await apiResponsePromise;
    
    if (apiResponse) {
      loggers.setup.info(`API creation successful: ${apiResponse.apiDefinitionId}`);
      
      // Get the auth token that was captured during the API response or extract from browser
      const authToken = await this.apiHelper.getCurrentAuthToken();
      
      this.apiHelper.trackApiDefinitionManually(
        apiResponse.apiDefinitionId, 
        apiResponse.projectDocumentVersionId,
        authToken // Pass the auth token for cleanup
      );
    } else {
      loggers.setup.warn('Failed to capture API creation response, attempting URL extraction');
      await this.page.waitForTimeout(2000);
      const currentUrl = this.page.url();
      const apiIdMatch = currentUrl.match(/api-documentation\/([a-f0-9-]+)/);
      
      if (apiIdMatch) {
        const extractedApiId = apiIdMatch[1];
        loggers.setup.info(`Extracted API ID from URL: ${extractedApiId}`);
        const defaultProjectVersionId = 'extracted-from-url';
        
        // Get the auth token even for URL extraction
        const authToken = await this.apiHelper.getCurrentAuthToken();
        
        this.apiHelper.trackApiDefinitionManually(extractedApiId, defaultProjectVersionId, authToken);
      } else {
        loggers.setup.error('Failed to extract API ID from URL');
      }
    }

    if (shouldPublish) {
      // For customer portal tests: publish the API documentation
      loggers.setup.info('Publishing API documentation for customer portal testing');
      await apiDocPage.publishApiDocumentation();
      loggers.setup.info('✅ API documentation published successfully');
    } else {
      // For regular tests: close modal and wait for UI to settle
      await newApiModal.clickOnCancelButton();
      await this.page.waitForTimeout(3000);
    }
  }

  private async validateNavigationSuccess(): Promise<void> {
    await expect(this.page).toHaveURL(/api-documentation/);
  }

  private async cleanupApiDefinitions(): Promise<void> {
    if (this.apiHelper) {
      // Use the same ApiHelper instance that was used during setup (has captured auth token)
      loggers.cleanup.info('Using stored ApiHelper instance for cleanup');
      await this.apiHelper.deleteTrackedApiDefinitions();
    } else {
      // Fallback to creating a new instance (should not happen in normal flow)
      loggers.cleanup.warn('No stored ApiHelper instance, creating new one for cleanup');
      const apiHelper = new ApiHelper(this.page);
      await apiHelper.deleteTrackedApiDefinitions();
    }
  }

  private async resetNavigation(): Promise<void> {
    await this.page.goto(TEST_CONFIG.FALLBACK_URL);
  }
}

/**
 * Factory function for creating TestSetupManager instances
 */
export function createTestSetupManager(page: Page): TestSetupManager {
  return new TestSetupManager(page);
}
