import { test } from '@playwright/test';
import { ApiDataSeeder } from '../../../utils/data-seeding/api-data-seeder';
import { getTestDataProvider } from '../../../utils/data/test-data-provider';
import { ApiDocPage } from '../../../page-factory/pages/api-doc.page';
import { ConfigManager } from '../../../utils/config/config-manager';

test.describe('Category 2: UI Content Validation Tests (API-Seeded)', () => {
  // Configure longer timeouts for UI validation tests (headless mode can be slower)
  test.setTimeout(60000); // 60 seconds per test
  let apiSeeder: ApiDataSeeder;
  let apiDocPage: ApiDocPage;
  let seededApiDefinitionId: string;

  // Get test data for validation tests
  const testDataProvider = getTestDataProvider();

  test.beforeEach(async ({ page }) => {
    // Initialize API seeder and page objects
    apiSeeder = new ApiDataSeeder(page);
    apiDocPage = new ApiDocPage(page);

    // Setup auth interceptor and navigate
    await apiSeeder.setupAuthInterceptor();
    const configManager = ConfigManager.getInstance();
    await page.goto(configManager.get<string>('BASE_URL'));
    await page.waitForLoadState('domcontentloaded');

    // Category 2: Upload File -> Create API Definition
    const testDataFile = testDataProvider.getTestDataByKey('COMPREHENSIVE');
    if (!testDataFile) throw new Error('Comprehensive test data not found');
    
    seededApiDefinitionId = await apiSeeder.seedForCategory2(testDataFile);
    
    // Refresh page to ensure seeded data is visible in UI
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for API documentation to be visible instead of networkidle
    await page.waitForSelector('text=Comprehensive Test API', { timeout: 30000 });
  });

  // Use stable test data for validation tests
  const validationTestData = [
    { file: 'comprehensive-api.yaml', expectedTitle: 'Comprehensive Test API', expectedVersion: '1.0.0' }
  ];

  for (const testData of validationTestData) {
    test(`TC-007: Validate Complete Introduction Section - ${testData.expectedTitle} @api-content @api-seeded`, async ({ page }) => {
      const testDataFile = testDataProvider.getTestDataByKey('COMPREHENSIVE');
      if (!testDataFile) {
        throw new Error('Comprehensive test data not found');
      }
      
      // Parse the test data for validation (API definition already seeded in beforeEach)
      const apiSpecParser = await apiSeeder.getApiSpecParser(testDataFile);
      const testDataParsed = await apiSeeder.getTestData(testDataFile);
      
      // Validate using the seeded API definition
      await apiDocPage.validateCompleteIntroductionSection(testDataParsed);
    });
    
    test(`TC-008: Validate Complete API Documentation Display - ${testData.expectedTitle} @api-content @api-seeded`, async ({ page }) => {
      const testDataFile = testDataProvider.getTestDataByKey('COMPREHENSIVE');
      if (!testDataFile) {
        throw new Error('Comprehensive test data not found');
      }
      
      // Parse the test data for validation (API definition already seeded in beforeEach)
      const apiSpecParser = await apiSeeder.getApiSpecParser(testDataFile);
      const testDataParsed = await apiSeeder.getTestData(testDataFile);
      
      // Validate using the seeded API definition
      await apiDocPage.validateCompleteApiDocumentation(apiSpecParser, testDataParsed, page);
    });
  }

  test.afterEach(async () => {
    // Category 2: Delete API definition (bulk delete)
    await apiSeeder.cleanup();
  });
});