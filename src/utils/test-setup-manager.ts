import { Page, expect } from '@playwright/test';
import * as path from 'path';
import { ApiDocPage } from '../page-factory/pages/api-doc.page';
import { Header } from '../page-factory/components/header.component';
import { NewApiCreationModal } from '../page-factory/components/new-api-creation.modal';
import { ApiSpecParser } from './api-spec-parser';
import { ApiHelper } from './api-helper';
import { 
  TEST_CONFIG, 
  TEST_MESSAGES, 
  TEST_DATA_CONFIG, 
  TestDataInterface, 
  validateTestConfig, 
  getCurrentTestFileInfo 
} from '../config/test-data.config';
import { loggers } from './logger-factory';

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

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Complete test setup including validation, initialization, and API creation
   */
  async setupTest(): Promise<TestSetupContext> {
    // 1. Validate test configuration
    await this.validateConfiguration();
    
    // 2. Initialize page objects
    const pageObjects = this.initializePageObjects();
    
    // 3. Navigate to application
    await this.navigateToApplication();
    
    // 4. Parse API specification and extract test data
    const { apiSpecParser, testData } = await this.parseApiSpecification();
    
    // 5. Create API definition for testing
    await this.createApiDefinition(pageObjects, apiSpecParser);
    
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
    const apiFilePath = path.join(__dirname, '..', TEST_CONFIG.TEST_DATA_DIR, TEST_DATA_CONFIG.apiSpecFile);
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
      console.log(TEST_MESSAGES.SETUP.EXTRACTED_DATA);
      console.log(TEST_MESSAGES.SETUP.TITLE(testData.apiTitle));
      console.log(TEST_MESSAGES.SETUP.VERSION(testData.apiVersion));
      console.log(TEST_MESSAGES.SETUP.DESCRIPTION(testData.apiDescription || 'N/A'));
      console.log(TEST_MESSAGES.SETUP.SERVERS(testData.servers.length));
      console.log(TEST_MESSAGES.SETUP.TAGS(testData.tags.length));
      console.log(TEST_MESSAGES.SETUP.ENDPOINTS(testData.endpointPaths.length));
    }
  }

  private async createApiDefinition(
    pageObjects: Omit<TestSetupContext, 'apiSpecParser' | 'testData'>,
    apiSpecParser: ApiSpecParser
  ): Promise<void> {
    const { header, newApiModal } = pageObjects;
    const apiHelper = new ApiHelper(this.page);
    
    // Get API file path for upload
    const apiFilePath = path.join(__dirname, '..', TEST_CONFIG.TEST_DATA_DIR, TEST_DATA_CONFIG.apiSpecFile);
    
    // Navigate through API creation flow
    await header.clickOnCreateButton();
    await header.clickOnNewApiButton();
    await expect(newApiModal.uploadApiDefinitionButton).toBeVisible();
    
    // Upload API specification file
    await newApiModal.uploadFromMyDeviceButton.setInputFiles(apiFilePath);
    
    // Create API and capture response for cleanup
    const apiResponsePromise = apiHelper.waitForApiCreationResponse();
    await newApiModal.clickOnNewApiReferenceButton();
    const apiResponse = await apiResponsePromise;
    
    if (apiResponse) {
      loggers.setup.info(`API creation successful: ${apiResponse.apiDefinitionId}`);
      apiHelper.trackApiDefinitionManually(
        apiResponse.apiDefinitionId, 
        apiResponse.projectDocumentVersionId
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
        apiHelper.trackApiDefinitionManually(extractedApiId, defaultProjectVersionId);
      } else {
        loggers.setup.error('Failed to extract API ID from URL');
      }
    }

    // Close modal and wait for UI to settle
    await newApiModal.clickOnCancelButton();
    await this.page.waitForTimeout(3000);
  }

  private async validateNavigationSuccess(): Promise<void> {
    await expect(this.page).toHaveURL(/api-documentation/);
  }

  private async cleanupApiDefinitions(): Promise<void> {
    const apiHelper = new ApiHelper(this.page);
    await apiHelper.deleteTrackedApiDefinitions();
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
