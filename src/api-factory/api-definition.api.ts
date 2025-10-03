import { Page } from '@playwright/test';
import { ApiActions } from '../commons/api-actions';
import { loggers } from '../utils/logging/logger-factory';
import * as fs from 'fs';
import * as path from 'path';

/**
 * API Definition API Class
 * Handles all API definition related operations (create, publish, delete, etc.)
 * Extends the common ApiActions base class
 */
export class ApiDefinitionApi extends ApiActions {
  
  constructor(page: Page) {
    super(page);
  }

  /**
   * Upload API specification file to CDN
   */
  async uploadSpecFile(filePath: string): Promise<string> {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      const fileName = path.basename(filePath);
      const contentType = this.getFileMimeType(fileName);
      const projectInfo = this.validateProjectInfo();

      loggers.api.info(`📤 Uploading API spec file: ${fileName}`);

      const response = await this.uploadFile(
        '/api/v2/apidefinitions/upload-spec-file',
        filePath,
        fileName,
        fileBuffer,
        {}, // No additional form data needed
        {
          headers: {
            'projectid': projectInfo.projectId,
            'referer': `https://portal.document360.io/${projectInfo.projectId}/api-documentation`,
            'versiontype': '0'
          },
          contentType
        }
      );

      const uploadResponse = await this.handleResponse<{
        result: { fileUrl: string };
        success: boolean;
        errors: string[];
      }>(response, 'File upload');

      loggers.api.info(`✅ File uploaded successfully: ${uploadResponse.result.fileUrl}`);
      return uploadResponse.result.fileUrl;

    } catch (error) {
      loggers.api.error(`❌ File upload failed for ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Create API definition from uploaded file URL
   */
  async createApiDefinition(fileUrl: string, shouldPublish: boolean = false): Promise<{
    apiDefinitionId: string;
    projectId: string;
    projectDocumentVersionId: string;
    categoriesCreated: number;
    articlesCreated: number;
  }> {
    try {
      const projectInfo = this.validateProjectInfo();
      
      loggers.api.info(`🔧 Creating API definition from: ${fileUrl}`);

      const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
      const formData = this.createApiDefinitionFormData(boundary, fileUrl, projectInfo);

      const response = await this.request.post(`${this.baseUrl}/api/v2/apidefinitions`, {
        headers: this.getCommonHeaders({
          'content-type': `multipart/form-data; boundary=${boundary}`,
          'projectid': projectInfo.projectId,
          'referer': `https://portal.document360.io/${projectInfo.projectId}/api-documentation`,
          'versiontype': '0'
        }),
        data: formData
      });

      const apiResponse = await this.handleResponse<{
        result: {
          isSuccess: boolean;
          projectId: string;
          projectDocumentVersionId: string;
          rootCategoryId: string;
          categoriesCreated: number;
          articlesCreated: number;
          apiDefinitionsCount: number;
          apiDefinitionId: string;
          isApiDefinitionImported: boolean;
        };
        success: boolean;
        errors: string[];
      }>(response, 'API definition creation');

      const result = {
        apiDefinitionId: apiResponse.result.apiDefinitionId,
        projectId: apiResponse.result.projectId,
        projectDocumentVersionId: apiResponse.result.projectDocumentVersionId,
        categoriesCreated: apiResponse.result.categoriesCreated,
        articlesCreated: apiResponse.result.articlesCreated
      };

      loggers.api.info(`✅ API definition created successfully: ${result.apiDefinitionId}`);

      // If publishing is requested, publish the API
      if (shouldPublish) {
        await this.publishApiDefinition(result.apiDefinitionId);
      }

      return result;

    } catch (error) {
      loggers.api.error(`❌ API definition creation failed:`, error);
      throw error;
    }
  }

  /**
   * Publish API definition for customer portal visibility
   * Uses the exact API call structure from the working curl command
   */
  async publishApiDefinition(apiDefinitionId: string): Promise<void> {
    try {
      const projectInfo = this.validateProjectInfo();
      
      loggers.api.info(`📢 Publishing API definition: ${apiDefinitionId}`);

      const response = await this.post(
        '/api/v2/apidefinitions/publish-articles',
        {
          apiDefinitionId: apiDefinitionId,
          projectId: projectInfo.projectId,
          projectDocumentVersionId: projectInfo.projectVersionId
        },
        {
          headers: {
            'accept-language': 'en-US,en;q=0.9',
            'origin': 'https://portal.document360.io',
            'priority': 'u=1, i',
            'projectid': projectInfo.projectId,
            'referer': `https://portal.document360.io/${projectInfo.projectId}/api-documentation`,
            'request-context': 'appId=cid-v1:4902addb-5aa7-47de-91d3-6476474b5e05',
            'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
            'versiontype': '0' // Use '0' as per your working curl command
          }
        }
      );

      await this.handleResponse(response, 'API definition publishing');
      loggers.api.info(`✅ API definition published successfully for customer portal`);

    } catch (error) {
      loggers.api.error(`❌ API definition publishing failed:`, error);
      throw error;
    }
  }

  /**
   * Publish API definition using exact curl command structure
   * This method replicates the exact API call from your working curl command
   */
  async publishApiDefinitionExact(
    apiDefinitionId: string,
    projectId: string,
    projectDocumentVersionId: string
  ): Promise<void> {
    try {
      loggers.api.info(`📢 Publishing API definition (exact curl): ${apiDefinitionId}`);

      const requestBody = {
        apiDefinitionId: apiDefinitionId,
        projectId: projectId,
        projectDocumentVersionId: projectDocumentVersionId
      };

      const response = await this.request.post(`${this.baseUrl}/api/v2/apidefinitions/publish-articles`, {
        headers: {
          'accept': 'application/json, text/plain, */*',
          'accept-language': 'en-US,en;q=0.9',
          'authorization': `Bearer ${this.getAuthToken()}`,
          'content-type': 'application/json',
          'origin': 'https://portal.document360.io',
          'priority': 'u=1, i',
          'projectid': projectId,
          'referer': `https://portal.document360.io/${projectId}/api-documentation`,
          'request-context': 'appId=cid-v1:4902addb-5aa7-47de-91d3-6476474b5e05',
          'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
          'versiontype': '0'
        },
        data: JSON.stringify(requestBody)
      });

      if (!response.ok()) {
        const errorText = await response.text();
        throw new Error(`API definition publishing failed: ${response.status()} - ${errorText}`);
      }

      const publishResponse = await response.json();
      
      if (!publishResponse.success) {
        throw new Error(`API definition publishing failed: ${publishResponse.errors?.join(', ') || 'Unknown error'}`);
      }

      loggers.api.info(`✅ API definition published successfully (exact curl method)`);

    } catch (error) {
      loggers.api.error(`❌ API definition publishing failed (exact curl):`, error);
      throw error;
    }
  }

  /**
   * Get API definition details
   */
  async getApiDefinition(apiDefinitionId: string): Promise<any> {
    try {
      const projectInfo = this.validateProjectInfo();
      
      const response = await this.get(`/api/v2/apidefinitions/${apiDefinitionId}`, {
        headers: {
          'projectid': projectInfo.projectId,
          'versiontype': '1'
        }
      });

      const apiData = await this.handleResponse(response, 'Get API definition');
      return apiData;

    } catch (error) {
      loggers.api.error(`❌ Failed to get API definition ${apiDefinitionId}:`, error);
      throw error;
    }
  }

  /**
   * Check if API definition is published
   */
  async isApiDefinitionPublished(apiDefinitionId: string): Promise<boolean> {
    try {
      const apiData = await this.getApiDefinition(apiDefinitionId);
      
      const isPublished = apiData.result?.isPublished || 
                         apiData.result?.status === 'published' ||
                         apiData.isPublished ||
                         false;

      loggers.api.info(`📊 API definition ${apiDefinitionId} published status: ${isPublished}`);
      return isPublished;

    } catch (error) {
      loggers.api.debug(`Could not check publish status for ${apiDefinitionId}:`, error);
      return false;
    }
  }

  /**
   * Delete API definition
   */
  async deleteApiDefinition(apiDefinitionId: string): Promise<void> {
    try {
      const projectInfo = this.validateProjectInfo();
      
      loggers.api.info(`🗑️ Deleting API definition: ${apiDefinitionId}`);

      const response = await this.delete(`/api/v2/apidefinitions/${apiDefinitionId}`, {
        headers: {
          'projectid': projectInfo.projectId
        }
      });

      await this.handleResponse(response, 'API definition deletion');
      loggers.api.info(`✅ API definition deleted successfully: ${apiDefinitionId}`);

    } catch (error) {
      loggers.api.error(`❌ Failed to delete API definition ${apiDefinitionId}:`, error);
      throw error;
    }
  }

  /**
   * List all API definitions for the project
   */
  async listApiDefinitions(): Promise<any[]> {
    try {
      const projectInfo = this.validateProjectInfo();
      
      const response = await this.get('/api/v2/apidefinitions', {
        headers: {
          'projectid': projectInfo.projectId
        },
        params: {
          projectId: projectInfo.projectId
        }
      });

      const data = await this.handleResponse<{
        result: any[];
      }>(response, 'List API definitions');

      return data.result || [];

    } catch (error) {
      loggers.api.error(`❌ Failed to list API definitions:`, error);
      throw error;
    }
  }

  /**
   * Complete workflow: Upload file and create API definition
   */
  async uploadAndCreateApiDefinition(
    filePath: string,
    shouldPublish: boolean = false
  ): Promise<{
    fileUrl: string;
    apiDefinitionId: string;
    projectId: string;
    projectDocumentVersionId: string;
    categoriesCreated: number;
    articlesCreated: number;
  }> {
    try {
      // Step 1: Upload file to CDN
      const fileUrl = await this.uploadSpecFile(filePath);
      
      // Step 2: Create API definition
      const apiDefinitionResponse = await this.createApiDefinition(fileUrl, shouldPublish);

      return {
        fileUrl,
        ...apiDefinitionResponse
      };

    } catch (error) {
      loggers.api.error(`❌ Complete API creation workflow failed:`, error);
      throw error;
    }
  }

  /**
   * Batch delete multiple API definitions
   */
  async batchDeleteApiDefinitions(apiDefinitionIds: string[]): Promise<void> {
    if (apiDefinitionIds.length === 0) {
      loggers.api.info('📋 No API definitions to delete');
      return;
    }

    loggers.api.info(`🗑️ Batch deleting ${apiDefinitionIds.length} API definitions`);

    const deletePromises = apiDefinitionIds.map(id => 
      this.retry(
        () => this.deleteApiDefinition(id),
        3,
        1000,
        `Delete API definition ${id}`
      )
    );

    try {
      await Promise.allSettled(deletePromises);
      loggers.api.info(`✅ Batch deletion completed for ${apiDefinitionIds.length} API definitions`);
    } catch (error) {
      loggers.api.warn(`⚠️ Some API definitions may not have been deleted:`, error);
    }
  }

  /**
   * Create multipart form data for API definition creation
   */
  private createApiDefinitionFormData(
    boundary: string, 
    fileUrl: string, 
    projectInfo: { projectId: string; projectVersionId: string }
  ): Buffer {
    const CRLF = '\r\n';
    let formData = '';

    // Add projectVersionId
    formData += `--${boundary}${CRLF}`;
    formData += `Content-Disposition: form-data; name="projectVersionId"${CRLF}${CRLF}`;
    formData += projectInfo.projectVersionId;
    formData += `${CRLF}`;

    // Add sourceType
    formData += `--${boundary}${CRLF}`;
    formData += `Content-Disposition: form-data; name="sourceType"${CRLF}${CRLF}`;
    formData += '1'; // 1 for file upload
    formData += `${CRLF}`;

    // Add isApiDefinitionImported
    formData += `--${boundary}${CRLF}`;
    formData += `Content-Disposition: form-data; name="isApiDefinitionImported"${CRLF}${CRLF}`;
    formData += 'true';
    formData += `${CRLF}`;

    // Add operationType
    formData += `--${boundary}${CRLF}`;
    formData += `Content-Disposition: form-data; name="operationType"${CRLF}${CRLF}`;
    formData += '0'; // 0 for create
    formData += `${CRLF}`;

    // Add proceedAnyway
    formData += `--${boundary}${CRLF}`;
    formData += `Content-Disposition: form-data; name="proceedAnyway"${CRLF}${CRLF}`;
    formData += 'false';
    formData += `${CRLF}`;

    // Add url
    formData += `--${boundary}${CRLF}`;
    formData += `Content-Disposition: form-data; name="url"${CRLF}${CRLF}`;
    formData += fileUrl;
    formData += `${CRLF}`;

    // End boundary
    formData += `--${boundary}--${CRLF}`;

    return Buffer.from(formData, 'binary');
  }

  /**
   * Delete API definition using exact curl command structure (bulkdelete)
   */
  async deleteApiDefinition(apiDefinitionId: string): Promise<void> {
    try {
      const projectInfo = this.validateProjectInfo();
      
      loggers.api.info(`🗑️ Deleting API definition: ${apiDefinitionId}`);

      const requestBody = {
        apiDefinitionList: [apiDefinitionId],
        projectDocumentVersionId: projectInfo.projectVersionId
      };

      const response = await this.request.post(`${this.baseUrl}/api/v2/apidefinitions/bulkdelete`, {
        headers: {
          'accept': 'application/json, text/plain, */*',
          'accept-language': 'en-US,en;q=0.9',
          'authorization': `Bearer ${this.getAuthToken()}`,
          'content-type': 'application/json',
          'origin': 'https://portal.document360.io',
          'priority': 'u=1, i',
          'projectid': projectInfo.projectId,
          'referer': `https://portal.document360.io/${projectInfo.projectId}/api-documentation`,
          'request-context': 'appId=cid-v1:4902addb-5aa7-47de-91d3-6476474b5e05',
          'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
          'versiontype': '1'
        },
        data: JSON.stringify(requestBody)
      });

      await this.handleResponse(response, 'API definition deletion');
      loggers.api.info(`✅ API definition deleted: ${apiDefinitionId}`);

    } catch (error) {
      loggers.api.error(`❌ API definition deletion failed:`, error);
      throw error;
    }
  }
}
