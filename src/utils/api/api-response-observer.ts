import { Page } from '@playwright/test';

/**
 * Interface for API response observers
 */
export interface IApiResponseObserver {
  onApiResponse(response: ApiResponseData): void;
  onError(error: Error): void;
}

/**
 * API response data structure
 */
export interface ApiResponseData {
  url: string;
  method: string;
  status: number;
  headers: Record<string, string>;
  body?: any;
  timestamp: Date;
  type: 'creation' | 'deletion' | 'update' | 'fetch';
}

/**
 * API Response Observer - Observer Pattern
 * Manages API response tracking and notifications to multiple observers
 */
export class ApiResponseObserver {
  private observers: IApiResponseObserver[] = [];
  private page: Page;
  private isListening: boolean = false;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Add an observer to the notification list
   */
  public addObserver(observer: IApiResponseObserver): void {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
    }
  }

  /**
   * Remove an observer from the notification list
   */
  public removeObserver(observer: IApiResponseObserver): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  /**
   * Notify all observers of an API response
   */
  private notifyObservers(responseData: ApiResponseData): void {
    this.observers.forEach(observer => {
      try {
        observer.onApiResponse(responseData);
      } catch (error) {
        observer.onError(error as Error);
      }
    });
  }

  /**
   * Notify all observers of an error
   */
  private notifyError(error: Error): void {
    this.observers.forEach(observer => {
      observer.onError(error);
    });
  }

  /**
   * Start listening for API responses
   */
  public startListening(): void {
    if (this.isListening) {
      return;
    }

    this.isListening = true;
    this.page.on('response', this.handleResponse.bind(this));
    this.page.on('request', this.handleRequest.bind(this)); // Also listen to requests for auth tokens
  }

  /**
   * Stop listening for API responses
   */
  public stopListening(): void {
    if (!this.isListening) {
      return;
    }

    this.isListening = false;
    this.page.off('response', this.handleResponse.bind(this));
    this.page.off('request', this.handleRequest.bind(this)); // Stop listening to requests too
  }

  /**
   * Handle incoming API responses
   */
  private async handleResponse(response: any): Promise<void> {
    try {
      // Filter for API-related responses
      if (!this.isApiResponse(response)) {
        return;
      }

      const responseData: ApiResponseData = {
        url: response.url(),
        method: response.request().method(),
        status: response.status(),
        headers: response.headers(),
        timestamp: new Date(),
        type: this.determineResponseType(response)
      };

      // Try to parse response body if it's JSON
      try {
        if (response.headers()['content-type']?.includes('application/json')) {
          responseData.body = await response.json();
        }
      } catch {
        // Ignore JSON parsing errors
      }

      this.notifyObservers(responseData);
    } catch (error) {
      this.notifyError(error as Error);
    }
  }

  /**
   * Handle outgoing API requests to capture auth tokens
   */
  private handleRequest(request: any): void {
    try {
      // Filter for API-related requests
      if (!this.isApiRequest(request)) {
        return;
      }

      const authHeader = request.headers()['authorization'];
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '');
        
        // Store the token globally for cleanup use
        this.storeAuthTokenGlobally(token);
      }
    } catch (error) {
      // Silent error handling for auth token extraction
    }
  }

  /**
   * Store auth token globally for cleanup use
   */
  private storeAuthTokenGlobally(token: string): void {
    (globalThis as any).__capturedAuthToken = token;
  }

  /**
   * Determine if the request is API-related
   */
  private isApiRequest(request: any): boolean {
    const url = request.url();
    return url.includes('/api/') || 
           url.includes('/apidefinitions') || 
           url.includes('/upload-spec-file');
  }

  /**
   * Determine if the response is API-related
   */
  private isApiResponse(response: any): boolean {
    const url = response.url();
    return url.includes('/api/') || 
           url.includes('/apidefinitions') || 
           url.includes('/upload-spec-file');
  }

  /**
   * Determine the type of API response
   */
  private determineResponseType(response: any): ApiResponseData['type'] {
    const url = response.url();
    const method = response.request().method();

    if (url.includes('/apidefinitions')) {
      if (method === 'POST' && url.includes('/bulkdelete')) {
        return 'deletion';
      } else if (method === 'POST') {
        return 'creation';
      } else if (method === 'PUT' || method === 'PATCH') {
        return 'update';
      } else if (method === 'GET') {
        return 'fetch';
      }
    }

    return 'fetch';
  }

  /**
   * Get the current listening status
   */
  public isCurrentlyListening(): boolean {
    return this.isListening;
  }

  /**
   * Get the number of registered observers
   */
  public getObserverCount(): number {
    return this.observers.length;
  }
}

/**
 * Concrete observer for API creation tracking
 */
export class ApiCreationObserver implements IApiResponseObserver {
  private trackedApiDefinitions: Array<{
    apiDefinitionId: string;
    projectDocumentVersionId: string;
    authToken: string;
  }> = [];

  onApiResponse(response: ApiResponseData): void {
    if (response.type === 'creation' && response.body?.success && response.body?.result?.apiDefinitionId) {
      const apiDefinitionId = response.body.result.apiDefinitionId;
      const projectDocumentVersionId = response.body.result.projectDocumentVersionId;
      
      // Get auth token from globally captured token (from request interception)
      const authToken = (globalThis as any).__capturedAuthToken || '';

      // Check if this API is already tracked to avoid duplicates
      const existingIndex = this.trackedApiDefinitions.findIndex(
        existing => existing.apiDefinitionId === apiDefinitionId
      );
      
      if (existingIndex >= 0) {
        this.trackedApiDefinitions[existingIndex] = {
          apiDefinitionId,
          projectDocumentVersionId,
          authToken
        };
      } else {
        this.trackedApiDefinitions.push({
          apiDefinitionId,
          projectDocumentVersionId,
          authToken
        });
      }
    }
  }

  onError(error: Error): void {
    // Error handling for API Creation Observer
  }

  /**
   * Get all tracked API definitions
   */
  public getTrackedDefinitions(): Array<{
    apiDefinitionId: string;
    projectDocumentVersionId: string;
    authToken: string;
  }> {
    return [...this.trackedApiDefinitions];
  }

  /**
   * Clear tracked definitions
   */
  public clearTracked(): void {
    this.trackedApiDefinitions = [];
  }

  /**
   * Manually track an API definition
   */
  public manualTrack(definition: {
    apiDefinitionId: string;
    projectDocumentVersionId: string;
    authToken: string;
  }): void {
    // Check if this API is already tracked to avoid duplicates
    const existingIndex = this.trackedApiDefinitions.findIndex(
      existing => existing.apiDefinitionId === definition.apiDefinitionId
    );
    
    if (existingIndex >= 0) {
      this.trackedApiDefinitions[existingIndex] = definition; // Update existing
    } else {
      this.trackedApiDefinitions.push(definition);
    }
  }
}

/**
 * Concrete observer for API response logging
 */
export class ApiResponseLogger implements IApiResponseObserver {
  private logLevel: 'info' | 'debug' | 'error';

  constructor(logLevel: 'info' | 'debug' | 'error' = 'info') {
    this.logLevel = logLevel;
  }

  onApiResponse(response: ApiResponseData): void {
    // Logging handled by the main observer system
  }

  onError(error: Error): void {
    // Error handling for API Response Logger
  }
}
