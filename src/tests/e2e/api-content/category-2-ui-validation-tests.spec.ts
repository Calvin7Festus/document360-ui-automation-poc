import { test } from '@playwright/test';
import { TestSetupManager, TestSetupContext } from '../../../utils/test-setup-manager';

test.describe('Category 2: UI Content Validation Tests', () => {
  // Configure longer timeouts for UI validation tests (headless mode can be slower)
  test.setTimeout(60000); // 60 seconds per test
  let setupManager: TestSetupManager;
  let testContext: TestSetupContext;

  test.beforeEach(async ({ page }) => {
    setupManager = new TestSetupManager(page);
    testContext = await setupManager.setupTest();
  });

  test('TC-007: Validate Complete Introduction Section - Should display all API information correctly @api-content', async () => {
    const { apiDocPage, testData } = testContext;
    await apiDocPage.validateCompleteIntroductionSection(testData);
  });

  test('TC-008: Validate Complete API Documentation Display - Should validate all endpoint details on the page @api-content', async ({ page }) => {
    const { apiDocPage, apiSpecParser, testData } = testContext;
    await apiDocPage.validateCompleteApiDocumentation(apiSpecParser, testData, page);
  });

  test.afterEach(async ({ page }) => {
    if (setupManager) {
      await setupManager.teardownTest();
    } else {
      const { ApiHelper } = await import('../../../utils/api-helper');
      const apiHelper = new ApiHelper(page);
      await apiHelper.deleteTrackedApiDefinitions();
    }
  });
});