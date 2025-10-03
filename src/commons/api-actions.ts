import { Page, APIRequestContext, APIResponse } from '@playwright/test';
import { loggers } from '../utils/logging/logger-factory';
import { ConfigManager } from '../utils/config/config-manager';

/**
 * Base class for all API interactions
 * Provides common functionality for API requests, authentication, error handling, etc.
 * Similar to ui-actions.ts but for API operations
 */
export abstract class ApiActions {
  protected page: Page;
  protected request: APIRequestContext;
  protected configManager: ConfigManager;
  protected baseUrl: string;
  protected authToken: string = '';

  constructor(page: Page) {
    this.page = page;
    this.request = page.request;
    this.configManager = ConfigManager.getInstance();
    this.baseUrl = this.configManager.get<string>('API_BASE_URL');
  }

  /**
   * Set authentication token for API requests
   */
  setAuthToken(token: string): void {
    this.authToken = token;
    loggers.api.debug(`🔑 Auth token set for ${this.constructor.name}`);
  }

  /**
   * Get authentication token
   */
  getAuthToken(): string {
    return this.authToken || (globalThis as any).__capturedAuthToken || '';
  }

  /**
   * Get common headers for API requests
   */
  protected getCommonHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
    const token = this.getAuthToken();
    const headers: Record<string, string> = {
      'accept': 'application/json, text/plain, */*',
      'accept-language': 'en-US,en;q=0.9',
      'content-type': 'application/json',
      'origin': 'https://portal.document360.io',
      'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
      ...additionalHeaders
    };

    if (token) {
      headers['authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Make a GET request with common error handling
   */
  protected async get(
    endpoint: string, 
    options: {
      headers?: Record<string, string>;
      params?: Record<string, string>;
    } = {}
  ): Promise<APIResponse> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.getCommonHeaders(options.headers);

    loggers.api.debug(`📤 GET ${url}`);

    try {
      const response = await this.request.get(url, {
        headers,
        params: options.params
      });

      loggers.api.debug(`📥 GET ${url} - Status: ${response.status()}`);
      return response;
    } catch (error) {
      loggers.api.error(`❌ GET ${url} failed:`, error);
      throw error;
    }
  }

  /**
   * Make a POST request with common error handling
   */
  protected async post(
    endpoint: string,
    data: any,
    options: {
      headers?: Record<string, string>;
      contentType?: string;
    } = {}
  ): Promise<APIResponse> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.getCommonHeaders(options.headers);

    if (options.contentType) {
      headers['content-type'] = options.contentType;
    }

    loggers.api.debug(`📤 POST ${url}`);

    try {
      const response = await this.request.post(url, {
        headers,
        data
      });

      loggers.api.debug(`📥 POST ${url} - Status: ${response.status()}`);
      return response;
    } catch (error) {
      loggers.api.error(`❌ POST ${url} failed:`, error);
      throw error;
    }
  }

  /**
   * Make a PUT request with common error handling
   */
  protected async put(
    endpoint: string,
    data: any,
    options: {
      headers?: Record<string, string>;
      contentType?: string;
    } = {}
  ): Promise<APIResponse> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.getCommonHeaders(options.headers);

    if (options.contentType) {
      headers['content-type'] = options.contentType;
    }

    loggers.api.debug(`📤 PUT ${url}`);

    try {
      const response = await this.request.put(url, {
        headers,
        data
      });

      loggers.api.debug(`📥 PUT ${url} - Status: ${response.status()}`);
      return response;
    } catch (error) {
      loggers.api.error(`❌ PUT ${url} failed:`, error);
      throw error;
    }
  }

  /**
   * Make a DELETE request with common error handling
   */
  protected async delete(
    endpoint: string,
    options: {
      headers?: Record<string, string>;
    } = {}
  ): Promise<APIResponse> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.getCommonHeaders(options.headers);

    loggers.api.debug(`📤 DELETE ${url}`);

    try {
      const response = await this.request.delete(url, {
        headers
      });

      loggers.api.debug(`📥 DELETE ${url} - Status: ${response.status()}`);
      return response;
    } catch (error) {
      loggers.api.error(`❌ DELETE ${url} failed:`, error);
      throw error;
    }
  }

  /**
   * Upload file with multipart/form-data
   */
  protected async uploadFile(
    endpoint: string,
    filePath: string,
    fileName: string,
    fileBuffer: Buffer,
    additionalFormData: Record<string, string> = {},
    options: {
      headers?: Record<string, string>;
      contentType?: string;
    } = {}
  ): Promise<APIResponse> {
    const url = `${this.baseUrl}${endpoint}`;
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    
    const headers = this.getCommonHeaders({
      'content-type': `multipart/form-data; boundary=${boundary}`,
      ...options.headers
    });

    const formData = this.createMultipartFormData(boundary, fileName, fileBuffer, additionalFormData, options.contentType);

    loggers.api.debug(`📤 UPLOAD ${url} - File: ${fileName}`);

    try {
      const response = await this.request.post(url, {
        headers,
        data: formData
      });

      loggers.api.debug(`📥 UPLOAD ${url} - Status: ${response.status()}`);
      return response;
    } catch (error) {
      loggers.api.error(`❌ UPLOAD ${url} failed:`, error);
      throw error;
    }
  }

  /**
   * Create multipart form data
   */
  private createMultipartFormData(
    boundary: string,
    fileName: string,
    fileBuffer: Buffer,
    additionalFormData: Record<string, string> = {},
    contentType: string = 'application/octet-stream'
  ): Buffer {
    const CRLF = '\r\n';
    let formData = '';

    // Add additional form fields
    for (const [key, value] of Object.entries(additionalFormData)) {
      formData += `--${boundary}${CRLF}`;
      formData += `Content-Disposition: form-data; name="${key}"${CRLF}${CRLF}`;
      formData += value;
      formData += `${CRLF}`;
    }

    // Add file part
    formData += `--${boundary}${CRLF}`;
    formData += `Content-Disposition: form-data; name="specFile"; filename="${fileName}"${CRLF}`;
    formData += `Content-Type: ${contentType}${CRLF}${CRLF}`;
    formData += fileBuffer.toString('binary');
    formData += `${CRLF}`;

    // End boundary
    formData += `--${boundary}--${CRLF}`;

    return Buffer.from(formData, 'binary');
  }

  /**
   * Handle API response with common error checking
   */
  protected async handleResponse<T>(response: APIResponse, operation: string): Promise<T> {
    if (!response.ok()) {
      const errorText = await response.text();
      const error = new Error(`${operation} failed: ${response.status()} - ${errorText}`);
      loggers.api.error(`❌ ${operation} failed:`, error);
      throw error;
    }

    try {
      const data = await response.json();
      
      if (data.success === false) {
        const errorMessage = data.errors?.join(', ') || 'Unknown API error';
        const error = new Error(`${operation} failed: ${errorMessage}`);
        loggers.api.error(`❌ ${operation} failed:`, error);
        throw error;
      }

      loggers.api.debug(`✅ ${operation} successful`);
      return data;
    } catch (parseError) {
      if (parseError instanceof Error && parseError.message.includes('failed:')) {
        throw parseError; // Re-throw our custom errors
      }
      
      loggers.api.error(`❌ Failed to parse ${operation} response:`, parseError);
      throw new Error(`Failed to parse ${operation} response`);
    }
  }

  /**
   * Wait for a condition with timeout
   */
  protected async waitFor(
    condition: () => Promise<boolean>,
    timeoutMs: number = 30000,
    intervalMs: number = 1000,
    description: string = 'condition'
  ): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      if (await condition()) {
        loggers.api.debug(`✅ ${description} met`);
        return;
      }
      
      await this.page.waitForTimeout(intervalMs);
    }
    
    throw new Error(`Timeout waiting for ${description} after ${timeoutMs}ms`);
  }

  /**
   * Retry an operation with exponential backoff
   */
  protected async retry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelayMs: number = 1000,
    description: string = 'operation'
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        if (attempt > 1) {
          loggers.api.info(`✅ ${description} succeeded on attempt ${attempt}`);
        }
        return result;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          loggers.api.error(`❌ ${description} failed after ${maxRetries} attempts:`, lastError);
          throw lastError;
        }
        
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        loggers.api.warn(`⚠️ ${description} failed on attempt ${attempt}, retrying in ${delay}ms:`, error);
        await this.page.waitForTimeout(delay);
      }
    }
    
    throw lastError!;
  }

  /**
   * Setup authentication token interceptor to capture access token from login API
   */
  public async setupAuthInterceptor(): Promise<void> {
    // Intercept the exact authentication API call
    await this.page.route('https://identity.document360.io/connect/token', async (route) => {
      const response = await route.fetch();
      const responseText = await response.text();
      
      try {
        const authData = JSON.parse(responseText);
        
        if (authData.access_token) {
          const accessToken = authData.access_token;
          
          // Store globally for all API classes to use
          (globalThis as any).__capturedAuthToken = accessToken;
          this.setAuthToken(accessToken);
          
          loggers.api.info('🔑 Access token captured from authentication API');
          loggers.api.debug(`Token expires in: ${authData.expires_in} seconds`);
        }
      } catch (error) {
        loggers.api.debug('Error parsing auth response:', error);
      }
      
      // Continue with the original response
      await route.fulfill({ response });
    });
  }

  /**
   * Wait for authentication token to be available from intercepted API call
   */
  public async waitForAuthToken(timeoutMs: number = 15000): Promise<string | null> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      // Check if token is available in global state (from intercepted API)
      const globalToken = (globalThis as any).__capturedAuthToken;
      if (globalToken && globalToken.length > 10) {
        this.setAuthToken(globalToken);
        loggers.api.debug('🔑 Auth token available from intercepted API');
        return globalToken;
      }
      
      // Wait before next check
      await this.page.waitForTimeout(500);
    }
    
    loggers.api.warn(`⚠️ Auth token not captured within ${timeoutMs}ms`);
    return null;
  }

  /**
   * Get project information from global state, URL, or environment
   */
  protected getProjectInfo(): { projectId: string; projectVersionId: string } | null {
    // First try global state (from interceptors)
    const capturedInfo = (globalThis as any).__capturedProjectInfo;
    if (capturedInfo) {
      return capturedInfo;
    }

    // Fallback: Extract from current page URL
    try {
      const currentUrl = this.page.url();
      const projectIdMatch = currentUrl.match(/\/([a-f0-9-]{36})\//);
      
      if (projectIdMatch) {
        const projectId = projectIdMatch[1];
        // Use a default project version ID (this should be captured later by interceptors)
        const projectVersionId = 'e5cfdc47-43fe-42ac-b3ab-372dae118da5'; // Default from your curl command
        
        loggers.api.debug(`📋 Project info extracted from URL: ${projectId}`);
        return { projectId, projectVersionId };
      }
    } catch (error) {
      loggers.api.debug('Failed to extract project info from URL:', error);
    }

    // Final fallback: Use ConfigManager (which reads from .env)
    const projectId = this.configManager.get<string>('PROJECT_ID');
    const projectVersionId = this.configManager.get<string>('PROJECT_VERSION_ID');
    
    loggers.api.debug(`📋 Using fallback project info from config: ${projectId}`);
    return {
      projectId,
      projectVersionId
    };
  }

  /**
   * Validate required project information
   */
  protected validateProjectInfo(): { projectId: string; projectVersionId: string } {
    const projectInfo = this.getProjectInfo();
    
    if (!projectInfo?.projectId) {
      throw new Error('Project ID is required but not available');
    }
    
    if (!projectInfo?.projectVersionId) {
      throw new Error('Project version ID is required but not available');
    }
    
    return projectInfo;
  }

  /**
   * Get file MIME type from extension
   */
  protected getFileMimeType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    switch (ext) {
      case 'json': return 'application/json';
      case 'yaml':
      case 'yml': return 'application/x-yaml';
      case 'xml': return 'application/xml';
      case 'txt': return 'text/plain';
      default: return 'application/octet-stream';
    }
  }
}
