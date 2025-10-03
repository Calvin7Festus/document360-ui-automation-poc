import { Page, expect } from '@playwright/test';

/**
 * Interface for validation strategies
 */
export interface IValidationStrategy {
  validate(page: Page, data: any): Promise<boolean>;
  getStrategyName(): string;
}

/**
 * Validation context that uses different strategies
 */
export class ValidationContext {
  private strategy: IValidationStrategy;

  constructor(strategy: IValidationStrategy) {
    this.strategy = strategy;
  }

  /**
   * Set a new validation strategy
   */
  public setStrategy(strategy: IValidationStrategy): void {
    this.strategy = strategy;
  }

  /**
   * Execute validation using the current strategy
   */
  public async executeValidation(page: Page, data: any): Promise<boolean> {
    console.log(`🔍 Executing validation strategy: ${this.strategy.getStrategyName()}`);
    return await this.strategy.validate(page, data);
  }

  /**
   * Get the current strategy name
   */
  public getCurrentStrategyName(): string {
    return this.strategy.getStrategyName();
  }
}

/**
 * Strategy for validating API metadata (title, version, description, etc.)
 */
export class ApiMetadataValidationStrategy implements IValidationStrategy {
  async validate(page: Page, data: {
    title: string;
    version: string;
    description?: string;
    contact?: { name: string; email: string; url: string };
    license?: { name: string; url: string };
  }): Promise<boolean> {
    try {
      // Validate title
      await expect(page.getByText(data.title)).toBeVisible();
      console.log(`✅ Title validated: ${data.title}`);

      // Validate version
      await expect(page.getByText(data.version)).toBeVisible();
      console.log(`✅ Version validated: ${data.version}`);

      // Validate description if provided
      if (data.description) {
        await expect(page.getByText(data.description)).toBeVisible();
        console.log(`✅ Description validated`);
      }

      // Validate contact information if provided
      if (data.contact) {
        await expect(page.locator('em.contact-name')).toContainText(data.contact.name);
        await expect(page.locator('a.contact-email')).toContainText(data.contact.email);
        await expect(page.locator('a.contact-url')).toContainText(data.contact.url);
        console.log(`✅ Contact information validated`);
      }

      // Validate license information if provided
      if (data.license) {
        await expect(page.locator('em.license-name')).toContainText(data.license.name);
        await expect(page.locator('a.license-url')).toContainText(data.license.url);
        console.log(`✅ License information validated`);
      }

      return true;
    } catch (error) {
      console.error(`❌ API Metadata validation failed:`, error);
      return false;
    }
  }

  getStrategyName(): string {
    return 'API Metadata Validation';
  }
}

/**
 * Strategy for validating API endpoints
 */
export class ApiEndpointsValidationStrategy implements IValidationStrategy {
  async validate(page: Page, data: {
    endpoints: Array<{
      path: string;
      method: string;
      summary: string;
      description?: string;
    }>;
  }): Promise<boolean> {
    try {
      for (const endpoint of data.endpoints) {
        // Validate endpoint path is visible
        await expect(page.getByText(endpoint.path)).toBeVisible();
        console.log(`✅ Endpoint path validated: ${endpoint.path}`);

        // Validate method badge
        const methodBadge = page.locator(`span:has-text("${endpoint.method.toUpperCase()}")`);
        await expect(methodBadge).toBeVisible();
        console.log(`✅ Method badge validated: ${endpoint.method}`);

        // Validate summary
        await expect(page.getByText(endpoint.summary)).toBeVisible();
        console.log(`✅ Summary validated: ${endpoint.summary}`);

        // Validate description if provided
        if (endpoint.description) {
          await expect(page.getByText(endpoint.description)).toBeVisible();
          console.log(`✅ Description validated for ${endpoint.path}`);
        }
      }

      return true;
    } catch (error) {
      console.error(`❌ API Endpoints validation failed:`, error);
      return false;
    }
  }

  getStrategyName(): string {
    return 'API Endpoints Validation';
  }
}

/**
 * Strategy for validating API security schemes
 */
export class ApiSecurityValidationStrategy implements IValidationStrategy {
  async validate(page: Page, data: {
    securitySchemes: Array<{
      name: string;
      type: 'oauth2' | 'apiKey' | 'http';
      description?: string;
      flows?: any;
      in?: string;
    }>;
  }): Promise<boolean> {
    try {
      for (const scheme of data.securitySchemes) {
        // Validate security section is visible
        await expect(page.locator('text="Security"')).toBeVisible();
        console.log(`✅ Security section visible`);

        if (scheme.type === 'oauth2') {
          await expect(page.locator('.api-key-security-type:has-text("OAuth")')).toBeVisible();
          console.log(`✅ OAuth security type validated`);
        } else if (scheme.type === 'apiKey') {
          await expect(page.locator('.api-key-security-type:has-text("API Key")')).toBeVisible();
          console.log(`✅ API Key security type validated`);
        }

        if (scheme.description) {
          await expect(page.getByText(scheme.description)).toBeVisible();
          console.log(`✅ Security description validated: ${scheme.name}`);
        }
      }

      return true;
    } catch (error) {
      console.error(`❌ API Security validation failed:`, error);
      return false;
    }
  }

  getStrategyName(): string {
    return 'API Security Validation';
  }
}

/**
 * Strategy for validating API parameters
 */
export class ApiParametersValidationStrategy implements IValidationStrategy {
  async validate(page: Page, data: {
    parameters: Array<{
      name: string;
      type: string;
      description: string;
      required?: boolean;
      in: 'query' | 'path' | 'header' | 'body';
    }>;
  }): Promise<boolean> {
    try {
      for (const param of data.parameters) {
        // Validate parameter name
        const paramNameElement = page.locator(`.header-name b:has-text("${param.name}")`);
        await expect(paramNameElement).toBeVisible();
        console.log(`✅ Parameter name validated: ${param.name}`);

        // Validate parameter type
        const paramTypeElement = page.locator(`.header-name:has(b:has-text("${param.name}")) + .header-type`);
        await expect(paramTypeElement).toContainText(param.type);
        console.log(`✅ Parameter type validated: ${param.type}`);

        // Validate parameter description
        const paramDescElement = page.locator(`.header-name:has(b:has-text("${param.name}")) ~ .api-code-description p`);
        await expect(paramDescElement).toContainText(param.description);
        console.log(`✅ Parameter description validated: ${param.name}`);
      }

      return true;
    } catch (error) {
      console.error(`❌ API Parameters validation failed:`, error);
      return false;
    }
  }

  getStrategyName(): string {
    return 'API Parameters Validation';
  }
}

/**
 * Strategy for validating API responses
 */
export class ApiResponsesValidationStrategy implements IValidationStrategy {
  async validate(page: Page, data: {
    responses: Array<{
      code: string;
      description: string;
      headers?: Record<string, any>;
      schema?: any;
    }>;
  }): Promise<boolean> {
    try {
      for (const response of data.responses) {
        // Validate response code
        await expect(page.getByText(response.code)).toBeVisible();
        console.log(`✅ Response code validated: ${response.code}`);

        // Validate response description
        const responseDesc = page.locator(`.accordion-item:has(.api-code-title:has-text("${response.code}")) .description`);
        await expect(responseDesc).toContainText(response.description);
        console.log(`✅ Response description validated: ${response.code}`);

        // Validate headers if provided
        if (response.headers) {
          const headersContainer = page.locator(`.accordion-item:has(.api-code-title:has-text("${response.code}")) .header-container`);
          await expect(headersContainer).toBeVisible();
          console.log(`✅ Response headers validated: ${response.code}`);
        }
      }

      return true;
    } catch (error) {
      console.error(`❌ API Responses validation failed:`, error);
      return false;
    }
  }

  getStrategyName(): string {
    return 'API Responses Validation';
  }
}

/**
 * Factory for creating validation strategies
 */
export class ValidationStrategyFactory {
  /**
   * Create a validation strategy based on type
   */
  static createStrategy(type: 'metadata' | 'endpoints' | 'security' | 'parameters' | 'responses'): IValidationStrategy {
    switch (type) {
      case 'metadata':
        return new ApiMetadataValidationStrategy();
      case 'endpoints':
        return new ApiEndpointsValidationStrategy();
      case 'security':
        return new ApiSecurityValidationStrategy();
      case 'parameters':
        return new ApiParametersValidationStrategy();
      case 'responses':
        return new ApiResponsesValidationStrategy();
      default:
        throw new Error(`Unknown validation strategy type: ${type}`);
    }
  }

  /**
   * Get all available strategy types
   */
  static getAvailableStrategies(): string[] {
    return ['metadata', 'endpoints', 'security', 'parameters', 'responses'];
  }
}

/**
 * Composite validation strategy that runs multiple strategies
 */
export class CompositeValidationStrategy implements IValidationStrategy {
  private strategies: IValidationStrategy[] = [];

  /**
   * Add a strategy to the composite
   */
  public addStrategy(strategy: IValidationStrategy): void {
    this.strategies.push(strategy);
  }

  /**
   * Remove a strategy from the composite
   */
  public removeStrategy(strategy: IValidationStrategy): void {
    const index = this.strategies.indexOf(strategy);
    if (index > -1) {
      this.strategies.splice(index, 1);
    }
  }

  async validate(page: Page, data: any): Promise<boolean> {
    let allPassed = true;

    for (const strategy of this.strategies) {
      try {
        const result = await strategy.validate(page, data);
        if (!result) {
          allPassed = false;
          console.error(`❌ Strategy failed: ${strategy.getStrategyName()}`);
        }
      } catch (error) {
        allPassed = false;
        console.error(`❌ Strategy error in ${strategy.getStrategyName()}:`, error);
      }
    }

    return allPassed;
  }

  getStrategyName(): string {
    const strategyNames = this.strategies.map(s => s.getStrategyName());
    return `Composite Strategy [${strategyNames.join(', ')}]`;
  }

  /**
   * Get the number of strategies in the composite
   */
  public getStrategyCount(): number {
    return this.strategies.length;
  }
}
