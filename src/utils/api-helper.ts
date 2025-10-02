import { Page } from '@playwright/test';
import { ConfigManager } from './config-manager';
import { ApiResponseObserver, ApiCreationObserver, IApiResponseObserver } from './api-response-observer';
import { loggers } from './logger-factory';

export class ApiHelper {
  private page: Page;
  private config: ConfigManager;
  private responseObserver: ApiResponseObserver;
  private creationObserver: ApiCreationObserver;

  private static globalApiDefinitionIds: string[] = [];
  private static globalProjectDocumentVersionId: string = '';
  private static globalAuthToken: string = '';

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
    const trackedDefinitions = this.creationObserver.getTrackedDefinitions();
    
    if (trackedDefinitions.length > 0) {
      loggers.cleanup.info(`Deleting ${trackedDefinitions.length} tracked API definitions using observer pattern`);
      const result = await this.deleteDefinitionsUsingObserver(trackedDefinitions);
      this.creationObserver.clearTracked();
      loggers.cleanup.info(`Cleanup completed: ${result ? 'success' : 'failed'}`);
      return result;
    }
    
    if (ApiHelper.globalApiDefinitionIds.length === 0) {
      loggers.cleanup.info('No API definitions tracked for deletion');
      return true;
    }

    loggers.cleanup.info(`Deleting ${ApiHelper.globalApiDefinitionIds.length} tracked API definitions using legacy pattern`);
    const result = await this.deleteLegacyTrackedDefinitions();
    ApiHelper.globalApiDefinitionIds = [];
    loggers.cleanup.info(`Cleanup completed: ${result ? 'success' : 'failed'}`);
    return result;
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
      const apiDefinitionIds = definitions.map(d => d.apiDefinitionId);
      const { projectDocumentVersionId, authToken } = definitions[0];
      
      loggers.api.debug(`Making bulk delete request for IDs: ${apiDefinitionIds.join(', ')}`);
      
      const response = await this.page.request.post(`${this.config.get('API_BASE_URL')}/api/v2/apidefinitions/bulkdelete`, {
        headers: this.buildDeleteHeaders(authToken),
        data: {
          apiDefinitionList: apiDefinitionIds,
          projectDocumentVersionId: projectDocumentVersionId
        }
      });

      return await this.handleDeleteResponse(response, apiDefinitionIds.length);
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
    console.log(`📡 Delete API response status: ${response.status()}`);
    
    if (response.ok()) {
      const responseText = await response.text();
      console.log(`📋 Delete API response: ${responseText}`);
      console.log(`✅ Successfully deleted ${count} API definition(s)`);
      
      // Clear tracking data
      this.creationObserver.clearTracked();
      ApiHelper.globalApiDefinitionIds = [];
      ApiHelper.globalProjectDocumentVersionId = '';
      ApiHelper.globalAuthToken = '';
      
      return true;
    } else {
      const errorText = await response.text();
      console.error(`❌ Failed to delete API definitions: ${response.status()} - ${errorText}`);
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
            
            const authToken = responseData.headers['authorization']?.replace('Bearer ', '') || '';
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
   * Get the response observer instance
   */
  public getResponseObserver(): ApiResponseObserver {
    return this.responseObserver;
  }

  /**
   * Get the creation observer instance
   */
  public getCreationObserver(): ApiCreationObserver {
    return this.creationObserver;
  }
}
