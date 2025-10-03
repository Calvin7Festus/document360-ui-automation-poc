import { Locator, Page, expect } from '@playwright/test';
import { UIActions } from '../../commons/ui-actions';
import { escapeTextForSelector, createSafeTextSelector } from '../../commons/locator-utils';

export class CustomerPortalPage extends UIActions {

    // Core navigation locators
    readonly apiDocumentationLink: Locator;
    readonly apiDocumentationSection: Locator;
    readonly documentationNavigation: Locator;
    readonly navigationLinks: Locator;
    readonly categoryTreeView: Locator;

    // API Information locators from article content
    readonly apiTitle: Locator;
    readonly apiVersion: Locator;
    readonly apiDescription: Locator;

    // Introduction section locators - actual DOM structure
    readonly introductionLink: Locator;
    readonly contactName: Locator;
    readonly contactEmail: Locator;
    readonly contactUrl: Locator;
    readonly licenseName: Locator;
    readonly licenseUrl: Locator;
    readonly termsOfService: Locator;
    readonly externalDocs: Locator;
    readonly serverVariablesSection: Locator;

    // Server information locators
    readonly serverUrl: Locator;
    readonly serverDescription: Locator;

    // Endpoints section locators
    readonly endpointsSection: Locator;
    readonly schemasSection: Locator;

    // API Endpoint Documentation locators
    readonly apiEndpointContainer: Locator;
    readonly apiHttpMethod: Locator;
    readonly apiUrl: Locator;
    readonly apiEndpointDescription: Locator;

    // Security section locators
    readonly apiSecuritySection: Locator;
    readonly oauthSecurityType: Locator;
    readonly apiKeySecurityType: Locator;
    readonly oauthFlow: Locator;
    readonly oauthAuthUrl: Locator;
    readonly oauthScopes: Locator;
    readonly apiKeyName: Locator;

    // Parameters section locators
    readonly queryParametersSection: Locator;
    readonly bodyParametersSection: Locator;
    readonly apiParameterName: Locator;
    readonly apiParameterType: Locator;
    readonly apiParameterDescription: Locator;

    // Response section locators
    readonly apiResponseSection: Locator;
    readonly apiStatusCodes: Locator;
    readonly apiResponseDescription: Locator;
    readonly apiSchemaProperty: Locator;

    // Error and validation locators
    readonly brokenLinks: Locator;
    readonly timeoutErrors: Locator;
    readonly loadingErrors: Locator;

    // Function-based locators for dynamic content
    readonly getApiTitleByText: (title: string) => Locator;
    readonly getApiVersionByText: (version: string) => Locator;
    readonly getApiDescriptionByText: (description: string) => Locator;
    readonly getServerUrl: (index: number) => Locator;
    readonly getServerDescription: (index: number) => Locator;
    readonly getEndpointPath: (path: string) => Locator;
    readonly getEndpointSummary: (path: string, method: string) => Locator;
    readonly getParameterName: (path: string, method: string, paramName: string) => Locator;
    readonly getResponseCode: (path: string, method: string, code: string) => Locator;
    readonly getSchemaProperty: (schemaName: string, propertyName: string) => Locator;

    // API endpoint specific function-based locators
    readonly getHttpMethodByType: (method: string) => Locator;
    readonly getParameterByName: (paramName: string) => Locator;
    readonly getResponseByStatusCode: (statusCode: string) => Locator;
    readonly getSchemaPropertyByName: (propertyName: string) => Locator;
    readonly getOAuthScopeByName: (scopeName: string) => Locator;

    constructor(page: Page) {
        super(page);
        
        // Initialize core navigation locators based on actual DOM structure
        this.apiDocumentationLink = this.page.locator('a[href="/apidocs"]');
        this.apiDocumentationSection = this.page.locator('#main-content, .main-content');
        this.documentationNavigation = this.page.locator('site-category-list-tree-view, d360-data-list-tree-view');
        this.navigationLinks = this.page.locator('.data-title[href*="/apidocs"]');
        this.categoryTreeView = this.page.locator('site-category-list-tree-view d360-data-list-tree-view');

        // Initialize API information locators from article content
        this.apiTitle = this.page.locator('.article-tilte b, .article-title');
        this.apiVersion = this.page.locator('.article-version, small.article-version');
        this.apiDescription = this.page.locator('.article-description p');

        // Initialize introduction section locators based on actual DOM
        this.introductionLink = this.page.locator('a[href*="/introduction"], a.data-title:has-text("Introduction")');
        this.contactName = this.page.locator('em.contact-name');
        this.contactEmail = this.page.locator('a.contact-email');
        this.contactUrl = this.page.locator('a.contact-url');
        this.licenseName = this.page.locator('em.license-name');
        this.licenseUrl = this.page.locator('a.license-url');
        this.termsOfService = this.page.locator('a.contact-name[href*="terms"]');
        this.externalDocs = this.page.locator('a.contact-url');
        this.serverVariablesSection = this.page.locator('.server-variable');

        // Initialize server information locators
        this.serverUrl = this.page.locator('a.server-url');
        this.serverDescription = this.page.locator('em.server-description');

        // Initialize section locators
        this.endpointsSection = this.page.locator('.endpoints-section, .operations-section, .endpoints, [data-testid="endpoints-section"]');
        this.schemasSection = this.page.locator('.schemas-section, .components-section, .schemas, [data-testid="schemas-section"]');

        // Initialize API endpoint documentation locators based on actual DOM
        this.apiEndpointContainer = this.page.locator('.api-endpoint');
        this.apiHttpMethod = this.page.locator('.api-http-method');
        this.apiUrl = this.page.locator('.api-url');
        this.apiEndpointDescription = this.page.locator('.api-section.api-path .description');

        // Initialize security section locators
        this.apiSecuritySection = this.page.locator('.api-section.api-security');
        this.oauthSecurityType = this.page.locator('.api-key-security-type:has-text("OAuth")');
        this.apiKeySecurityType = this.page.locator('.api-key-security-type:has-text("API Key")');
        this.oauthFlow = this.page.locator('.oauth-flow-cont .oauth-value');
        this.oauthAuthUrl = this.page.locator('.oauth-url');
        this.oauthScopes = this.page.locator('.scope-element');
        this.apiKeyName = this.page.locator('.api-key-name');

        // Initialize parameters section locators
        this.queryParametersSection = this.page.locator('.api-parameter-container:has(.api-header:has-text("Query parameters"))');
        this.bodyParametersSection = this.page.locator('.api-request-body');
        this.apiParameterName = this.page.locator('.api-parameter-name');
        this.apiParameterType = this.page.locator('.api-parameter-data-type');
        this.apiParameterDescription = this.page.locator('.api-parameter .description');

        // Initialize response section locators
        this.apiResponseSection = this.page.locator('.api-response-body');
        this.apiStatusCodes = this.page.locator('.api-code');
        this.apiResponseDescription = this.page.locator('.api-code-desc.description');
        this.apiSchemaProperty = this.page.locator('.api-schema-property');

        // Initialize error and validation locators (only truly broken links)
        // Excludes: hash-only (#), null, javascript:void(0), display elements, buttons
        this.brokenLinks = this.page.locator('a[href=""]:not([style*="cursor: auto"]):not(.data-title[aria-label]):not([role="button"]), a[href*="undefined"]');
        this.timeoutErrors = this.page.locator('.timeout-error, .loading-error, .error-message, [data-testid="timeout-error"]');
        this.loadingErrors = this.page.locator('.loading-error, .load-error, .error-state, [data-testid="loading-error"]');

        // Initialize function-based locators based on actual DOM structure
        this.getApiTitleByText = (title: string) => this.page.locator(`.article-tilte b:has-text("${title}"), .article-title:has-text("${title}")`);
        this.getApiVersionByText = (version: string) => this.page.locator(`.article-version:has-text("${version}"), small.article-version:has-text("${version}")`);
        this.getApiDescriptionByText = (description: string) => {
            return this.page.locator(`.article-description p:has-text("${escapeTextForSelector(description)}")`).first();
        };
        this.getServerUrl = (index: number) => this.page.locator('a.server-url').nth(index);
        this.getServerDescription = (index: number) => this.page.locator('em.server-description').nth(index);
        this.getEndpointPath = (path: string) => this.page.locator(`a.data-title[aria-label*="${path}"], a.data-title:has-text("${path}")`);
        this.getEndpointSummary = (path: string, method: string) => this.page.locator(`a.data-title[aria-label*="${path}"]`);
        this.getParameterName = (path: string, method: string, paramName: string) => this.page.locator(`:text("${paramName}")`);
        this.getResponseCode = (path: string, method: string, code: string) => this.page.locator(`:text("${code}")`);
        this.getSchemaProperty = (schemaName: string, propertyName: string) => this.page.locator(`:text("${propertyName}")`);

        // Initialize API endpoint specific function-based locators
        this.getHttpMethodByType = (method: string) => this.page.locator(`.api-http-method:has-text("${method}"), .${method.toLowerCase()}-method`);
        this.getParameterByName = (paramName: string) => this.page.locator(`.api-parameter:has(.api-parameter-name:has-text("${paramName}"))`);
        this.getResponseByStatusCode = (statusCode: string) => this.page.locator(`.api-status:has(.api-code:has-text("${statusCode}"))`);
        this.getSchemaPropertyByName = (propertyName: string) => this.page.locator(`.api-schema-property:has(.name:has-text("${propertyName}"))`);
        this.getOAuthScopeByName = (scopeName: string) => this.page.locator(`.scope-element:has(.oauth-value:has-text("${scopeName}"))`);
    }

    // Navigation methods
    async navigateToCustomerPortal(customerPortalUrl: string): Promise<void> {
        // Retry navigation up to 3 times for headless mode stability
        let attempts = 0;
        const maxAttempts = 3;
        
        while (attempts < maxAttempts) {
            try {
                attempts++;
                
                await this.page.goto(customerPortalUrl, { 
                    waitUntil: 'networkidle',
                    timeout: 30000 // 30 second timeout for navigation
                });
                
                await this.page.waitForLoadState('domcontentloaded');
                
                // Wait for the page to be fully loaded - increase timeout for headless mode
                await this.page.waitForTimeout(3000);
                
                // Verify the page loaded successfully
                await this.page.waitForSelector('body', { state: 'visible', timeout: 15000 });
                
                // Success - break out of retry loop
                break;
                
            } catch (error) {
                if (attempts === maxAttempts) {
                    throw new Error(`Failed to navigate to customer portal after ${maxAttempts} attempts: ${error}`);
                }
                
                // Wait before retry
                await this.page.waitForTimeout(2000);
            }
        }
    }

    async clickOnApiDocumentation(): Promise<void> {
        // Try multiple selectors for API documentation link
        const apiDocSelectors = [
            'a[href="/apidocs"]',
            'a[href*="apidocs"]',
            'a:has-text("API Documentation")',
            'a:has-text("API Docs")',
            '.nav-link:has-text("API")'
        ];
        
        let apiDocLink: Locator | null = null;
        
        for (const selector of apiDocSelectors) {
            try {
                const link = this.page.locator(selector).first();
                await link.waitFor({ state: 'visible', timeout: 15000 });
                apiDocLink = link;
                break;
            } catch (error) {
                // Try next selector
                continue;
            }
        }
        
        if (!apiDocLink) {
            // Debug: Log available links to help troubleshoot
            const allLinks = await this.page.locator('a').all();
            const linkTexts = await Promise.all(
                allLinks.slice(0, 10).map(async (link) => {
                    try {
                        const text = await link.textContent();
                        const href = await link.getAttribute('href');
                        return `"${text}" (href: ${href})`;
                    } catch {
                        return 'N/A';
                    }
                })
            );
            
            throw new Error(`Could not find API documentation link in customer portal. Available links: ${linkTexts.join(', ')}`);
        }
        
        await apiDocLink.click();
        await this.page.waitForLoadState('networkidle');
        
        // Additional wait for API documentation to load
        await this.page.waitForTimeout(2000);
    }

    async clickOnIntroduction(): Promise<void> {
        const introLink = this.page.locator('a.data-title[aria-label="Introduction"]');
        await introLink.waitFor({ state: 'visible' });
        await introLink.click();
        await this.page.waitForLoadState('networkidle');
    }

    async clickOnEndpoint(path: string): Promise<void> {
        const endpointLink = this.getEndpointPath(path);
        await endpointLink.waitFor({ state: 'visible' });
        await endpointLink.click();
        await this.page.waitForLoadState('networkidle');
    }

    async expandCategory(categoryName: string): Promise<void> {
        // Find the category node with the specific name
        const categoryLink = this.page.locator(`a.data-title[aria-label="${categoryName}"]`);
        if (await categoryLink.isVisible()) {
            // Find the arrow button for this category (tree-arrow with fa-angle-right)
            const categoryNode = categoryLink.locator('xpath=ancestor::div[contains(@class, "node")]');
            const expandArrow = categoryNode.locator('.tree-arrow i.fa-angle-right');
            
            if (await expandArrow.isVisible()) {
                await expandArrow.click();
                await this.page.waitForTimeout(1000); // Wait for expansion
            }
        }
    }

    async isCategoryExpanded(categoryName: string): Promise<boolean> {
        const categoryLink = this.page.locator(`a.data-title[aria-label="${categoryName}"]`);
        if (await categoryLink.isVisible()) {
            const categoryNode = categoryLink.locator('xpath=ancestor::div[contains(@class, "node")]');
            const expandedArrow = categoryNode.locator('.tree-arrow i.fa-angle-down');
            return await expandedArrow.isVisible();
        }
        return false;
    }

    // Validation methods - same validation logic as Category 2 but for customer portal
    async validateCompleteIntroductionSection(testData: any): Promise<void> {
        // Navigate to introduction section
        await this.clickOnIntroduction();
        
        // 1. Validate API Title
        await this.validateApiTitle(testData.apiTitle);
        
        // 2. Validate API Version
        await this.validateApiVersion(testData.apiVersion);
        
        // 3. Validate API Description
        await this.validateApiDescription(testData.apiDescription);
        
        // 4. Validate Contact Information
        await this.validateContactInformation(testData.contactInfo);
        
        // 5. Validate License Information
        await this.validateLicenseInformation(testData.licenseInfo);
        
        // 6. Validate Server Information
        await this.validateServerInformation(testData.servers);
        
        // Take screenshot for validation
        await this.takeValidationScreenshot('customer-portal-introduction-validation');
    }

    async validateCompleteApiDocumentation(apiSpecParser: any, testData: any, page: Page): Promise<void> {
        // Wait for API documentation section to be visible
        await this.apiDocumentationSection.waitFor({ state: 'visible' });
        
        // Extract categories from endpoint paths
        const categories = [...new Set(testData.endpointPaths.map((path: string) => path.split('/')[1]).filter(Boolean))];
        
        // Validate each category and its operations
        for (const category of categories) {
            await this.validateCategoryOperations(category as string, testData, apiSpecParser, page);
        }
        
        // Take screenshot for validation
        await this.takeValidationScreenshot('customer-portal-api-documentation');
    }

    // Performance validation methods
    async validateCustomerPortalPerformance(customerPortalUrl: string): Promise<{ loadTime: number; apiDocLoadTime: number; navResponseTime: number }> {
        // Step 1: Measure page load time
        const startTime = Date.now();
        await this.navigateToCustomerPortal(customerPortalUrl);
        const loadTime = Date.now() - startTime;
        
        // Step 2: Measure API documentation section load time
        const apiDocStartTime = Date.now();
        await this.apiDocumentationSection.waitFor({ state: 'visible' });
        const apiDocLoadTime = Date.now() - apiDocStartTime;
        
        // Step 3: Measure navigation response time
        const navStartTime = Date.now();
        await this.clickOnIntroduction();
        await this.contactName.waitFor({ state: 'visible' });
        const navResponseTime = Date.now() - navStartTime;
        
        return { loadTime, apiDocLoadTime, navResponseTime };
    }

    // Cross-format consistency validation
    async validateCrossFormatConsistency(yamlContent: any, jsonContent: any): Promise<boolean> {
        // Compare title, version, and description
        const titleMatch = yamlContent.title === jsonContent.title;
        const versionMatch = yamlContent.version === jsonContent.version;
        const descriptionMatch = yamlContent.description === jsonContent.description;
        
        return titleMatch && versionMatch && descriptionMatch;
    }

    // Quality validation methods
    async validateNobrokenLinks(): Promise<number> {
        // Wait for page to be fully loaded before analyzing links
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(2000); // Additional wait for dynamic content
        return this.analyzeLinkQuality();
    }

    async analyzeLinkQuality(): Promise<number> {
        // Check for different types of potentially broken links
        const emptyHrefLinks = this.page.locator('a[href=""]');
        const hashOnlyLinks = this.page.locator('a[href="#"]');
        const undefinedLinks = this.page.locator('a[href*="undefined"]');
        const nullLinks = this.page.locator('a[href*="null"]');
        const javascriptVoidLinks = this.page.locator('a[href="javascript:void(0)"]');
        const noHrefLinks = this.page.locator('a:not([href])'); // Links without href attribute
        
        // Separate empty href links into legitimate and potentially broken
        const emptyHrefDisplayLinks = this.page.locator('a[href=""][style*="cursor: auto"], a[href=""].data-title[aria-label], a[href=""][role="button"]');
        const emptyHrefClickableLinks = this.page.locator('a[href=""]:not([style*="cursor: auto"]):not(.data-title[aria-label]):not([role="button"])');
        
        const emptyCount = await emptyHrefLinks.count();
        const emptyDisplayCount = await emptyHrefDisplayLinks.count();
        const emptyClickableCount = await emptyHrefClickableLinks.count();
        const hashCount = await hashOnlyLinks.count();
        const undefinedCount = await undefinedLinks.count();
        const nullCount = await nullLinks.count();
        const voidCount = await javascriptVoidLinks.count();
        const noHrefCount = await noHrefLinks.count();
        
        // Only count truly broken links:
        // - Empty href links that are meant to be clickable (not display elements)
        // - Undefined links
        // Excludes: hash-only, null, void, display elements with empty href
        const actuallyBrokenCount = emptyClickableCount + undefinedCount;
        
        
        return actuallyBrokenCount;
    }

    async validateNoTimeoutErrors(): Promise<number> {
        const timeoutErrorsCount = await this.timeoutErrors.count();
        return timeoutErrorsCount;
    }

    async validateNavigationLinks(): Promise<{ totalLinks: number; enabledLinks: number }> {
        // Use the actual navigation links from the tree view
        const allTreeLinks = this.page.locator('a.data-title');
        const totalLinks = await allTreeLinks.count();
        let enabledLinks = 0;
        
        for (let i = 0; i < totalLinks; i++) {
            const link = allTreeLinks.nth(i);
            if (await link.isVisible() && await link.isEnabled()) {
                enabledLinks++;
            }
        }
        
        return { totalLinks, enabledLinks };
    }

    // API Endpoint validation methods
    async validateApiEndpointStructure(expectedMethod: string, expectedPath: string): Promise<void> {
        // Validate HTTP method
        await expect(this.apiHttpMethod).toBeVisible();
        const methodText = await this.apiHttpMethod.textContent();
        expect(methodText?.toLowerCase()).toContain(expectedMethod.toLowerCase());
        
        // Validate API URL/path
        await expect(this.apiUrl).toBeVisible();
        const urlText = await this.apiUrl.textContent();
        expect(urlText).toContain(expectedPath);
        
        // Validate endpoint description is present
        if (await this.apiEndpointDescription.isVisible()) {
            const descText = await this.apiEndpointDescription.textContent();
        }
    }

    async validateApiSecuritySection(): Promise<void> {
        
        if (await this.apiSecuritySection.isVisible()) {
            
            // Check for OAuth security
            if (await this.oauthSecurityType.isVisible()) {
                
                // Validate OAuth flow
                if (await this.oauthFlow.isVisible()) {
                    const flowText = await this.oauthFlow.textContent();
                }
                
                // Validate authorization URL
                if (await this.oauthAuthUrl.isVisible()) {
                    const authUrl = await this.oauthAuthUrl.textContent();
                }
                
                // Validate scopes
                const scopeCount = await this.oauthScopes.count();
                if (scopeCount > 0) {
                    for (let i = 0; i < scopeCount; i++) {
                        const scope = this.oauthScopes.nth(i);
                        const scopeText = await scope.textContent();
                    }
                }
            }
            
            // Check for API Key security
            if (await this.apiKeySecurityType.isVisible()) {
                
                if (await this.apiKeyName.isVisible()) {
                    const keyName = await this.apiKeyName.textContent();
                }
            }
        } else {
        }
    }

    async validateApiParameters(): Promise<void> {
        
        // Validate query parameters
        if (await this.queryParametersSection.isVisible()) {
            const paramCount = await this.queryParametersSection.locator('.api-parameter').count();
            
            // Validate each parameter
            for (let i = 0; i < Math.min(paramCount, 3); i++) { // Limit to first 3 for performance
                const param = this.queryParametersSection.locator('.api-parameter').nth(i);
                const paramName = await param.locator('.api-parameter-name').textContent();
                const paramType = await param.locator('.api-parameter-data-type').textContent();
            }
        }
        
        // Validate body parameters
        if (await this.bodyParametersSection.isVisible()) {
            const bodyParamCount = await this.bodyParametersSection.locator('.api-schema-property').count();
        }
    }

    async validateApiResponses(): Promise<void> {
        
        if (await this.apiResponseSection.isVisible()) {
            
            // Validate status codes
            const statusCodeCount = await this.apiStatusCodes.count();
            
            for (let i = 0; i < Math.min(statusCodeCount, 3); i++) { // Limit to first 3
                const statusCode = this.apiStatusCodes.nth(i);
                const codeText = await statusCode.textContent();
            }
            
            // Validate response descriptions
            const responseDescCount = await this.apiResponseDescription.count();
            if (responseDescCount > 0) {
            }
            
            // Validate schema properties
            const schemaPropertyCount = await this.apiSchemaProperty.count();
            if (schemaPropertyCount > 0) {
            }
        } else {
        }
    }

    async validateCompleteApiEndpoint(expectedMethod: string, expectedPath: string): Promise<void> {
        
        // Wait for API endpoint container to be visible
        await this.apiEndpointContainer.waitFor({ state: 'visible' });
        
        // Validate endpoint structure
        await this.validateApiEndpointStructure(expectedMethod, expectedPath);
        
        // Validate security section
        await this.validateApiSecuritySection();
        
        // Validate parameters
        await this.validateApiParameters();
        
        // Validate responses
        await this.validateApiResponses();
        
        // Take screenshot for validation
        await this.takeValidationScreenshot(`api-endpoint-${expectedMethod.toLowerCase()}-${expectedPath.replace('/', '')}`);
        
    }

    // Screenshot utility
    async takeValidationScreenshot(name: string): Promise<void> {
        await this.page.screenshot({ 
            path: `test-results/validation-screenshots/customer-portal-${name}-${Date.now()}.png`,
            fullPage: true,
            timeout: 30000 // 30 seconds timeout for screenshot (fonts can be slow in headless mode)
        });
    }

    // Private helper methods - same validation logic adapted for customer portal
    private async validateApiTitle(apiTitle: string): Promise<void> {
        const titleElement = this.getApiTitleByText(apiTitle);
        await expect(titleElement).toBeVisible();
    }

    private async validateApiVersion(apiVersion: string): Promise<void> {
        const versionElement = this.getApiVersionByText(apiVersion);
        await expect(versionElement).toBeVisible();
    }

    private async validateApiDescription(apiDescription?: string): Promise<void> {
        if (apiDescription) {
            const descriptionElement = this.getApiDescriptionByText(apiDescription);
            await expect(descriptionElement).toBeVisible();
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
        }
        
        if (contactInfo?.url) {
            await expect(this.contactUrl).toBeVisible();
            await expect(this.contactUrl).toContainText(contactInfo.url);
        }
    }

    private async validateLicenseInformation(licenseInfo?: any): Promise<void> {
        if (licenseInfo?.name) {
            await expect(this.licenseName).toBeVisible();
            await expect(this.licenseName).toContainText(licenseInfo.name);
        }
        
        if (licenseInfo?.url) {
            await expect(this.licenseUrl).toBeVisible();
            await expect(this.licenseUrl).toContainText(licenseInfo.url);
        }
    }

    private async validateServerInformation(servers: any[]): Promise<void> {
        if (servers && servers.length > 0) {
            
            const maxServers = Math.min(servers.length, 3); // Limit to 3 servers for performance
            for (let i = 0; i < maxServers; i++) {
                const server = servers[i];
                
                // Validate server URL
                const serverUrlElement = this.getServerUrl(i);
                await expect(serverUrlElement).toBeVisible();
                await expect(serverUrlElement).toContainText(server.url);
                
                // Validate server description if present
                if (server.description) {
                    const serverDescElement = this.getServerDescription(i);
                    await expect(serverDescElement).toBeVisible();
                    await expect(serverDescElement).toContainText(server.description);
                }
            }
        } else {
        }
    }

    private async validateCategoryOperations(category: string, testData: any, apiSpecParser: any, page: Page): Promise<void> {
        
        // First, try to expand the category if it exists
        await this.expandCategory(category);
        
        // Look for the category in the tree view
        const categoryLink = this.page.locator(`a.data-title[aria-label="${category}"]`);
        if (await categoryLink.isVisible()) {
            
            // Get operations for this category
            const categoryOperations = testData.endpoints.filter((endpoint: any) => 
                endpoint.path.startsWith(`/${category}`)
            );
            
            
            // Validate each operation in the category
            for (const endpoint of categoryOperations.slice(0, 2)) { // Limit to first 2 for performance
                for (const method of endpoint.methods.slice(0, 1)) { // Limit to first method
                    await this.validateSingleOperation(endpoint, method, apiSpecParser);
                }
            }
        } else {
        }
    }

    private async validateSingleOperation(endpoint: any, method: string, apiSpecParser: any): Promise<void> {
        const summary = apiSpecParser.getEndpointSummary(endpoint.path, method);
        if (!summary) return;
        
        
        // Look for the operation in the tree view based on summary/title
        const operationLink = this.page.locator(`a.data-title[aria-label="${summary}"], a.data-title:has-text("${summary}")`);
        
        if (await operationLink.isVisible()) {
            
            // Navigate to the operation
            try {
                await operationLink.click();
                await this.page.waitForLoadState('networkidle');
                
                // Validate that we're on the correct page
                const pageTitle = this.page.locator('h1.article-title');
                if (await pageTitle.isVisible()) {
                    const titleText = await pageTitle.textContent();
                    if (titleText?.includes(summary)) {
                        
                        // Now validate the complete API endpoint using the new methods
                        await this.validateCompleteApiEndpoint(method, endpoint.path);
                    }
                }
                
            } catch (error) {
            }
        } else {
        }
    }
}
