import { test, expect } from '@playwright/test';
import { CustomerPortalPage } from '../../../page-factory/pages/customer-portal.page';
import { TestSetupManager, TestSetupContext } from '../../../utils/test-setup/test-setup-manager';
import { ConfigManager } from '../../../utils/config/config-manager';
import { getTestDataProvider, TestDataFile } from '../../../utils/data/test-data-provider';

test.describe('Category 3: Customer Portal Validation Tests', () => {
  // Configure longer timeouts for customer portal tests (headless mode can be slower)
  test.setTimeout(60000); // 60 seconds per test
  let customerPortalPage: CustomerPortalPage;
  let setupManager: TestSetupManager;
  let configManager: ConfigManager;
  let customerPortalUrl: string;

  // Get test data for customer portal tests
  const testDataProvider = getTestDataProvider();

  test.beforeEach(async ({ page }) => {
    // Initialize customer portal page object
    customerPortalPage = new CustomerPortalPage(page);
    setupManager = new TestSetupManager(page);
    
    // Get customer portal URL from config
    configManager = ConfigManager.getInstance();
    customerPortalUrl = configManager.get<string>('CUSTOMER_PORTAL_URL');
  });

  // Use stable test data for customer portal tests
  const customerPortalTestData = [
    { file: 'comprehensive-api.yaml', expectedTitle: 'Comprehensive Test API', expectedVersion: '1.0.0' }
  ];

  for (const testData of customerPortalTestData) {
    test(`TC-009: Validate Complete Introduction Section in Customer Portal - ${testData.expectedTitle} @cp`, async ({ page }) => {
      const testDataFile = testDataProvider.getTestDataByKey('COMPREHENSIVE');
      if (!testDataFile) {
        throw new Error('Comprehensive test data not found');
      }
      
      // Set up test context specifically for customer portal (publishes API documentation)
      const testContext = await setupManager.setupTestForCustomerPortalWithData(testDataFile);
      
      // Navigate to customer portal
      await customerPortalPage.navigateToCustomerPortal(customerPortalUrl);
      
      // Navigate to API documentation section
      await customerPortalPage.clickOnApiDocumentation();
      
      // Validate complete introduction section (same validation as Category 2 but in customer portal)
      const { testData: parsedTestData } = testContext;
      await customerPortalPage.validateCompleteIntroductionSection(parsedTestData);
      
      // Additional customer portal specific validations
      const brokenLinksCount = await customerPortalPage.validateNobrokenLinks();
      expect(brokenLinksCount).toBe(0);
      
      const { totalLinks, enabledLinks } = await customerPortalPage.validateNavigationLinks();
      expect(enabledLinks).toBeGreaterThan(0);
      expect(enabledLinks).toBe(totalLinks);
    });
    
    test(`TC-010: Validate Complete API Documentation Display in Customer Portal - ${testData.expectedTitle} @cp`, async ({ page }) => {
      const testDataFile = testDataProvider.getTestDataByKey('COMPREHENSIVE');
      if (!testDataFile) {
        throw new Error('Comprehensive test data not found');
      }
      
      // Set up test context specifically for customer portal (publishes API documentation)
      const testContext = await setupManager.setupTestForCustomerPortalWithData(testDataFile);
      
      // Navigate to customer portal
      await customerPortalPage.navigateToCustomerPortal(customerPortalUrl);
      
      // Navigate to API documentation section
      await customerPortalPage.clickOnApiDocumentation();
      
      // Validate complete API documentation (same validation as Category 2 but in customer portal)
      const { apiSpecParser, testData: parsedTestData } = testContext;
      await customerPortalPage.validateCompleteApiDocumentation(apiSpecParser, parsedTestData, page);
      
      // Additional customer portal specific validations
      const timeoutErrorsCount = await customerPortalPage.validateNoTimeoutErrors();
      expect(timeoutErrorsCount).toBe(0);
      
      // Validate performance metrics with relaxed thresholds
      const performanceMetrics = await customerPortalPage.validateCustomerPortalPerformance(customerPortalUrl);
      expect(performanceMetrics.loadTime).toBeLessThan(8000); // 8 seconds max for customer portal (increased)
      expect(performanceMetrics.apiDocLoadTime).toBeLessThan(3000); // 3 seconds max for API docs (increased)
      expect(performanceMetrics.navResponseTime).toBeLessThan(2000); // 2 seconds max for navigation (increased)
    });
  }

  test.afterEach(async ({ page }) => {
    try {
      // Use the setup manager's teardown (uses stored ApiHelper instance with captured auth token)
      if (setupManager) {
        await setupManager.teardownTest();
      }
    } catch (error) {
      console.warn('⚠️ Failed to cleanup API definitions in Category 3:', error);
    }
  });
});
