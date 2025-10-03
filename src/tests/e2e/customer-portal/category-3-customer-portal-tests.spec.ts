import { test, expect } from '@playwright/test';
import { CustomerPortalPage } from '../../../page-factory/pages/customer-portal.page';
import { TestSetupManager, TestSetupContext } from '../../../utils/test-setup-manager';
import { ConfigManager } from '../../../utils/config-manager';

test.describe('Category 3: Customer Portal Validation Tests', () => {
  let customerPortalPage: CustomerPortalPage;
  let setupManager: TestSetupManager;
  let testContext: TestSetupContext;
  let configManager: ConfigManager;
  let customerPortalUrl: string;

  test.beforeEach(async ({ page }) => {
    // Initialize customer portal page object
    customerPortalPage = new CustomerPortalPage(page);
    
    // Set up test context specifically for customer portal (publishes API documentation)
    setupManager = new TestSetupManager(page);
    testContext = await setupManager.setupTestForCustomerPortal();
    
    // Get customer portal URL from config
    configManager = ConfigManager.getInstance();
    customerPortalUrl = configManager.get<string>('CUSTOMER_PORTAL_URL');
  });

  test('TC-009: Validate Complete Introduction Section in Customer Portal - Should display all API information correctly in customer portal @cp', async () => {
    // Navigate to customer portal
    await customerPortalPage.navigateToCustomerPortal(customerPortalUrl);
    
    // Navigate to API documentation section
    await customerPortalPage.clickOnApiDocumentation();
    
    // Validate complete introduction section (same validation as Category 2 but in customer portal)
    const { testData } = testContext;
    await customerPortalPage.validateCompleteIntroductionSection(testData);
    
    // Additional customer portal specific validations
    const brokenLinksCount = await customerPortalPage.validateNobrokenLinks();
    expect(brokenLinksCount).toBe(0);
    
    const { totalLinks, enabledLinks } = await customerPortalPage.validateNavigationLinks();
    expect(enabledLinks).toBeGreaterThan(0);
    expect(enabledLinks).toBe(totalLinks);
  });

  test('TC-010: Validate Complete API Documentation Display in Customer Portal - Should validate all endpoint details on the customer portal page @cp', async ({ page }) => {
    // Navigate to customer portal
    await customerPortalPage.navigateToCustomerPortal(customerPortalUrl);
    
    // Navigate to API documentation section
    await customerPortalPage.clickOnApiDocumentation();
    
    // Validate complete API documentation (same validation as Category 2 but in customer portal)
    const { apiSpecParser, testData } = testContext;
    await customerPortalPage.validateCompleteApiDocumentation(apiSpecParser, testData, page);
    
    // Additional customer portal specific validations
    const timeoutErrorsCount = await customerPortalPage.validateNoTimeoutErrors();
    expect(timeoutErrorsCount).toBe(0);
    
    // Validate performance metrics
    const performanceMetrics = await customerPortalPage.validateCustomerPortalPerformance(customerPortalUrl);
    expect(performanceMetrics.loadTime).toBeLessThan(5000); // 5 seconds max for customer portal
    expect(performanceMetrics.apiDocLoadTime).toBeLessThan(2000); // 2 seconds max for API docs
    expect(performanceMetrics.navResponseTime).toBeLessThan(1000); // 1 second max for navigation
  });

  test.afterEach(async ({ page }) => {
    try {
      console.log('🧹 Starting Category 3 cleanup...');
      
      // Use the setup manager's teardown (uses stored ApiHelper instance with captured auth token)
      if (setupManager) {
        await setupManager.teardownTest();
        console.log('✅ Category 3 cleanup completed successfully');
      } else {
        // Fallback: Direct cleanup if setup manager is not available
        const { ApiHelper } = await import('../../../utils/api-helper');
        const apiHelper = new ApiHelper(page);
        await apiHelper.deleteTrackedApiDefinitions();
        console.log('✅ Category 3 fallback cleanup completed');
      }
    } catch (error) {
      console.warn('⚠️ Failed to cleanup API definitions in Category 3:', error);
    }
  });
});
