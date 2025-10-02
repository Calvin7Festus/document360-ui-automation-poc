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
    console.log('👂 API Response Observer started listening');
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
    console.log('🔇 API Response Observer stopped listening');
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
      const authToken = response.headers['authorization']?.replace('Bearer ', '') || '';

      this.trackedApiDefinitions.push({
        apiDefinitionId,
        projectDocumentVersionId,
        authToken
      });

      console.log(`📝 Tracked API creation: ${apiDefinitionId}`);
    }
  }

  onError(error: Error): void {
    console.error('❌ API Creation Observer error:', error);
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
    this.trackedApiDefinitions.push(definition);
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
    if (this.logLevel === 'debug' || this.logLevel === 'info') {
      console.log(`📡 API ${response.type}: ${response.method} ${response.url} - ${response.status}`);
    }
  }

  onError(error: Error): void {
    if (this.logLevel === 'error' || this.logLevel === 'info') {
      console.error('❌ API Response Logger error:', error);
    }
  }
}
