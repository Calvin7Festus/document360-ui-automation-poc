/**
 * Example: Using the publish-articles API for Category 3 tests
 * 
 * This example shows how to use the exact curl command structure
 * that was provided for publishing API definitions to the customer portal.
 */

import { Page } from '@playwright/test';
import { ApiDefinitionApi } from '../api-definition.api';

export class PublishApiExample {
  private apiDefinition: ApiDefinitionApi;

  constructor(page: Page) {
    this.apiDefinition = new ApiDefinitionApi(page);
  }

  /**
   * Example 1: Using the standard publishApiDefinition method
   */
  async publishWithStandardMethod(apiDefinitionId: string, authToken: string): Promise<void> {
    // Set the auth token
    this.apiDefinition.setAuthToken(authToken);

    // Publish using the standard method (uses project info from global state)
    await this.apiDefinition.publishApiDefinition(apiDefinitionId);
  }

  /**
   * Example 2: Using the exact curl command structure
   */
  async publishWithExactCurlMethod(
    apiDefinitionId: string,
    projectId: string,
    projectDocumentVersionId: string,
    authToken: string
  ): Promise<void> {
    // Set the auth token
    this.apiDefinition.setAuthToken(authToken);

    // Publish using the exact curl command structure
    await this.apiDefinition.publishApiDefinitionExact(
      apiDefinitionId,
      projectId,
      projectDocumentVersionId
    );
  }

  /**
   * Example 3: Complete workflow for Category 3 tests
   */
  async completeCategory3Workflow(
    filePath: string,
    authToken: string,
    projectId: string,
    projectDocumentVersionId: string
  ): Promise<string> {
    // Set the auth token
    this.apiDefinition.setAuthToken(authToken);

    // Step 1: Upload and create API definition
    const result = await this.apiDefinition.uploadAndCreateApiDefinition(filePath, false);

    // Step 2: Publish using exact curl method for Category 3
    await this.apiDefinition.publishApiDefinitionExact(
      result.apiDefinitionId,
      projectId,
      projectDocumentVersionId
    );

    // Step 3: Verify publishing was successful
    const isPublished = await this.apiDefinition.isApiDefinitionPublished(result.apiDefinitionId);
    
    if (!isPublished) {
      throw new Error(`API definition ${result.apiDefinitionId} was not published successfully`);
    }

    console.log(`✅ API definition ${result.apiDefinitionId} published successfully for customer portal`);
    return result.apiDefinitionId;
  }
}

/**
 * Usage in test files:
 * 
 * ```typescript
 * // In your Category 3 test file
 * import { PublishApiExample } from '../../../api-factory/examples/publish-api-example';
 * 
 * test('Category 3 with exact publish API', async ({ page }) => {
 *   const publishExample = new PublishApiExample(page);
 *   
 *   const apiDefinitionId = await publishExample.completeCategory3Workflow(
 *     'path/to/comprehensive-api.yaml',
 *     capturedAuthToken,
 *     '1bff9bc5-3c41-43fe-852a-5442d48212ca',
 *     'e5cfdc47-43fe-42ac-b3ab-372dae118da5'
 *   );
 *   
 *   // Continue with your customer portal validations...
 * });
 * ```
 */
