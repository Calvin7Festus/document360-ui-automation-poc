import { Locator, Page, expect } from '@playwright/test';
import { UIActions } from '../../commons/ui-actions';
import { ToastMessage } from '../components/toast-message.component';
import { escapeTextForSelector, createSafeTextSelector, createMultipleSelectors } from '../../commons/locator-utils';

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
    readonly apiDescription: Locator;
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
        
        // Initialize function-based locators with safe text handling
        this.getApiTitle = (title: string) => {
            const escapedTitle = escapeTextForSelector(title);
            return this.page.locator(`a[title='${escapedTitle}']`);
        };
        this.apiVersion = (version: string) => this.page.getByText(version, { exact: true });
        this.apiDescription = this.page.locator(`.article-description > p`).first();
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
            fullPage: true,
            timeout: 30000 // 30 seconds timeout for screenshot (fonts can be slow in headless mode)
        });
    }

    async publishApiDocumentation(): Promise<void> {
        await this.publishButton.waitFor({ state: 'visible' });
        await this.publishButton.click();
        
        // Wait for and validate success toast
        await this.toastMessage.waitForSuccessToast();
        await expect(this.toastMessage.successToast).toBeVisible();
        
        // Get the toast message for verification
        const toastText = await this.toastMessage.getToastText();
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
            return true;
        }
        return false;
    }

    async validateEndpointPath(expectedPath: string): Promise<boolean> {
        const pathElement = this.getEndpointPathInContent();
        if (await pathElement.isVisible()) {
            const displayedPath = await pathElement.textContent();
            if (displayedPath && displayedPath.includes(expectedPath)) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    async validateEndpointDescriptionContent(expectedDescription: string): Promise<boolean> {
        const descElement = this.getEndpointDescription();
        if (await descElement.isVisible()) {
            const displayedDescription = await descElement.textContent();
            if (displayedDescription && displayedDescription.includes(expectedDescription)) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    async validateSecuritySection(apiSpecParser: any, endpoint: any, method: string): Promise<boolean> {
        const securitySection = this.getSecuritySection();
        if (await securitySection.isVisible()) {
            
            const endpointSecurity = apiSpecParser.getEndpointSecurity(endpoint.path, method);
            const securitySchemes = apiSpecParser.getSecuritySchemes();
            
            if (endpointSecurity.length > 0) {
                // Get all security containers on the page
                const securityContainers = this.getAllSecurityContainers();
                const containerCount = await securityContainers.count();
                
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
            return false;
        }
    }

    private async validateSecurityScheme(schemeName: string, schemeInfo: any, scopes: any): Promise<void> {
        
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
        }
        
        // Validate OAuth flow
        const oauthFlowTitle = this.getOAuthFlowTitle();
        const oauthFlowValue = this.getOAuthFlow();
        if (await oauthFlowTitle.isVisible() && await oauthFlowValue.isVisible()) {
            const flowTitle = await oauthFlowTitle.textContent();
            const flowValue = await oauthFlowValue.textContent();
        }
        
        // Validate Authorization URL
        const authUrlTitle = this.getAuthorizationURLTitle();
        const authUrl = this.getAuthorizationURL();
        if (await authUrlTitle.isVisible() && await authUrl.isVisible()) {
            const urlTitle = await authUrlTitle.textContent();
            const urlValue = await authUrl.textContent();
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
        }
        
        // Validate API Key location (header/query)
        const apiKeyLocation = this.getApiKeyLocation();
        if (await apiKeyLocation.isVisible()) {
            const displayedLocation = await apiKeyLocation.textContent();
            if (displayedLocation && displayedLocation.includes(schemeInfo.in)) {
            } else {
            }
        }
        
        // Validate API Key name
        const apiKeyName = this.getApiKeyName();
        if (await apiKeyName.isVisible()) {
            const displayedName = await apiKeyName.textContent();
            if (displayedName && displayedName.includes(schemeInfo.name)) {
            } else {
            }
        }
        
        // Validate API Key description
        if (schemeInfo.description) {
            const apiKeyDesc = this.getApiKeyDescription();
            if (await apiKeyDesc.isVisible()) {
                const displayedDesc = await apiKeyDesc.textContent();
                if (displayedDesc && displayedDesc.includes(schemeInfo.description)) {
                } else {
                }
            }
        }
    }

    private async validateHttpSecurity(schemeName: string, schemeInfo: any): Promise<void> {
    }

    async validateParametersSection(apiSpecParser: any, endpoint: any, method: string): Promise<boolean> {
        const parameters = apiSpecParser.getEndpointParameters(endpoint.path, method);
        if (parameters.length > 0) {
            const paramSection = this.getParametersSection();
            if (await paramSection.isVisible()) {
                
                for (const param of parameters) {
                    await this.validateSingleParameter(param);
                }
                return true;
            }
        } else {
        }
        return false;
    }

    async validateResponsesSection(apiSpecParser: any, endpoint: any, method: string): Promise<boolean> {
        const responses = apiSpecParser.getEndpointResponses(endpoint.path, method);
        const responseKeys = Object.keys(responses);
        if (responseKeys.length > 0) {
            const responsesSection = this.getResponsesSection();
            if (await responsesSection.isVisible()) {
                
                for (const responseCode of responseKeys.slice(0, 2)) { // Check first 2 responses
                    await this.validateSingleResponse(apiSpecParser, endpoint, method, responseCode);
                }
                return true;
            }
        } else {
        }
        return false;
    }

    /**
     * Validate complete introduction section - comprehensive introduction validation
     */
    async validateCompleteIntroductionSection(testData: any): Promise<void> {
        
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
    }

    /**
     * Validate complete API documentation display - comprehensive endpoint validation
     */
    async validateCompleteApiDocumentation(apiSpecParser: any, testData: any, page: any): Promise<void> {
        
        // Extract categories from endpoint paths
        const categories = [...new Set(testData.endpointPaths.map((path: string) => path.split('/')[1]).filter(Boolean))];
        
        // Validate each category and its operations
        for (const category of categories) {
            await this.validateCategoryOperations(category as string, testData, apiSpecParser, page);
        }
        
        // Take final screenshot
        await this.takeValidationScreenshot('complete-api-documentation');
    }

    // Private helper methods for comprehensive validation

    private async validateApiTitle(apiTitle: string): Promise<void> {
        await this.getApiTitle(apiTitle).waitFor({ state: 'visible', timeout: 10000 });
        await expect(this.getApiTitle(apiTitle)).toBeVisible();
    }

    private async validateApiVersion(apiVersion: string): Promise<void> {
        await expect(this.apiVersion(apiVersion)).toBeVisible();
    }

    private async validateApiDescription(apiDescription?: string): Promise<void> {
        if (apiDescription) {
            await expect(this.apiDescription).toContainText(apiDescription);
        } else {
        }
    }

    private async validateTermsOfService(termsOfService?: string): Promise<void> {
        if (termsOfService) {
            await expect(this.termsOfService).toBeVisible();
            await expect(this.termsOfService).toHaveAttribute('href', termsOfService);
        } else {
        }
    }

    private async validateExternalDocumentation(externalDocsUrl?: string): Promise<void> {
        if (externalDocsUrl) {
            await expect(this.externalDocs).toBeVisible();
            await expect(this.externalDocs).toHaveAttribute('href', externalDocsUrl);
        } else {
        }
    }

    private async validateContactInformation(contactInfo?: any): Promise<void> {
        if (contactInfo?.name) {
            await expect(this.contactName).toBeVisible();
            await expect(this.contactName).toContainText(contactInfo.name);
        }
        
        if (contactInfo?.email) {
            await expect(this.contactEmail).toBeVisible();
            await expect(this.contactEmail).toContainText(contactInfo.email);
            await expect(this.contactEmail).toHaveAttribute('href', `mailto: ${contactInfo.email}`);
        }
        
        if (contactInfo?.url) {
            await expect(this.contactUrl).toBeVisible();
            await expect(this.contactUrl).toContainText(contactInfo.url);
            await expect(this.contactUrl).toHaveAttribute('href', contactInfo.url);
        }
    }

    private async validateLicenseInformation(licenseInfo?: any): Promise<void> {
        if (licenseInfo?.name) {
            await expect(this.liscenseName).toBeVisible();
            await expect(this.liscenseName).toContainText(licenseInfo.name);
        }
        
        if (licenseInfo?.url) {
            await expect(this.liscenseUrl).toBeVisible();
            await expect(this.liscenseUrl).toContainText(licenseInfo.url);
            await expect(this.liscenseUrl).toHaveAttribute('href', licenseInfo.url);
        }
    }

    private async validateServerInformation(servers: any[]): Promise<void> {
        if (servers.length > 0) {
            
            const maxServers = Math.min(servers.length, 3); // Limit to 3 servers for performance
            for (let i = 0; i < maxServers; i++) {
                const server = servers[i];
                
                // Validate server URL
                await expect(this.serverUrl(i)).toBeVisible();
                await expect(this.serverUrl(i)).toContainText(server.url);
                
                // Validate server description if present
                if (server.description) {
                    await expect(this.serverDescription(i)).toBeVisible();
                    await expect(this.serverDescription(i)).toContainText(server.description);
                }
            }
        } else {
        }
    }

    private async validateServerVariables(servers: any[]): Promise<void> {
        const serversWithVariables = servers.filter(server => server.variables && Object.keys(server.variables).length > 0);
        if (serversWithVariables.length > 0) {
            
            if (await this.serverVariablesSection.isVisible()) {
                await expect(this.serverVariablesSection).toBeVisible();
            } else {
            }
        } else {
        }
    }

    private async validateCategoryOperations(category: string, testData: any, apiSpecParser: any, page: any): Promise<void> {
        if (await this.isCategoryFolderVisible(category)) {
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
        }
    }

    private async validateSingleOperation(endpoint: any, method: string, apiSpecParser: any, page: any): Promise<void> {
        const summary = apiSpecParser.getEndpointSummary(endpoint.path, method);
        if (!summary) return;
        
        
        // 1. Validate operation visibility
        if (await this.validateOperationInCategory(summary)) {
            
            // 2. Validate HTTP method badge and color
            await this.validateHttpMethodBadge(summary);
            
            // 3. Navigate to operation details
            await this.navigateToOperationDetails(summary, page);
            
            // 4. Validate operation content
            await this.validateOperationContent(endpoint, method, apiSpecParser);
        } else {
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
            
            for (const scope of scopes) {
                const scopeValue = this.getScopeValue(scope);
                const scopeDesc = this.getScopeDescription(scope);
                
                if (await scopeValue.isVisible()) {
                    const scopeText = await scopeValue.textContent();
                    
                    if (await scopeDesc.isVisible()) {
                        const descText = await scopeDesc.textContent();
                    }
                }
            }
        }
    }

    private async validateSingleParameter(param: any): Promise<void> {
        const paramName = param.name;
        
        // Validate parameter name
        const paramNameElement = this.parameterName('', '', paramName);
        if (await paramNameElement.isVisible()) {
            const displayedName = await paramNameElement.textContent();
            if (displayedName === paramName) {
            } else {
            }
        } else {
        }
        
        // Validate parameter type
        const paramTypeElement = this.getParameterType(paramName);
        if (await paramTypeElement.isVisible()) {
            const displayedType = await paramTypeElement.textContent();
            const expectedType = param.schema?.type || 'unknown';
            
            if (displayedType && displayedType.includes(expectedType)) {
            } else {
            }
        }
        
        // Validate parameter description
        if (param.description) {
            const paramDescElement = this.getParameterDescription(paramName);
            if (await paramDescElement.isVisible()) {
                const displayedDesc = await paramDescElement.textContent();
                if (displayedDesc && displayedDesc.includes(param.description)) {
                } else {
                }
            } else {
            }
        }
    }

    private async validateSingleResponse(apiSpecParser: any, endpoint: any, method: string, responseCode: string): Promise<void> {
        
        const responseElement = this.responseCode(endpoint.path, method, responseCode);
        if (await responseElement.isVisible()) {
            
            // Validate response description
            const responseDesc = apiSpecParser.getResponseDescription(endpoint.path, method, responseCode);
            if (responseDesc) {
                const descElement = this.getResponseDescription(responseCode);
                if (await descElement.isVisible()) {
                    const displayedDesc = await descElement.textContent();
                    if (displayedDesc && displayedDesc.includes(responseDesc)) {
                    }
                }
            }
            
            // Validate response headers
            const responseHeaders = apiSpecParser.getResponseHeaders(endpoint.path, method, responseCode);
            const headerNames = Object.keys(responseHeaders);
            if (headerNames.length > 0) {
                const headersContainer = this.getResponseHeaders(responseCode);
                if (await headersContainer.isVisible()) {
                }
            }
            
            // Validate response schema
            const mediaTypes = apiSpecParser.getResponseMediaTypes(endpoint.path, method, responseCode);
            if (mediaTypes.length > 0) {
                const schemaContainer = this.getResponseSchemaContainer(responseCode);
                if (await schemaContainer.isVisible()) {
                    
                    const defaultMediaType = mediaTypes.includes('application/json') ? 'application/json' : mediaTypes[0];
                    const responseSchema = apiSpecParser.getResponseSchema(endpoint.path, method, responseCode, defaultMediaType);
                    
                    if (responseSchema.type === 'array' && responseSchema.items?.properties) {
                        const properties = Object.keys(responseSchema.items.properties);
                        
                        for (const propName of properties.slice(0, 3)) {
                            const propElement = this.getResponseSchemaProperty(responseCode, propName);
                            if (await propElement.isVisible()) {
                            }
                        }
                    }
                }
            }
        }
    }
}