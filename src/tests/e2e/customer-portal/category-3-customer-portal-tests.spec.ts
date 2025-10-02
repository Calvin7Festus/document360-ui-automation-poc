import { test, expect } from '@playwright/test';
import { ApiDocPage } from '../../../page-factory/pages/api-doc.page';
import { Header } from '../../../page-factory/components/header.component';
import { NewApiCreationModal } from '../../../page-factory/components/new-api-creation.modal';
import { ApiHelper } from '../../../utils/api-helper';
import { ConfigManager } from '../../../utils/config-manager';
import path from 'path';

test.describe('Category 3: Customer Portal Validation Tests', () => {
  let apiDocPage: ApiDocPage;
  let header: Header;
  let newApiModal: NewApiCreationModal;
  let configManager: ConfigManager;

  test.beforeEach(async ({ page }) => {
    apiDocPage = new ApiDocPage(page);
    header = new Header(page);
    newApiModal = new NewApiCreationModal(page);
    
    // Navigate to Document360 dashboard
    configManager = ConfigManager.getInstance();
    await page.goto(configManager.get<string>('BASE_URL'));
    await page.waitForLoadState('networkidle');
    
    // Import comprehensive API for testing
    const apiFilePath = path.join(__dirname, '../../../test-data/create-api-doc/comprehensive-api.yaml');
    await header.clickOnCreateButton();
    await newApiModal.clickOnNewApiButton();
    await newApiModal.clickOnUploadDefinitionButton();
    await newApiModal.uploadFile(newApiModal.uploadFromMyDeviceButton, apiFilePath);
    await newApiModal.clickOnNewApiReferenceButton();
    await expect(page).toHaveURL(/api-documentation/);
    
    // Publish the API documentation
    await page.click('button:has-text("Publish"), .publish-button');
    await expect(page.locator('.success-message, .publish-success')).toBeVisible();
  });

  test('TC-062: Validate Published Content in Customer Portal - Should display published API documentation correctly in customer portal', async ({ page }) => {
    // Get customer portal URL from environment
    const customerPortalUrl = configManager.get<string>('CUSTOMER_PORTAL_URL');
    
    // Step 1: Navigate to customer portal URL
    await page.goto(customerPortalUrl);
    await page.waitForLoadState('networkidle');
    
    // Step 2: Look for API documentation section
    const apiDocSection = page.locator('.api-documentation, .api-docs, .documentation-section');
    await expect(apiDocSection).toBeVisible();
    
    // Step 3: Verify API title is displayed
    await expect(apiDocPage.apiTitle).toBeVisible();
    await expect(apiDocPage.apiTitle).toContainText('Comprehensive Test API');
    
    // Step 4: Verify API version is displayed
    await expect(apiDocPage.apiVersion).toBeVisible();
    await expect(apiDocPage.apiVersion).toContainText('1.0.0');
    
    // Step 5: Verify API description is displayed
    await expect(apiDocPage.apiDescription).toBeVisible();
    await expect(apiDocPage.apiDescription).toContainText('A comprehensive API definition for testing all Document360 UI elements');
    
    // Step 6: Test navigation through different sections
    await apiDocPage.clickOnIntroduction();
    await expect(apiDocPage.contactName).toBeVisible();
    
    // Look for endpoints section
    const endpointsSection = page.locator('.endpoints-section, .operations-section');
    if (await endpointsSection.isVisible()) {
      await expect(apiDocPage.endpointPath('/pets')).toBeVisible();
      await expect(apiDocPage.endpointPath('/users')).toBeVisible();
    }
    
    // Take screenshot for validation
    await apiDocPage.takeValidationScreenshot('customer-portal-published-content');
    
    // Verify no broken links or missing content
    const brokenLinks = page.locator('a[href="#"], a[href=""]');
    await expect(brokenLinks).toHaveCount(0);
  });

  test('TC-063: Validate Customer Portal Navigation - Should navigate correctly through all sections', async ({ page }) => {
    // Get customer portal URL from environment
    const customerPortalUrl = configManager.get<string>('CUSTOMER_PORTAL_URL');
    
    // Step 1: Navigate to customer portal
    await page.goto(customerPortalUrl);
    await page.waitForLoadState('networkidle');
    
    // Step 2: Click on API documentation link
    const apiDocLink = page.locator('a:has-text("API Documentation"), .api-docs-link');
    await expect(apiDocLink).toBeVisible();
    await apiDocLink.click();
    
    // Step 3: Navigate through different sections
    // Test Introduction section
    await apiDocPage.clickOnIntroduction();
    await expect(apiDocPage.contactName).toBeVisible();
    await expect(apiDocPage.contactEmail).toBeVisible();
    await expect(apiDocPage.contactUrl).toBeVisible();
    
    // Test Endpoints section
    const endpointsSection = page.locator('.endpoints-section, .operations-section');
    if (await endpointsSection.isVisible()) {
      // Test endpoint navigation
      await apiDocPage.clickOnEndpoint('/pets');
      await expect(apiDocPage.endpointSummary('/pets', 'GET')).toContainText('List all pets');
      
      // Test parameter viewing
      await expect(apiDocPage.parameterName('/pets', 'GET', 'limit')).toBeVisible();
      await expect(apiDocPage.parameterName('/pets', 'GET', 'offset')).toBeVisible();
      
      // Test response viewing
      await expect(apiDocPage.responseCode('/pets', 'GET', '200')).toBeVisible();
      await expect(apiDocPage.responseCode('/pets', 'GET', '400')).toBeVisible();
    }
    
    // Test Schemas section
    const schemasSection = page.locator('.schemas-section, .components-section');
    if (await schemasSection.isVisible()) {
      await expect(apiDocPage.schemaProperty('Pet', 'id')).toBeVisible();
      await expect(apiDocPage.schemaProperty('User', 'id')).toBeVisible();
    }
    
    // Take screenshot for validation
    await apiDocPage.takeValidationScreenshot('customer-portal-navigation');
    
    // Verify all navigation links work correctly
    const navigationLinks = page.locator('.nav-link, .navigation-item');
    const linkCount = await navigationLinks.count();
    for (let i = 0; i < linkCount; i++) {
      const link = navigationLinks.nth(i);
      await expect(link).toBeVisible();
      await expect(link).toBeEnabled();
    }
  });

  test('TC-064: Validate Cross-Format Consistency - Should display same API spec consistently regardless of import format', async ({ page }) => {
    // Test with YAML format
    await page.goto(configManager.get<string>('BASE_URL'));
    const yamlFilePath = path.join(__dirname, '../../../test-data/create-api-doc/comprehensive-api.yaml');
    await header.clickOnCreateButton();
    await newApiModal.clickOnNewApiButton();
    await newApiModal.clickOnUploadDefinitionButton();
    await newApiModal.uploadFile(newApiModal.uploadFromMyDeviceButton, yamlFilePath);
    await newApiModal.clickOnNewApiReferenceButton();
    await expect(page).toHaveURL(/api-documentation/);
    
    // Capture YAML version content
    const yamlTitle = await apiDocPage.apiTitle.textContent();
    const yamlVersion = await apiDocPage.apiVersion.textContent();
    const yamlDescription = await apiDocPage.apiDescription.textContent();
    
    // Publish YAML version
    await page.click('button:has-text("Publish"), .publish-button');
    await expect(page.locator('.success-message, .publish-success')).toBeVisible();
    
    // Navigate to customer portal and capture content
    const customerPortalUrl = configManager.get<string>('CUSTOMER_PORTAL_URL');
    await page.goto(customerPortalUrl);
    await page.waitForLoadState('networkidle');
    
    const portalTitle = await apiDocPage.apiTitle.textContent();
    const portalVersion = await apiDocPage.apiVersion.textContent();
    const portalDescription = await apiDocPage.apiDescription.textContent();
    
    // Verify content consistency
    expect(portalTitle).toBe(yamlTitle);
    expect(portalVersion).toBe(yamlVersion);
    expect(portalDescription).toBe(yamlDescription);
    
    // Test with JSON format
    await page.goto(configManager.get<string>('BASE_URL'));
    const jsonFilePath = path.join(__dirname, '../../../test-data/create-api-doc/json-api.json');
    await header.clickOnCreateButton();
    await newApiModal.clickOnNewApiButton();
    await newApiModal.clickOnUploadDefinitionButton();
    await newApiModal.uploadFile(newApiModal.uploadFromMyDeviceButton, jsonFilePath);
    await newApiModal.clickOnNewApiReferenceButton();
    await expect(page).toHaveURL(/api-documentation/);
    
    // Capture JSON version content
    const jsonTitle = await apiDocPage.apiTitle.textContent();
    const jsonVersion = await apiDocPage.apiVersion.textContent();
    const jsonDescription = await apiDocPage.apiDescription.textContent();
    
    // Verify JSON content matches YAML content
    expect(jsonTitle).toBe(yamlTitle);
    expect(jsonVersion).toBe(yamlVersion);
    expect(jsonDescription).toBe(yamlDescription);
    
    // Take screenshot for validation
    await apiDocPage.takeValidationScreenshot('cross-format-consistency');
  });

  test('TC-065: Validate Customer Portal Performance - Should load and perform well', async ({ page }) => {
    // Get customer portal URL from environment
    const customerPortalUrl = configManager.get<string>('CUSTOMER_PORTAL_URL');
    
    // Step 1: Navigate to customer portal and measure load time
    const startTime = Date.now();
    await page.goto(customerPortalUrl);
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Step 2: Verify page loads within acceptable time (< 3 seconds)
    expect(loadTime).toBeLessThan(3000);
    
    // Step 3: Test API documentation section load time
    const apiDocStartTime = Date.now();
    const apiDocSection = page.locator('.api-documentation, .api-docs, .documentation-section');
    await expect(apiDocSection).toBeVisible();
    const apiDocLoadTime = Date.now() - apiDocStartTime;
    
    // Verify API documentation loads quickly
    expect(apiDocLoadTime).toBeLessThan(1000);
    
    // Step 4: Test navigation response time
    const navStartTime = Date.now();
    await apiDocPage.clickOnIntroduction();
    await expect(apiDocPage.contactName).toBeVisible();
    const navResponseTime = Date.now() - navStartTime;
    
    // Verify navigation is responsive
    expect(navResponseTime).toBeLessThan(500);
    
    // Step 5: Test endpoint navigation performance
    const endpointsSection = page.locator('.endpoints-section, .operations-section');
    if (await endpointsSection.isVisible()) {
      const endpointStartTime = Date.now();
      await apiDocPage.clickOnEndpoint('/pets');
      await expect(apiDocPage.endpointSummary('/pets', 'GET')).toBeVisible();
      const endpointResponseTime = Date.now() - endpointStartTime;
      
      // Verify endpoint navigation is responsive
      expect(endpointResponseTime).toBeLessThan(500);
    }
    
    // Step 6: Verify no timeout errors
    const timeoutErrors = page.locator('.timeout-error, .loading-error');
    await expect(timeoutErrors).toHaveCount(0);
    
    // Take screenshot for validation
    await apiDocPage.takeValidationScreenshot('customer-portal-performance');
    
    // Log performance metrics
    console.log(`Page load time: ${loadTime}ms`);
    console.log(`API documentation load time: ${apiDocLoadTime}ms`);
    console.log(`Navigation response time: ${navResponseTime}ms`);
  });

  test.afterEach(async ({ page }) => {
    // Clean up: Delete API definitions created during the test
    try {
      const apiHelper = new ApiHelper(page);
      await apiHelper.cleanupAllApiDefinitions();
    } catch (error) {
      console.warn('⚠️ Failed to cleanup API definitions:', error);
    }
    
    // Navigate back to dashboard
    await page.goto(configManager.get<string>('BASE_URL'));
  });
});
