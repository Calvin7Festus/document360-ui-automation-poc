/**
 * API Factory - Central export point for all API classes
 * 
 * This module provides a centralized way to access all API classes
 * that extend the common ApiActions base class.
 * 
 * Usage:
 * ```typescript
 * import { ApiDefinitionApi, AuthApi, FileUploadApi } from '../api-factory';
 * 
 * // In your test or setup manager
 * const apiDefinition = new ApiDefinitionApi(page);
 * const auth = new AuthApi(page);
 * const fileUpload = new FileUploadApi(page);
 * ```
 */

// Import API classes for internal use by ApiFactory
import { ApiDefinitionApi } from './api-definition.api';
import { AuthApi } from './auth.api';
import { FileUploadApi } from './file-upload.api';
import { Page } from '@playwright/test';

// Export all API classes
export { ApiDefinitionApi } from './api-definition.api';
export { AuthApi } from './auth.api';
export { FileUploadApi } from './file-upload.api';

// Export the base class for custom API implementations
export { ApiActions } from '../commons/api-actions';

// Type definitions for common API responses
export interface ApiResponse<T = any> {
  result: T;
  success: boolean;
  errors: string[];
  warnings?: string[];
}

export interface PaginatedApiResponse<T = any> extends ApiResponse<T[]> {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
}

export interface FileUploadResponse {
  result: {
    fileUrl: string;
    fileName?: string;
    fileSize?: number;
  };
  success: boolean;
  errors: string[];
}

export interface ApiDefinitionCreationResponse {
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
}

export interface AuthTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  refresh_token?: string;
  id_token?: string;
}

export interface UserProfileResponse {
  result: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    permissions: string[];
  };
  success: boolean;
  errors: string[];
}

/**
 * API Factory class for creating and managing API instances
 * Provides a centralized way to create API instances with shared configuration
 */
export class ApiFactory {
  private page: Page;
  private authToken?: string;

  constructor(page: Page, authToken?: string) {
    this.page = page;
    this.authToken = authToken;
  }

  /**
   * Create an API Definition API instance
   */
  createApiDefinitionApi(): ApiDefinitionApi {
    const api = new ApiDefinitionApi(this.page);
    if (this.authToken) {
      api.setAuthToken(this.authToken);
    }
    return api;
  }

  /**
   * Create an Auth API instance
   */
  createAuthApi(): AuthApi {
    const api = new AuthApi(this.page);
    if (this.authToken) {
      api.setAuthToken(this.authToken);
    }
    return api;
  }

  /**
   * Create a File Upload API instance
   */
  createFileUploadApi(): FileUploadApi {
    const api = new FileUploadApi(this.page);
    if (this.authToken) {
      api.setAuthToken(this.authToken);
    }
    return api;
  }

  /**
   * Create all API instances at once
   */
  createAllApis(): {
    apiDefinition: ApiDefinitionApi;
    auth: AuthApi;
    fileUpload: FileUploadApi;
  } {
    return {
      apiDefinition: this.createApiDefinitionApi(),
      auth: this.createAuthApi(),
      fileUpload: this.createFileUploadApi()
    };
  }

  /**
   * Update auth token for all future API instances
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Get the current auth token
   */
  getAuthToken(): string | undefined {
    return this.authToken;
  }
}

// Export examples for reference
export { PublishApiExample } from './examples/publish-api-example';

// Re-export Page type for convenience
export type { Page } from '@playwright/test';
