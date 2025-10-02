import { Page } from '@playwright/test';
import { ApiDocPage } from '../page-factory/pages/api-doc.page';
import { Header } from '../page-factory/components/header.component';
import { NewApiCreationModal } from '../page-factory/components/new-api-creation.modal';
import { ToastMessage } from '../page-factory/components/toast-message.component';
import { ApiHelper } from './api-helper';
import { ConfigManager } from './config-manager';

/**
 * Interface for import test setup context
 */
export interface ImportTestSetupContext {
  apiDocPage: ApiDocPage;
  header: Header;
  newApiModal: NewApiCreationModal;
  toastMessage: ToastMessage;
  apiHelper: ApiHelper;
}

/**
 * Import Test Setup Manager - Lightweight setup for API import tests
 * Implements Single Responsibility Principle for import test environment setup
 */
export class ImportTestSetupManager {
  private page: Page;
  private context: ImportTestSetupContext | null = null;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Setup for import tests - initializes page objects and navigates to application
   */
  async setupImportTest(): Promise<ImportTestSetupContext> {
    // Initialize page objects
    const pageObjects = this.initializePageObjects();
    
    // Navigate to application
    await this.navigateToApplication();

    this.context = pageObjects;
    return this.context;
  }

  /**
   * Teardown for import tests - cleanup API definitions
   */
  async teardownImportTest(): Promise<void> {
    if (this.context) {
      try {
        await this.context.apiHelper.deleteTrackedApiDefinitions();
      } catch (error) {
        console.warn('Failed to cleanup API definitions:', error);
      }
    }
  }

  /**
   * Get the current test context
   */
  getContext(): ImportTestSetupContext {
    if (!this.context) {
      throw new Error('Import test setup has not been completed. Call setupImportTest() first.');
    }
    return this.context;
  }

  // Private helper methods

  private initializePageObjects(): ImportTestSetupContext {
    return {
      apiDocPage: new ApiDocPage(this.page),
      header: new Header(this.page),
      newApiModal: new NewApiCreationModal(this.page),
      toastMessage: new ToastMessage(this.page),
      apiHelper: new ApiHelper(this.page)
    };
  }

  private async navigateToApplication(): Promise<void> {
    const configManager = ConfigManager.getInstance();
    const testUrl = configManager.get<string>('BASE_URL');
    await this.page.goto(testUrl);
  }
}

/**
 * Factory function for creating ImportTestSetupManager instances
 */
export function createImportTestSetupManager(page: Page): ImportTestSetupManager {
  return new ImportTestSetupManager(page);
}
