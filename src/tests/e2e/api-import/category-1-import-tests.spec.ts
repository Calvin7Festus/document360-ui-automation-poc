import { test, expect } from '@playwright/test';
import { ApiDocPage } from '../../../page-factory/pages/api-doc.page';
import { Header } from '../../../page-factory/components/header.component';
import { NewApiCreationModal } from '../../../page-factory/components/new-api-creation.modal';
import { ToastMessage } from '../../../page-factory/components/toast-message.component';
import { ApiHelper } from '../../../utils/api/api-helper';
import { ConfigManager } from '../../../utils/config/config-manager';
import { TestSetupManager } from '../../../utils/test-setup/test-setup-manager';
import { getTestDataProvider, TestDataFile } from '../../../utils/data/test-data-provider';
import path from 'path';

test.describe('Category 1: API Import Functionality Tests', () => {
  let apiDocPage: ApiDocPage;
  let header: Header;
  let newApiModal: NewApiCreationModal;
  let toastMessage: ToastMessage;
  let setupManager: TestSetupManager;

  // Get test data for import tests
  const testDataProvider = getTestDataProvider();
  let importTestData: TestDataFile[] = [];

  test.beforeEach(async ({ page }) => {
    // Reset cleanup state for each test
    const { ApiHelper } = await import('../../../utils/api/api-helper');
    ApiHelper.resetCleanupState();
    
    apiDocPage = new ApiDocPage(page);
    header = new Header(page);
    newApiModal = new NewApiCreationModal(page);
    toastMessage = new ToastMessage(page);
    setupManager = new TestSetupManager(page);

    const configManager = ConfigManager.getInstance();
    await page.goto(configManager.get<string>('BASE_URL'));
  });

  // Initialize test data and generate tests
  test.beforeAll(async () => {
    importTestData = await testDataProvider.getTestDataCombinations('import');
  });

  // Data-driven tests for file import - using TestDataProvider for consistency
  const stableTestData = [
    testDataProvider.getTestDataByKey('SIMPLE_YAML'),
    testDataProvider.getTestDataByKey('SIMPLE_JSON'),
    testDataProvider.getTestDataByKey('COMPREHENSIVE')
  ].filter(Boolean); // Remove any null values

  for (const testData of stableTestData) {
    test(`TC-001-${testData.format.toUpperCase()}: Import ${testData.format.toUpperCase()} File - ${testData.expectedTitle} @import`, async ({ page }) => {
      const filePath = testDataProvider.getTestDataPath(testData.file);
      const apiHelper = new ApiHelper(page);
      
      await header.clickOnCreateButton();
      await header.clickOnNewApiButton();
      await expect(newApiModal.uploadApiDefinitionButton).toBeVisible();
      
      await newApiModal.uploadFromMyDeviceButton.setInputFiles(filePath);

      await newApiModal.clickOnNewApiReferenceButton();
      const apiResponsePromise = apiHelper.waitForApiCreationResponse();
      
      const apiResponse = await apiResponsePromise;

      await newApiModal.clickOnCancelButton();
      
      await expect(page).toHaveURL(/api-documentation/);
      await expect(apiDocPage.getApiTitle(testData.expectedTitle)).toBeVisible();
      await apiDocPage.takeValidationScreenshot(`${testData.format}-import-success`);
    });
  }

  test('TC-004: Import from URL - Should successfully import API documentation from external URL @import', async ({ page }) => {
    const configManager = ConfigManager.getInstance();
    const apiUrl = configManager.get<string>('PETSTORE_API_URL');
    const apiHelper = new ApiHelper(page);
    
    await header.clickOnCreateButton();
    await header.clickOnNewApiButton();
    await expect(newApiModal.uploadApiDefinitionButton).toBeVisible();
    
    await newApiModal.clickCreateFromUrlRadio();
    await newApiModal.fillUrlInputBox(apiUrl);
    
    await newApiModal.clickOnNewApiReferenceButton();
    const apiResponsePromise = apiHelper.waitForApiCreationResponse();
    
    const apiResponse = await apiResponsePromise;

    await newApiModal.clickOnCancelButton();
    
    await expect(page).toHaveURL(/api-documentation/);
    await expect(apiDocPage.getApiTitle('Swagger Petstore')).toBeVisible();
    await apiDocPage.takeValidationScreenshot('url-import-success');
  });

  test('TC-005A: Import Error Handling - Invalid File Format - Should handle unsupported file formats gracefully @import', async ({ page }) => {
    const invalidFilePath = path.join(__dirname, '../../../../test-data/invalid-apis/unsupported/invalid-file.txt');
    
    await header.clickOnCreateButton();
    await header.clickOnNewApiButton();
    await expect(newApiModal.uploadApiDefinitionButton).toBeVisible();
    
    await newApiModal.uploadFromMyDeviceButton.setInputFiles(invalidFilePath);
    
    await newApiModal.waitForAlertToBeVisible();
    await expect(newApiModal.alertMessage).toBeVisible();
    await apiDocPage.takeValidationScreenshot('invalid-file-format-error');
  });

  test('TC-005B: Import Error Handling - Invalid YAML Structure - Should handle malformed YAML gracefully @import', async ({ page }) => {
    const invalidYamlPath = path.join(__dirname, '../../../../test-data/invalid-apis/empty/invalid-yaml.yaml');
    
    await header.clickOnCreateButton();
    await header.clickOnNewApiButton();
    await expect(newApiModal.uploadApiDefinitionButton).toBeVisible();
    
    await newApiModal.uploadFromMyDeviceButton.setInputFiles(invalidYamlPath);
    await newApiModal.clickOnNewApiReferenceButton();
    
    await newApiModal.waitForAlertToBeVisible();
    await expect(newApiModal.alertMessage).toBeVisible();
    await apiDocPage.takeValidationScreenshot('invalid-yaml-structure-error');
  });

  test('TC-005C: Import Error Handling - Invalid JSON Structure - Should handle malformed JSON gracefully @import', async ({ page }) => {
    const invalidJsonPath = path.join(__dirname, '../../../../test-data/invalid-apis/malformed/invalid-json-structure.json');
    
    await header.clickOnCreateButton();
    await header.clickOnNewApiButton();
    await expect(newApiModal.uploadApiDefinitionButton).toBeVisible();
    
    await newApiModal.uploadFromMyDeviceButton.setInputFiles(invalidJsonPath);
    await newApiModal.clickOnNewApiReferenceButton();
    
    await newApiModal.waitForAlertToBeVisible();
    await expect(newApiModal.alertMessage).toBeVisible();
    await apiDocPage.takeValidationScreenshot('invalid-json-structure-error');
  });

  test('TC-005D: Import Error Handling - Empty File - Should handle empty files gracefully @import', async ({ page }) => {
    const emptyFilePath = path.join(__dirname, '../../../../test-data/invalid-apis/empty/empty-file.yaml');
    
    await header.clickOnCreateButton();
    await header.clickOnNewApiButton();
    await expect(newApiModal.uploadApiDefinitionButton).toBeVisible();
    
    await newApiModal.uploadFromMyDeviceButton.setInputFiles(emptyFilePath);
    await toastMessage.waitForToastToAppear();
    await expect(toastMessage.toastMessage).toBeVisible();
    
    // Verify it's an error toast
    await expect(toastMessage.errorToast).toContainText('API Spec file upload failed. Please try again.');
  });

  test('TC-006: Import Error Handling - Invalid URL - Should handle invalid or inaccessible URLs gracefully @import', async ({ page }) => {
    const configManager = ConfigManager.getInstance();
    const invalidUrl = configManager.get<string>('INVALID_API_URL');
    
    await header.clickOnCreateButton();
    await header.clickOnNewApiButton();
    await expect(newApiModal.uploadApiDefinitionButton).toBeVisible();
    
    await newApiModal.clickCreateFromUrlRadio();
    await newApiModal.fillUrlInputBox(invalidUrl);
    await newApiModal.clickOnNewApiReferenceButton();
    
    await newApiModal.waitForAlertToBeVisible();
    await expect(newApiModal.alertMessage).toBeVisible();
    await apiDocPage.takeValidationScreenshot('invalid-url-error');
  });

  test.afterEach(async ({ page }) => {
    try {
      const apiHelper = new ApiHelper(page);
      await apiHelper.deleteTrackedApiDefinitions();
    } catch (error) {
      console.warn('⚠️ Failed to cleanup API definitions:', error);
    }
  });
});
