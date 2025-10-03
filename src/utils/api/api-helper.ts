import { Page } from '@playwright/test';
import { ConfigManager } from '../config/config-manager';
import { ApiResponseObserver, ApiCreationObserver, IApiResponseObserver } from './api-response-observer';
import { loggers } from '../logging/logger-factory';

export class ApiHelper {
  private page: Page;
  private config: ConfigManager;
  private responseObserver: ApiResponseObserver;
  private creationObserver: ApiCreationObserver;
  private cleanupInProgress: boolean = false; // Prevent duplicate cleanup

  private static globalApiDefinitionIds: string[] = [];
  private static globalProjectDocumentVersionId: string = '';
  private static globalAuthToken: string = '';
  private static cleanupCompleted: boolean = false; // Global cleanup state

  constructor(page: Page) {
    this.page = page;
    this.config = ConfigManager.getInstance();
    this.responseObserver = new ApiResponseObserver(page);
    this.creationObserver = new ApiCreationObserver();
    this.responseObserver.addObserver(this.creationObserver);
  }

  /**
   * Track API definition and version for cleanup
   */
  static trackApiDefinition(apiDefinitionId: string, projectDocumentVersionId: string): void {
    if (!ApiHelper.globalApiDefinitionIds.includes(apiDefinitionId)) {
      ApiHelper.globalApiDefinitionIds.push(apiDefinitionId);
    }
    ApiHelper.globalProjectDocumentVersionId = projectDocumentVersionId;
  }

  /**
   * Manually track API definition for cleanup
   */
  public trackApiDefinitionManually(apiDefinitionId: string, projectDocumentVersionId: string, authToken?: string): void {
    ApiHelper.trackApiDefinition(apiDefinitionId, projectDocumentVersionId);
    
    if (authToken) {
      ApiHelper.globalAuthToken = authToken;
    }
    
    this.creationObserver.manualTrack({
      apiDefinitionId,
      projectDocumentVersionId,
      authToken: authToken || ApiHelper.globalAuthToken
    });
  }

  /**
   * Delete API definitions using the tracked IDs
   */
  async deleteTrackedApiDefinitions(): Promise<boolean> {
    // Prevent duplicate cleanup attempts
    if (this.cleanupInProgress) {
      return true;
    }

    if (ApiHelper.cleanupCompleted) {
      return true;
    }

    this.cleanupInProgress = true;

    try {
      const trackedDefinitions = this.creationObserver.getTrackedDefinitions();
      
      if (trackedDefinitions.length > 0) {
        loggers.cleanup.info(`Deleting ${trackedDefinitions.length} tracked API definitions using observer pattern`);
        const result = await this.deleteDefinitionsUsingObserver(trackedDefinitions);
        this.creationObserver.clearTracked();
        
        if (result) {
          ApiHelper.cleanupCompleted = true;
        }
        
        loggers.cleanup.info(`Cleanup completed: ${result ? 'success' : 'failed'}`);
        return result;
      }
      
      if (ApiHelper.globalApiDefinitionIds.length === 0) {
        loggers.cleanup.info('No API definitions tracked for deletion');
        ApiHelper.cleanupCompleted = true;
        return true;
      }

      loggers.cleanup.info(`Deleting ${ApiHelper.globalApiDefinitionIds.length} tracked API definitions using legacy pattern`);
      const result = await this.deleteLegacyTrackedDefinitions();
      ApiHelper.globalApiDefinitionIds = [];
      
      if (result) {
        ApiHelper.cleanupCompleted = true;
      }
      
      loggers.cleanup.info(`Cleanup completed: ${result ? 'success' : 'failed'}`);
      return result;
    } finally {
      this.cleanupInProgress = false;
    }
  }

  /**
   * Reset cleanup state (call this at the start of each test)
   */
  public static resetCleanupState(): void {
    ApiHelper.cleanupCompleted = false;
  }

  /**
   * Check if API definition exists before attempting to delete
   */
  private async checkApiExists(apiDefinitionId: string, authToken: string): Promise<boolean> {
    try {
      const response = await this.page.request.get(`${this.config.get('API_BASE_URL')}/api/v2/apidefinitions/${apiDefinitionId}`, {
        headers: {
          'authorization': `Bearer ${authToken}`,
          'accept': 'application/json',
          'projectid': this.config.getEnvironmentConfig().projectId
        }
      });

      return response.ok();
    } catch {
      return false; // Assume it doesn't exist if we can't check
    }
  }

  /**
   * Delete definitions using observer pattern
   */
  private async deleteDefinitionsUsingObserver(definitions: Array<{
    apiDefinitionId: string;
    projectDocumentVersionId: string;
    authToken: string;
  }>): Promise<boolean> {
    try {
      // Deduplicate API definition IDs to avoid sending duplicates to the API
      const allApiIds = definitions.map(d => d.apiDefinitionId);
      const uniqueApiIds = [...new Set(allApiIds)];
      const { projectDocumentVersionId, authToken } = definitions[0];
      
      // Check if APIs exist before attempting to delete
      const existingApis: string[] = [];
      for (const apiId of uniqueApiIds) {
        const exists = await this.checkApiExists(apiId, authToken);
        if (exists) {
          existingApis.push(apiId);
        }
      }
      
      if (existingApis.length === 0) {
        return true; // Nothing to delete
      }
      
      loggers.api.debug(`Making bulk delete request for existing IDs: ${existingApis.join(', ')}`);
      
      const response = await this.page.request.post(`${this.config.get('API_BASE_URL')}/api/v2/apidefinitions/bulkdelete`, {
        headers: this.buildDeleteHeaders(authToken),
        data: {
          apiDefinitionList: existingApis,
          projectDocumentVersionId: projectDocumentVersionId
        }
      });

      return await this.handleDeleteResponse(response, existingApis.length);
    } catch (error) {
      loggers.api.error('Failed to delete API definitions using observer pattern', error);
      return false;
    }
  }

  /**
   * Delete definitions using legacy tracking
   */
  private async deleteLegacyTrackedDefinitions(): Promise<boolean> {
    try {
      if (!ApiHelper.globalAuthToken) {
        return false;
      }

      const response = await this.page.request.post(`${this.config.get('API_BASE_URL')}/api/v2/apidefinitions/bulkdelete`, {
        headers: this.buildDeleteHeaders(ApiHelper.globalAuthToken),
        data: {
          apiDefinitionList: ApiHelper.globalApiDefinitionIds,
          projectDocumentVersionId: ApiHelper.globalProjectDocumentVersionId
        }
      });

      return await this.handleDeleteResponse(response, ApiHelper.globalApiDefinitionIds.length);
    } catch (error) {
      return false;
    }
  }

  /**
   * Build headers for delete requests
   */
  private buildDeleteHeaders(authToken: string): Record<string, string> {
    const envConfig = this.config.getEnvironmentConfig();
    
    return {
      'accept': 'application/json, text/plain, */*',
      'content-type': 'application/json',
      'authorization': `Bearer ${authToken}`,
      'projectid': envConfig.projectId,
      'versiontype': '1',
      'origin': envConfig.apiBaseUrl,
      'referer': `${envConfig.apiBaseUrl}/${envConfig.projectId}/api-documentation`,
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
    };
  }

  /**
   * Handle delete response
   */
  private async handleDeleteResponse(response: any, count: number): Promise<boolean> {
    loggers.api.debug(`📡 Delete API response status: ${response.status()}`);
    
    if (response.ok()) {
      const responseText = await response.text();
      loggers.api.debug(`📋 Delete API response: ${responseText}`);
      loggers.api.info(`✅ Successfully deleted ${count} API definition(s)`);
      
      // Clear tracking data
      this.creationObserver.clearTracked();
      ApiHelper.globalApiDefinitionIds = [];
      ApiHelper.globalProjectDocumentVersionId = '';
      ApiHelper.globalAuthToken = '';
      
      return true;
    } else {
      const errorText = await response.text();
      loggers.api.error(`❌ Failed to delete API definitions: ${response.status()} - ${errorText}`);
      return false;
    }
  }

  /**
   * Listen for API creation response and track the IDs
   */
  async waitForApiCreationResponse(): Promise<{apiDefinitionId: string, projectDocumentVersionId: string} | null> {
    if (!this.responseObserver.isCurrentlyListening()) {
      this.responseObserver.startListening();
    }

    return new Promise((resolve) => {
      const testConfig = this.config.getTestConfig();
      const timeoutDuration = testConfig.apiTimeout || 30000;
      
      const timeout = setTimeout(() => {
        this.responseObserver.stopListening();
        resolve(null);
      }, timeoutDuration);

      const tempObserver: IApiResponseObserver = {
        onApiResponse: (responseData) => {
          if (responseData.type === 'creation' && 
              responseData.body?.success && 
              responseData.body?.result?.apiDefinitionId) {
            
            clearTimeout(timeout);
            this.responseObserver.removeObserver(tempObserver);
            
            const apiDefinitionId = responseData.body.result.apiDefinitionId;
            const projectDocumentVersionId = responseData.body.result.projectDocumentVersionId;
            
            ApiHelper.trackApiDefinition(apiDefinitionId, projectDocumentVersionId);
            
            // Get auth token from globally captured token (from request interception)
            const authToken = (globalThis as any).__capturedAuthToken || '';
            
            if (authToken) {
              ApiHelper.globalAuthToken = authToken;
            }
            
            resolve({
              apiDefinitionId,
              projectDocumentVersionId
            });
          }
        },
        onError: (error) => {
          clearTimeout(timeout);
          resolve(null);
        }
      };

      this.responseObserver.addObserver(tempObserver);
    });
  }

  /**
   * Get the current global auth token
   */
  public static getGlobalAuthToken(): string {
    return ApiHelper.globalAuthToken;
  }

  /**
   * Get auth token from browser session/cookies/localStorage
   */
  public async extractAuthTokenFromBrowser(): Promise<string> {
    try {
      // Try to get auth token from localStorage
      const localStorageToken = await this.page.evaluate(() => {
        const possibleKeys = ['authToken', 'token', 'access_token', 'accessToken', 'bearer_token', 'bearerToken'];
        for (const key of possibleKeys) {
          const token = localStorage.getItem(key);
          if (token) return token;
        }
        return null;
      });

      if (localStorageToken) return localStorageToken;

      // Try to get auth token from sessionStorage
      const sessionStorageToken = await this.page.evaluate(() => {
        const possibleKeys = ['authToken', 'token', 'access_token', 'accessToken', 'bearer_token', 'bearerToken'];
        for (const key of possibleKeys) {
          const token = sessionStorage.getItem(key);
          if (token) return token;
        }
        return null;
      });

      if (sessionStorageToken) return sessionStorageToken;

      // Try to get auth token from cookies
      const cookies = await this.page.context().cookies();
      const authCookie = cookies.find(cookie => 
        cookie.name.toLowerCase().includes('auth') || 
        cookie.name.toLowerCase().includes('token') ||
        cookie.name.toLowerCase().includes('bearer')
      );

      return authCookie?.value || '';
    } catch (error) {
      loggers.api.error(`❌ Error extracting auth token from browser:`, error);
      return '';
    }
  }

  /**
   * Get the current global auth token (instance method)
   * Falls back to extracting from browser if global token is empty
   */
  public async getCurrentAuthToken(): Promise<string> {
    // First try the global token
    if (ApiHelper.globalAuthToken) {
      return ApiHelper.globalAuthToken;
    }

    // Check if we captured a token from request interception
    const capturedToken = (globalThis as any).__capturedAuthToken;
    if (capturedToken) {
      ApiHelper.globalAuthToken = capturedToken; // Store it globally
      return capturedToken;
    }

    // If no token captured, try to extract from browser as fallback
    const browserToken = await this.extractAuthTokenFromBrowser();
    if (browserToken) {
      ApiHelper.globalAuthToken = browserToken;
      return browserToken;
    }

    return '';
  }
  /**
   * Get the creation observer instance
   */
  public getCreationObserver(): ApiCreationObserver {
    return this.creationObserver;
  }

  /**
   * Get the response observer instance
   */
  public getResponseObserver(): ApiResponseObserver {
    return this.responseObserver;
  }
}
