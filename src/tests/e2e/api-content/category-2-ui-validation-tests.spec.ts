import { test } from '@playwright/test';
import { TestSetupManager, TestSetupContext } from '../../../utils/test-setup/test-setup-manager';
import { getTestDataProvider } from '../../../utils/data/test-data-provider';

test.describe('Category 2: UI Content Validation Tests', () => {
  // Configure longer timeouts for UI validation tests (headless mode can be slower)
  test.setTimeout(60000); // 60 seconds per test
  let setupManager: TestSetupManager;

  // Get test data for validation tests
  const testDataProvider = getTestDataProvider();

  test.beforeEach(async ({ page }) => {
    setupManager = new TestSetupManager(page);
  });

  // Use stable test data for validation tests
  const validationTestData = [
    { file: 'comprehensive-api.yaml', expectedTitle: 'Comprehensive Test API', expectedVersion: '1.0.0' }
  ];

  for (const testData of validationTestData) {
    test(`TC-007: Validate Complete Introduction Section - ${testData.expectedTitle} @api-content`, async ({ page }) => {
      const testDataFile = testDataProvider.getTestDataByKey('COMPREHENSIVE');
      if (!testDataFile) {
        throw new Error('Comprehensive test data not found');
      }
      
      const testContext = await setupManager.setupTestWithData(testDataFile);
      const { apiDocPage, testData: parsedTestData } = testContext;
      await apiDocPage.validateCompleteIntroductionSection(parsedTestData);
    });
    
    test(`TC-008: Validate Complete API Documentation Display - ${testData.expectedTitle} @api-content`, async ({ page }) => {
      const testDataFile = testDataProvider.getTestDataByKey('COMPREHENSIVE');
      if (!testDataFile) {
        throw new Error('Comprehensive test data not found');
      }
      
      const testContext = await setupManager.setupTestWithData(testDataFile);
      const { apiDocPage, apiSpecParser, testData: parsedTestData } = testContext;
      await apiDocPage.validateCompleteApiDocumentation(apiSpecParser, parsedTestData, page);
    });
  }

  test.afterEach(async ({ page }) => {
    if (setupManager) {
      await setupManager.teardownTest();
    } else {
      const { ApiHelper } = await import('../../../utils/api/api-helper');
      const apiHelper = new ApiHelper(page);
      await apiHelper.deleteTrackedApiDefinitions();
    }
  });
});