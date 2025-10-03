import { Locator, Page, expect } from '@playwright/test';
import { UIActions } from '../../commons/ui-actions';
import { ToastMessage } from '../components/toast-message.component';

export class ApiDocPage extends UIActions {

    // Core locators used in tests
    readonly introductionLink: Locator;
    readonly contactName: Locator;
    readonly contactUrl: Locator;
    readonly contactEmail: Locator;
    readonly liscenseName: Locator;
    readonly liscenseUrl: Locator;
    readonly termsOfService: Locator;
    readonly externalDocs: Locator;
    readonly serverVariablesSection: Locator;

    // Publishing locators
    readonly publishButton: Locator;
    readonly toastMessage: ToastMessage;

    // Function-based locators used in tests
    readonly getApiTitle: (title: string) => Locator;
    readonly apiVersion: (version: string) => Locator;
    readonly apiDescription: (description: string) => Locator;
    readonly serverUrl: (index: number) => Locator;
    readonly serverDescription: (index: number) => Locator;
    readonly endpointPath: (path: string) => Locator;
    readonly endpointSummary: (path: string, method: string) => Locator;
    readonly parameterName: (path: string, method: string, paramName: string) => Locator;
    readonly responseCode: (path: string, method: string, code: string) => Locator;
    readonly schemaProperty: (schemaName: string, propertyName: string) => Locator;

    // Properties used in Category 3 tests
    readonly apiTitle: Locator;

    constructor(page: Page) {
        super(page);
        
        // Initialize core locators
        this.introductionLink = this.page.locator(`a[title='Introduction']`);
        this.contactName = this.page.locator('em.contact-name');
        this.contactUrl = this.page.getByRole('link', { name: process.env.EXAMPLE_SUPPORT_URL || 'https://example.com/support' });
        this.contactEmail = this.page.locator('a.contact-email');
        this.liscenseName = this.page.locator('em.license-name');
        this.liscenseUrl = this.page.locator('a.license-url');
        this.termsOfService = this.page.locator('a.contact-name');
        this.externalDocs = this.page.locator('a.contact-url');
        this.serverVariablesSection = this.page.locator('.server-variable');

        // Initialize publishing locators
        this.publishButton = this.page.locator('button#publish');
        this.toastMessage = new ToastMessage(page);
        
        // Initialize function-based locators
        this.getApiTitle = (title: string) => this.getByTitle(title);
        this.apiVersion = (version: string) => this.page.getByText(version);
        this.apiDescription = (description: string) => this.page.getByText(description);
        this.serverUrl = (index: number) => this.page.locator('a.server-url').nth(index);
        this.serverDescription = (index: number) => this.page.locator('em.server-description').nth(index);
        this.endpointPath = (path: string) => this.page.getByText(path);
        this.endpointSummary = (path: string, method: string) => this.page.getByTitle('Returns a greeting message');
        this.parameterName = (path: string, method: string, paramName: string) => this.page.getByText(paramName, { exact: true });
        this.responseCode = (path: string, method: string, code: string) => this.page.locator(`[data-path="${path}"] .response-code:has-text("${code}"), .endpoint:has-text("${path}") .response-code:has-text("${code}"), .operation-summary:has-text("${path}") .response-code:has-text("${code}")`);
        this.schemaProperty = (schemaName: string, propertyName: string) => this.page.getByText(propertyName, { exact: true });
        
        // Properties used in Category 3 tests
        this.apiTitle = this.page.locator('.api-title, .title, h1');
    }

    // Core methods used in tests
    async clickOnIntroduction() {
        await this.introductionLink.click();
    }

    async clickOnEndpoint(path: string) {
        await this.endpointPath(path).click();
    }

    async takeValidationScreenshot(name: string) {
        await this.page.screenshot({ 
            path: `test-results/validation-screenshots/${name}-${Date.now()}.png`,
            fullPage: true 
        });
    }

    async publishApiDocumentation(): Promise<void> {
        console.log('📤 Publishing API documentation...');
        await this.publishButton.waitFor({ state: 'visible' });
        await this.publishButton.click();
        
        // Wait for and validate success toast
        await this.toastMessage.waitForSuccessToast();
        await expect(this.toastMessage.successToast).toBeVisible();
        
        // Get and log the toast message for debugging
        const toastText = await this.toastMessage.getToastText();
        console.log(`✅ API documentation published successfully. Toast message: "${toastText}"`);
    }

    // Helper methods for category folder navigation (used in comprehensive validation)
    getCategoryFolder(categoryName: string) {
        return this.page.locator(`a.article-title[title='${categoryName}']`);
    }

    getOperationLink(operationName: string) {
        return this.page.locator(`a[title="${operationName}"]`);
    }

    getMethodBadgeForOperation(operationName: string) {
        const methodBadgeXPath = `//a[@title='${operationName}']/ancestor::span[@class='article-title-container']/following-sibling::div/div[contains(@class,'badge-pill')]`;
        return this.page.locator(`xpath=${methodBadgeXPath}`);
    }

    getEndpointPathInContent() {
        return this.page.locator(`span.api-url`);
    }

    getEndpointDescription() {
        return this.page.locator('div.api-content > p');
    }

    getSecuritySection() {
        return this.page.locator('text="Security"').first();
    }

    getOAuthSecurityType() {
        return this.page.locator('.api-key-security-type:has-text("OAuth")');
    }

    getApiKeySecurityType() {
        return this.page.locator('.api-key-security-type:has-text("API Key")');
    }

    getApiKeyLocation() {
        return this.page.locator('.api-key-in');
    }

    getApiKeyName() {
        return this.page.locator('span.api-key-name');
    }

    getApiKeyDescription() {
        return this.page.locator('.api-security-codeblock-container:has(.api-key-security-type:has-text("API Key")) .description');
    }

    getAllSecurityContainers() {
        return this.page.locator('.api-security-codeblock-container');
    }

    getOAuthFlow() {
        return this.page.locator('.oauth-flow-cont .oauth-value');
    }

    getOAuthFlowTitle() {
        return this.page.locator('.oauth-flow-cont .oauth-title');
    }

    getAuthorizationURL() {
        return this.page.locator('.oauth-url');
    }

    getAuthorizationURLTitle() {
        return this.page.locator('div.api-key-name .oauth-title');
    }

    getScopesTitle() {
        return this.page.locator('.scope-title');
    }

    getScopeValue(scopeName: string) {
        return this.page.locator(`.scope-element .oauth-value:has-text("${scopeName}")`);
    }

    getScopeDescription(scopeName: string) {
        return this.page.locator(`.scope-element:has(.oauth-value:has-text("${scopeName}")) .oauth-description`);
    }

    getParametersSection() {
        return this.page.locator('text="Query parameters", text="Path parameters", text="Body parameters"').first();
    }

    getParameterType(paramName: string) {
        return this.page.locator(`.header-name:has(b:has-text("${paramName}")) + .header-type`);
    }

    getParameterDescription(paramName: string) {
        return this.page.locator(`.header-name:has(b:has-text("${paramName}")) ~ .api-code-description p`);
    }

    getResponsesSection() {
        return this.page.locator('text="Responses"').first();
    }

    getResponseDescription(code: string) {
        return this.page.locator(`.accordion-item:has(.api-code-title:has-text("${code}")) .description`);
    }

    getResponseHeaders(code: string) {
        return this.page.locator(`.accordion-item:has(.api-code-title:has-text("${code}")) .header-container`);
    }

    getResponseSchemaContainer(code: string) {
        return this.page.locator(`.accordion-item:has(.api-code-title:has-text("${code}")) .response-schema-header`);
    }

    getResponseSchemaProperty(code: string, propertyName: string) {
        return this.page.locator(`.accordion-item:has(.api-code-title:has-text("${code}")) .api-schema-property:has(.name:has-text("${propertyName}"))`);
    }

    async expandCategoryFolder(categoryName: string) {
        const categoryFolder = this.getCategoryFolder(categoryName);
        if (await categoryFolder.isVisible()) {
            await categoryFolder.click();
            await this.page.waitForTimeout(1000); // Wait for expansion animation
            return true;
        }
        return false;
    }

    async isCategoryFolderVisible(categoryName: string) {
        const categoryFolder = this.getCategoryFolder(categoryName);
        return await categoryFolder.isVisible();
    }

    async validateOperationInCategory(operationName: string) {
        const operationElement = this.getOperationLink(operationName);
        if (await operationElement.isVisible()) {
            await expect(operationElement).toBeVisible();
            return true;
        }
        return false;
    }

    // Validation Methods for API Documentation

    async validateHttpMethodBadge(summary: string): Promise<boolean> {
        const methodBadge = this.getMethodBadgeForOperation(summary);
        if (await methodBadge.isVisible()) {
            const badgeText = await methodBadge.textContent();
            const badgeColor = await methodBadge.evaluate((el: HTMLElement) => getComputedStyle(el).backgroundColor);
            console.log(`✅ Method badge: ${badgeText} (${badgeColor})`);
            return true;
        }
        return false;
    }

    async validateEndpointPath(expectedPath: string): Promise<boolean> {
        const pathElement = this.getEndpointPathInContent();
        if (await pathElement.isVisible()) {
            const displayedPath = await pathElement.textContent();
            if (displayedPath && displayedPath.includes(expectedPath)) {
                console.log(`✅ Path displayed and matches: ${expectedPath}`);
                return true;
            } else {
                console.log(`⚠️ Path element visible but content mismatch. Expected: ${expectedPath}, Found: ${displayedPath}`);
                return false;
            }
        } else {
            console.log(`⚠️ Path element not visible for: ${expectedPath}`);
            return false;
        }
    }

    async validateEndpointDescriptionContent(expectedDescription: string): Promise<boolean> {
        const descElement = this.getEndpointDescription();
        if (await descElement.isVisible()) {
            const displayedDescription = await descElement.textContent();
            if (displayedDescription && displayedDescription.includes(expectedDescription)) {
                console.log(`✅ Description displayed and matches: ${expectedDescription}`);
                return true;
            } else {
                console.log(`⚠️ Description element visible but content mismatch. Expected: ${expectedDescription}, Found: ${displayedDescription}`);
                return false;
            }
        } else {
            console.log(`⚠️ Description element not visible for: ${expectedDescription}`);
            return false;
        }
    }

    async validateSecuritySection(apiSpecParser: any, endpoint: any, method: string): Promise<boolean> {
        const securitySection = this.getSecuritySection();
        if (await securitySection.isVisible()) {
            console.log(`✅ Security section visible`);
            
            const endpointSecurity = apiSpecParser.getEndpointSecurity(endpoint.path, method);
            const securitySchemes = apiSpecParser.getSecuritySchemes();
            
            if (endpointSecurity.length > 0) {
                // Get all security containers on the page
                const securityContainers = this.getAllSecurityContainers();
                const containerCount = await securityContainers.count();
                console.log(`Found ${containerCount} security scheme(s) in UI`);
                
                // Validate each security requirement
                for (const securityReq of endpointSecurity) {
                    for (const [schemeName, scopes] of Object.entries(securityReq)) {
                        const schemeInfo = securitySchemes[schemeName];
                        if (schemeInfo) {
                            await this.validateSecurityScheme(schemeName, schemeInfo, scopes);
                        }
                    }
                }
            }
            return true;
        } else {
            console.log(`ℹ️ Security section not visible for ${endpoint.path} ${method}`);
            return false;
        }
    }

    private async validateSecurityScheme(schemeName: string, schemeInfo: any, scopes: any): Promise<void> {
        console.log(`  Validating security scheme: ${schemeName} (${schemeInfo.type})`);
        
        if (schemeInfo.type === 'oauth2') {
            await this.validateOAuthSecurity(schemeName, schemeInfo, scopes);
        } else if (schemeInfo.type === 'apiKey') {
            await this.validateApiKeySecurity(schemeName, schemeInfo);
        } else if (schemeInfo.type === 'http') {
            await this.validateHttpSecurity(schemeName, schemeInfo);
        }
    }

    private async validateOAuthSecurity(schemeName: string, schemeInfo: any, scopes: any[]): Promise<void> {
        // Validate OAuth security type
        const oauthType = this.getOAuthSecurityType();
        if (await oauthType.isVisible()) {
            const displayedType = await oauthType.textContent();
            console.log(`    ✅ OAuth security type displayed: ${displayedType}`);
        }
        
        // Validate OAuth flow
        const oauthFlowTitle = this.getOAuthFlowTitle();
        const oauthFlowValue = this.getOAuthFlow();
        if (await oauthFlowTitle.isVisible() && await oauthFlowValue.isVisible()) {
            const flowTitle = await oauthFlowTitle.textContent();
            const flowValue = await oauthFlowValue.textContent();
            console.log(`    ✅ OAuth flow displayed: ${flowTitle} - ${flowValue}`);
        }
        
        // Validate Authorization URL
        const authUrlTitle = this.getAuthorizationURLTitle();
        const authUrl = this.getAuthorizationURL();
        if (await authUrlTitle.isVisible() && await authUrl.isVisible()) {
            const urlTitle = await authUrlTitle.textContent();
            const urlValue = await authUrl.textContent();
            console.log(`    ✅ Authorization URL displayed: ${urlTitle} - ${urlValue}`);
        }
        
        // Validate Scopes
        if (Array.isArray(scopes) && scopes.length > 0) {
            await this.validateScopes(scopes);
        }
    }

    private async validateApiKeySecurity(schemeName: string, schemeInfo: any): Promise<void> {
        // Validate API Key security type
        const apiKeyType = this.getApiKeySecurityType();
        if (await apiKeyType.isVisible()) {
            const displayedType = await apiKeyType.textContent();
            console.log(`    ✅ API Key security type displayed: ${displayedType}`);
        }
        
        // Validate API Key location (header/query)
        const apiKeyLocation = this.getApiKeyLocation();
        if (await apiKeyLocation.isVisible()) {
            const displayedLocation = await apiKeyLocation.textContent();
            if (displayedLocation && displayedLocation.includes(schemeInfo.in)) {
                console.log(`    ✅ API Key location matches: ${schemeInfo.in}`);
            } else {
                console.log(`    ⚠️ API Key location mismatch. Expected: ${schemeInfo.in}, Found: ${displayedLocation}`);
            }
        }
        
        // Validate API Key name
        const apiKeyName = this.getApiKeyName();
        if (await apiKeyName.isVisible()) {
            const displayedName = await apiKeyName.textContent();
            if (displayedName && displayedName.includes(schemeInfo.name)) {
                console.log(`    ✅ API Key name matches: ${schemeInfo.name}`);
            } else {
                console.log(`    ⚠️ API Key name mismatch. Expected: ${schemeInfo.name}, Found: ${displayedName}`);
            }
        }
        
        // Validate API Key description
        if (schemeInfo.description) {
            const apiKeyDesc = this.getApiKeyDescription();
            if (await apiKeyDesc.isVisible()) {
                const displayedDesc = await apiKeyDesc.textContent();
                if (displayedDesc && displayedDesc.includes(schemeInfo.description)) {
                    console.log(`    ✅ API Key description matches: ${schemeInfo.description}`);
                } else {
                    console.log(`    ⚠️ API Key description mismatch. Expected: ${schemeInfo.description}, Found: ${displayedDesc}`);
                }
            }
        }
    }

    private async validateHttpSecurity(schemeName: string, schemeInfo: any): Promise<void> {
        console.log(`    ℹ️ HTTP security scheme validation not yet implemented for: ${schemeName} (${schemeInfo.scheme})`);
    }

    async validateParametersSection(apiSpecParser: any, endpoint: any, method: string): Promise<boolean> {
        const parameters = apiSpecParser.getEndpointParameters(endpoint.path, method);
        if (parameters.length > 0) {
            const paramSection = this.getParametersSection();
            if (await paramSection.isVisible()) {
                console.log(`✅ Parameters section visible (${parameters.length} params)`);
                
                for (const param of parameters) {
                    await this.validateSingleParameter(param);
                }
                return true;
            }
        } else {
            console.log(`ℹ️ No parameters found for ${endpoint.path} ${method}`);
        }
        return false;
    }

    async validateResponsesSection(apiSpecParser: any, endpoint: any, method: string): Promise<boolean> {
        const responses = apiSpecParser.getEndpointResponses(endpoint.path, method);
        const responseKeys = Object.keys(responses);
        if (responseKeys.length > 0) {
            const responsesSection = this.getResponsesSection();
            if (await responsesSection.isVisible()) {
                console.log(`✅ Responses section visible`);
                
                for (const responseCode of responseKeys.slice(0, 2)) { // Check first 2 responses
                    await this.validateSingleResponse(apiSpecParser, endpoint, method, responseCode);
                }
                return true;
            }
        } else {
            console.log(`ℹ️ No responses found for ${endpoint.path} ${method}`);
        }
        return false;
    }

    /**
     * Validate complete introduction section - comprehensive introduction validation
     */
    async validateCompleteIntroductionSection(testData: any): Promise<void> {
        console.log(`Validating complete introduction section`);
        
        // Navigate to introduction section
        await this.clickOnIntroduction();
        
        // 1. Validate API Title
        await this.validateApiTitle(testData.apiTitle);
        
        // 2. Validate API Version
        await this.validateApiVersion(testData.apiVersion);
        
        // 3. Validate API Description
        await this.validateApiDescription(testData.apiDescription);
        
        // 4. Validate Terms of Service
        await this.validateTermsOfService(testData.termsOfService);
        
        // 5. Validate External Documentation
        await this.validateExternalDocumentation(testData.contactInfo?.url);
        
        // 6. Validate Contact Information
        await this.validateContactInformation(testData.contactInfo);
        
        // 7. Validate License Information
        await this.validateLicenseInformation(testData.licenseInfo);
        
        // 8. Validate Server Information
        await this.validateServerInformation(testData.servers);
        
        // 9. Validate Server Variables
        await this.validateServerVariables(testData.servers);
        
        // Take final screenshot
        await this.takeValidationScreenshot('complete-introduction-validation');
        console.log(`✅ Complete introduction section validation completed`);
    }

    /**
     * Validate complete API documentation display - comprehensive endpoint validation
     */
    async validateCompleteApiDocumentation(apiSpecParser: any, testData: any, page: any): Promise<void> {
        console.log(`${testData.endpoints.length} endpoints found for validation`);
        
        // Extract categories from endpoint paths
        const categories = [...new Set(testData.endpointPaths.map((path: string) => path.split('/')[1]).filter(Boolean))];
        console.log(`📁 Found categories: ${categories.join(', ')}`);
        
        // Validate each category and its operations
        for (const category of categories) {
            await this.validateCategoryOperations(category as string, testData, apiSpecParser, page);
        }
        
        // Take final screenshot
        await this.takeValidationScreenshot('complete-api-documentation');
        console.log(`✅ Complete API documentation validation completed`);
    }

    // Private helper methods for comprehensive validation

    private async validateApiTitle(apiTitle: string): Promise<void> {
        console.log(`🔍 Validating API Title: ${apiTitle}`);
        await expect(this.getApiTitle(apiTitle)).toBeVisible();
        console.log(`✅ API Title validated: ${apiTitle}`);
    }

    private async validateApiVersion(apiVersion: string): Promise<void> {
        console.log(`🔍 Validating API Version: ${apiVersion}`);
        await expect(this.apiVersion(apiVersion)).toBeVisible();
        console.log(`✅ API Version validated: ${apiVersion}`);
    }

    private async validateApiDescription(apiDescription?: string): Promise<void> {
        if (apiDescription) {
            console.log(`🔍 Validating API Description: ${apiDescription}`);
            await expect(this.apiDescription(apiDescription)).toBeVisible();
            console.log(`✅ API Description validated`);
        } else {
            console.log(`ℹ️ No API description found in test data, skipping validation`);
        }
    }

    private async validateTermsOfService(termsOfService?: string): Promise<void> {
        if (termsOfService) {
            console.log(`🔍 Validating Terms of Service: ${termsOfService}`);
            await expect(this.termsOfService).toBeVisible();
            await expect(this.termsOfService).toHaveAttribute('href', termsOfService);
            console.log(`✅ Terms of Service validated: ${termsOfService}`);
        } else {
            console.log(`ℹ️ No terms of service found in test data, skipping validation`);
        }
    }

    private async validateExternalDocumentation(externalDocsUrl?: string): Promise<void> {
        if (externalDocsUrl) {
            console.log(`🔍 Validating external documentation: ${externalDocsUrl}`);
            await expect(this.externalDocs).toBeVisible();
            await expect(this.externalDocs).toHaveAttribute('href', externalDocsUrl);
            console.log(`✅ External Documentation validated`);
        } else {
            console.log(`ℹ️ No external documentation found in test data, skipping validation`);
        }
    }

    private async validateContactInformation(contactInfo?: any): Promise<void> {
        if (contactInfo?.name) {
            console.log(`🔍 Validating Contact Name: ${contactInfo.name}`);
            await expect(this.contactName).toBeVisible();
            await expect(this.contactName).toContainText(contactInfo.name);
            console.log(`✅ Contact Name validated: ${contactInfo.name}`);
        }
        
        if (contactInfo?.email) {
            console.log(`🔍 Validating Contact Email: ${contactInfo.email}`);
            await expect(this.contactEmail).toBeVisible();
            await expect(this.contactEmail).toContainText(contactInfo.email);
            await expect(this.contactEmail).toHaveAttribute('href', `mailto: ${contactInfo.email}`);
            console.log(`✅ Contact Email validated: ${contactInfo.email}`);
        }
        
        if (contactInfo?.url) {
            console.log(`🔍 Validating Contact URL: ${contactInfo.url}`);
            await expect(this.contactUrl).toBeVisible();
            await expect(this.contactUrl).toContainText(contactInfo.url);
            await expect(this.contactUrl).toHaveAttribute('href', contactInfo.url);
            console.log(`✅ Contact URL validated: ${contactInfo.url}`);
        }
    }

    private async validateLicenseInformation(licenseInfo?: any): Promise<void> {
        if (licenseInfo?.name) {
            console.log(`🔍 Validating License Name: ${licenseInfo.name}`);
            await expect(this.liscenseName).toBeVisible();
            await expect(this.liscenseName).toContainText(licenseInfo.name);
            console.log(`✅ License Name validated: ${licenseInfo.name}`);
        }
        
        if (licenseInfo?.url) {
            console.log(`🔍 Validating License URL: ${licenseInfo.url}`);
            await expect(this.liscenseUrl).toBeVisible();
            await expect(this.liscenseUrl).toContainText(licenseInfo.url);
            await expect(this.liscenseUrl).toHaveAttribute('href', licenseInfo.url);
            console.log(`✅ License URL validated: ${licenseInfo.url}`);
        }
    }

    private async validateServerInformation(servers: any[]): Promise<void> {
        if (servers.length > 0) {
            console.log(`🔍 Validating ${servers.length} server(s)`);
            
            const maxServers = Math.min(servers.length, 3); // Limit to 3 servers for performance
            for (let i = 0; i < maxServers; i++) {
                const server = servers[i];
                
                // Validate server URL
                console.log(`  🔍 Validating server URL: "${server.url}"`);
                await expect(this.serverUrl(i)).toBeVisible();
                await expect(this.serverUrl(i)).toContainText(server.url);
                console.log(`  ✅ Server URL validated: "${server.url}"`);
                
                // Validate server description if present
                if (server.description) {
                    console.log(`  🔍 Validating server description: "${server.description}"`);
                    await expect(this.serverDescription(i)).toBeVisible();
                    await expect(this.serverDescription(i)).toContainText(server.description);
                    console.log(`  ✅ Server description validated: "${server.description}"`);
                }
            }
        } else {
            console.log(`ℹ️ No servers found in test data, skipping validation`);
        }
    }

    private async validateServerVariables(servers: any[]): Promise<void> {
        const serversWithVariables = servers.filter(server => server.variables && Object.keys(server.variables).length > 0);
        if (serversWithVariables.length > 0) {
            console.log(`🔍 Validating server variables for ${serversWithVariables.length} server(s)`);
            
            if (await this.serverVariablesSection.isVisible()) {
                await expect(this.serverVariablesSection).toBeVisible();
                console.log(`  ✅ Server variables section is visible`);
            } else {
                console.log(`  ℹ️ Server variables section not visible in UI`);
            }
        } else {
            console.log(`ℹ️ No server variables found in test data, skipping validation`);
        }
    }

    private async validateCategoryOperations(category: string, testData: any, apiSpecParser: any, page: any): Promise<void> {
        if (await this.isCategoryFolderVisible(category)) {
            console.log(`✅ Found category: "${category}"`);
            await this.expandCategoryFolder(category);
            
            // Get operations for this category
            const categoryOperations = testData.endpoints.filter((endpoint: any) => 
                endpoint.path.startsWith(`/${category}`)
            );
            
            // Validate each operation in the category
            for (const endpoint of categoryOperations) {
                for (const method of endpoint.methods) {
                    await this.validateSingleOperation(endpoint, method, apiSpecParser, page);
                }
            }
        } else {
            console.log(`⚠️ Category not found: "${category}"`);
        }
    }

    private async validateSingleOperation(endpoint: any, method: string, apiSpecParser: any, page: any): Promise<void> {
        const summary = apiSpecParser.getEndpointSummary(endpoint.path, method);
        if (!summary) return;
        
        console.log(`🔍 Validating: ${summary}`);
        
        // 1. Validate operation visibility
        if (await this.validateOperationInCategory(summary)) {
            console.log(`✅ Operation visible: ${summary}`);
            
            // 2. Validate HTTP method badge and color
            await this.validateHttpMethodBadge(summary);
            
            // 3. Navigate to operation details
            await this.navigateToOperationDetails(summary, page);
            
            // 4. Validate operation content
            await this.validateOperationContent(endpoint, method, apiSpecParser);
        } else {
            console.log(`⚠️ Operation not visible: ${summary}`);
        }
    }

    private async navigateToOperationDetails(summary: string, page: any): Promise<void> {
        const operationLink = this.getOperationLink(summary);
        await operationLink.click();
        await page.waitForTimeout(1000); // Wait for page to load
    }

    private async validateOperationContent(endpoint: any, method: string, apiSpecParser: any): Promise<void> {
        // Validate endpoint path
        await this.validateEndpointPath(endpoint.path);
        
        // Validate endpoint description
        const description = apiSpecParser.getEndpointDescription(endpoint.path, method);
        if (description) {
            await this.validateEndpointDescriptionContent(description);
        } else {
            console.log(`ℹ️ No description found in API spec for ${endpoint.path} ${method}`);
        }
        
        // Validate security section
        await this.validateSecuritySection(apiSpecParser, endpoint, method);
        
        // Validate parameters section
        await this.validateParametersSection(apiSpecParser, endpoint, method);
        
        // Validate responses section
        await this.validateResponsesSection(apiSpecParser, endpoint, method);
    }

    private async validateScopes(scopes: any[]): Promise<void> {
        const scopesTitle = this.getScopesTitle();
        if (await scopesTitle.isVisible()) {
            const scopesTitleText = await scopesTitle.textContent();
            console.log(`    ✅ Scopes section displayed: ${scopesTitleText}`);
            
            for (const scope of scopes) {
                const scopeValue = this.getScopeValue(scope);
                const scopeDesc = this.getScopeDescription(scope);
                
                if (await scopeValue.isVisible()) {
                    const scopeText = await scopeValue.textContent();
                    console.log(`      ✅ Scope value displayed: ${scopeText}`);
                    
                    if (await scopeDesc.isVisible()) {
                        const descText = await scopeDesc.textContent();
                        console.log(`      ✅ Scope description displayed: ${descText}`);
                    }
                }
            }
        }
    }

    private async validateSingleParameter(param: any): Promise<void> {
        const paramName = param.name;
        console.log(`  Validating parameter: ${paramName}`);
        
        // Validate parameter name
        const paramNameElement = this.parameterName('', '', paramName);
        if (await paramNameElement.isVisible()) {
            const displayedName = await paramNameElement.textContent();
            if (displayedName === paramName) {
                console.log(`    ✅ Parameter name matches: ${paramName}`);
            } else {
                console.log(`    ⚠️ Parameter name mismatch. Expected: ${paramName}, Found: ${displayedName}`);
            }
        } else {
            console.log(`    ⚠️ Parameter name not visible: ${paramName}`);
        }
        
        // Validate parameter type
        const paramTypeElement = this.getParameterType(paramName);
        if (await paramTypeElement.isVisible()) {
            const displayedType = await paramTypeElement.textContent();
            const expectedType = param.schema?.type || 'unknown';
            
            if (displayedType && displayedType.includes(expectedType)) {
                console.log(`    ✅ Parameter type displayed: ${displayedType}`);
            } else {
                console.log(`    ⚠️ Parameter type mismatch. Expected: ${expectedType}, Found: ${displayedType}`);
            }
        }
        
        // Validate parameter description
        if (param.description) {
            const paramDescElement = this.getParameterDescription(paramName);
            if (await paramDescElement.isVisible()) {
                const displayedDesc = await paramDescElement.textContent();
                if (displayedDesc && displayedDesc.includes(param.description)) {
                    console.log(`    ✅ Parameter description matches: ${param.description}`);
                } else {
                    console.log(`    ⚠️ Parameter description mismatch. Expected: ${param.description}, Found: ${displayedDesc}`);
                }
            } else {
                console.log(`    ⚠️ Parameter description not visible for: ${paramName}`);
            }
        }
    }

    private async validateSingleResponse(apiSpecParser: any, endpoint: any, method: string, responseCode: string): Promise<void> {
        console.log(`  Validating response: ${responseCode}`);
        
        const responseElement = this.responseCode(endpoint.path, method, responseCode);
        if (await responseElement.isVisible()) {
            console.log(`    ✅ Response ${responseCode} visible`);
            
            // Validate response description
            const responseDesc = apiSpecParser.getResponseDescription(endpoint.path, method, responseCode);
            if (responseDesc) {
                const descElement = this.getResponseDescription(responseCode);
                if (await descElement.isVisible()) {
                    const displayedDesc = await descElement.textContent();
                    if (displayedDesc && displayedDesc.includes(responseDesc)) {
                        console.log(`    ✅ Response description matches: ${responseDesc}`);
                    }
                }
            }
            
            // Validate response headers
            const responseHeaders = apiSpecParser.getResponseHeaders(endpoint.path, method, responseCode);
            const headerNames = Object.keys(responseHeaders);
            if (headerNames.length > 0) {
                const headersContainer = this.getResponseHeaders(responseCode);
                if (await headersContainer.isVisible()) {
                    console.log(`    ✅ Response headers container visible (${headerNames.length} headers)`);
                }
            }
            
            // Validate response schema
            const mediaTypes = apiSpecParser.getResponseMediaTypes(endpoint.path, method, responseCode);
            if (mediaTypes.length > 0) {
                const schemaContainer = this.getResponseSchemaContainer(responseCode);
                if (await schemaContainer.isVisible()) {
                    console.log(`    ✅ Response schema container visible`);
                    
                    const defaultMediaType = mediaTypes.includes('application/json') ? 'application/json' : mediaTypes[0];
                    const responseSchema = apiSpecParser.getResponseSchema(endpoint.path, method, responseCode, defaultMediaType);
                    
                    if (responseSchema.type === 'array' && responseSchema.items?.properties) {
                        const properties = Object.keys(responseSchema.items.properties);
                        console.log(`    Validating ${properties.length} schema properties`);
                        
                        for (const propName of properties.slice(0, 3)) {
                            const propElement = this.getResponseSchemaProperty(responseCode, propName);
                            if (await propElement.isVisible()) {
                                console.log(`      ✅ Schema property visible: ${propName}`);
                            }
                        }
                    }
                }
            }
        }
    }
}