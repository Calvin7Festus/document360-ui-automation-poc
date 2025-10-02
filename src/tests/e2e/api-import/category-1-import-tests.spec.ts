import { test, expect } from '@playwright/test';
import { ApiDocPage } from '../../../page-factory/pages/api-doc.page';
import { Header } from '../../../page-factory/components/header.component';
import { NewApiCreationModal } from '../../../page-factory/components/new-api-creation.modal';
import { ToastMessage } from '../../../page-factory/components/toast-message.component';
import { ApiHelper } from '../../../utils/api-helper';
import { ConfigManager } from '../../../utils/config-manager';
import path from 'path';

test.describe('Category 1: API Import Functionality Tests', () => {
  let apiDocPage: ApiDocPage;
  let header: Header;
  let newApiModal: NewApiCreationModal;
  let toastMessage: ToastMessage;

  test.beforeEach(async ({ page }) => {
    apiDocPage = new ApiDocPage(page);
    header = new Header(page);
    newApiModal = new NewApiCreationModal(page);
    toastMessage = new ToastMessage(page);

    const configManager = ConfigManager.getInstance();
    await page.goto(configManager.get<string>('BASE_URL'));
  });

  test('TC-001: Import YAML File - Should successfully import API documentation from YAML file @import', async ({ page }) => {
    const yamlFilePath = path.join(__dirname, '../../../../test-data/create-api-doc/yaml-api.yaml');
    const apiHelper = new ApiHelper(page);
    
    await header.clickOnCreateButton();
    await header.clickOnNewApiButton();
    await expect(newApiModal.uploadApiDefinitionButton).toBeVisible();
    
    await newApiModal.uploadFromMyDeviceButton.setInputFiles(yamlFilePath);

    await newApiModal.clickOnNewApiReferenceButton();
    console.log('⏳ Waiting for API creation response...');
    const apiResponsePromise = apiHelper.waitForApiCreationResponse();
    
    const apiResponse = await apiResponsePromise;
    if (apiResponse) {
      console.log(`✅ Captured API creation: ${apiResponse.apiDefinitionId}`);
      console.log(`📝 Tracked IDs: ${apiResponse.apiDefinitionId} with version: ${apiResponse.projectDocumentVersionId}`);
    } else {
      console.log('⚠️ Failed to capture API creation response');
    }

    await newApiModal.clickOnCancelButton();
    
    await expect(page).toHaveURL(/api-documentation/);
    await expect(apiDocPage.getApiTitle('YAML API Specification')).toBeVisible();
    await apiDocPage.takeValidationScreenshot('yaml-import-success');
  });

  test('TC-002: Import JSON File - Should successfully import API documentation from JSON file @import', async ({ page }) => {
    const jsonFilePath = path.join(__dirname, '../../../../test-data/create-api-doc/json-api.json');
    const apiHelper = new ApiHelper(page);
    
    await header.clickOnCreateButton();
    await header.clickOnNewApiButton();
    await expect(newApiModal.uploadApiDefinitionButton).toBeVisible();
    
    await newApiModal.uploadFromMyDeviceButton.setInputFiles(jsonFilePath);

    await newApiModal.clickOnNewApiReferenceButton();
    console.log('⏳ Waiting for API creation response...');
    const apiResponsePromise = apiHelper.waitForApiCreationResponse();
    
    const apiResponse = await apiResponsePromise;
    if (apiResponse) {
      console.log(`✅ Captured API creation: ${apiResponse.apiDefinitionId}`);
      console.log(`📝 Tracked IDs: ${apiResponse.apiDefinitionId} with version: ${apiResponse.projectDocumentVersionId}`);
    } else {
      console.log('⚠️ Failed to capture API creation response');
    }

    await newApiModal.clickOnCancelButton();
    
    await expect(page).toHaveURL(/api-documentation/);
    await expect(apiDocPage.getApiTitle('JSON API Specification')).toBeVisible();
    await apiDocPage.takeValidationScreenshot('json-import-success');
  });

  test('TC-003: Import YML File - Should successfully import API documentation from YML file @import', async ({ page }) => {
    const ymlFilePath = path.join(__dirname, '../../../../test-data/create-api-doc/yml-api.yml');
    const apiHelper = new ApiHelper(page);
    
    await header.clickOnCreateButton();
    await header.clickOnNewApiButton();
    await expect(newApiModal.uploadApiDefinitionButton).toBeVisible();
    
    await newApiModal.uploadFromMyDeviceButton.setInputFiles(ymlFilePath);

    await newApiModal.clickOnNewApiReferenceButton();
    console.log('⏳ Waiting for API creation response...');
    const apiResponsePromise = apiHelper.waitForApiCreationResponse();
    
    const apiResponse = await apiResponsePromise;
    if (apiResponse) {
      console.log(`✅ Captured API creation: ${apiResponse.apiDefinitionId}`);
      console.log(`📝 Tracked IDs: ${apiResponse.apiDefinitionId} with version: ${apiResponse.projectDocumentVersionId}`);
    } else {
      console.log('⚠️ Failed to capture API creation response');
    }

    await newApiModal.clickOnCancelButton();
    
    await expect(page).toHaveURL(/api-documentation/);
    await expect(apiDocPage.getApiTitle('YML API Specification')).toBeVisible();
    await apiDocPage.takeValidationScreenshot('yml-import-success');
  });

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
    console.log('⏳ Waiting for API creation response...');
    const apiResponsePromise = apiHelper.waitForApiCreationResponse();
    
    const apiResponse = await apiResponsePromise;
    if (apiResponse) {
      console.log(`✅ Captured API creation: ${apiResponse.apiDefinitionId}`);
      console.log(`📝 Tracked IDs: ${apiResponse.apiDefinitionId} with version: ${apiResponse.projectDocumentVersionId}`);
    } else {
      console.log('⚠️ Failed to capture API creation response');
    }

    await newApiModal.clickOnCancelButton();
    
    await expect(page).toHaveURL(/api-documentation/);
    await expect(apiDocPage.getApiTitle('Swagger Petstore')).toBeVisible();
    await apiDocPage.takeValidationScreenshot('url-import-success');
  });

  test('TC-005A: Import Error Handling - Invalid File Format - Should handle unsupported file formats gracefully @import', async ({ page }) => {
    const invalidFilePath = path.join(__dirname, '../../../../test-data/create-api-doc/invalid-file.txt');
    
    await header.clickOnCreateButton();
    await header.clickOnNewApiButton();
    await expect(newApiModal.uploadApiDefinitionButton).toBeVisible();
    
    await newApiModal.uploadFromMyDeviceButton.setInputFiles(invalidFilePath);
    
    await newApiModal.waitForAlertToBeVisible();
    await expect(newApiModal.alertMessage).toBeVisible();
    await apiDocPage.takeValidationScreenshot('invalid-file-format-error');
  });

  test('TC-005B: Import Error Handling - Invalid YAML Structure - Should handle malformed YAML gracefully @import', async ({ page }) => {
    const invalidYamlPath = path.join(__dirname, '../../../../test-data/create-api-doc/invalid-yaml.yaml');
    
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
    const invalidJsonPath = path.join(__dirname, '../../../../test-data/create-api-doc/invalid-json-structure.json');
    
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
    const emptyFilePath = path.join(__dirname, '../../../../test-data/create-api-doc/empty-file.yaml');
    
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
      console.log('🧹 Starting cleanup...');
      const apiHelper = new ApiHelper(page);
      const result = await apiHelper.deleteTrackedApiDefinitions();
      console.log(`🧹 Cleanup result: ${result}`);
    } catch (error) {
      console.warn('⚠️ Failed to cleanup API definitions:', error);
    }
  });
});
