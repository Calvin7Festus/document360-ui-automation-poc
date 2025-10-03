import { Locator, Page } from "@playwright/test";
import { UIActions } from "../../commons/ui-actions";

export class ToastMessage extends UIActions {
  readonly toastContainer: Locator;
  readonly toastMessage: Locator;
  readonly toastCloseButton: Locator;
  readonly successToast: Locator;
  readonly errorToast: Locator;
  readonly warningToast: Locator;
  readonly infoToast: Locator;

  constructor(page: Page) {
    super(page);
    this.toastContainer = page.locator('div#toast-container');
    this.toastMessage = page.locator('div#toast-container div.toast-message');
    this.toastCloseButton = page.locator('div#toast-container button[aria-label="Close"], div#toast-container .toast-close');
    this.successToast = page.locator('div#toast-container .toast-success, div#toast-container .toast-message.success');
    this.errorToast = page.locator('div#toast-container .toast-error, div#toast-container .toast-message.error');
    this.warningToast = page.locator('div#toast-container .toast-warning, div#toast-container .toast-message.warning');
    this.infoToast = page.locator('div#toast-container .toast-info, div#toast-container .toast-message.info');
  }

  // Wait for toast to appear
  async waitForToastToAppear(timeout: number = 10000) {
    await this.toastMessage.waitFor({ state: 'visible', timeout });
  }

  // Wait for toast to disappear
  async waitForToastToDisappear(timeout: number = 10000) {
    await this.toastMessage.waitFor({ state: 'hidden', timeout });
  }

  // Check if toast is visible
  async isToastVisible(): Promise<boolean> {
    return await this.toastMessage.isVisible();
  }

  // Get toast message text
  async getToastText(): Promise<string | null> {
    return await this.toastMessage.textContent();
  }

  // Close toast by clicking close button
  async closeToast() {
    if (await this.toastCloseButton.isVisible()) {
      await this.toastCloseButton.click();
    }
  }

  // Wait for specific toast type
  async waitForSuccessToast(timeout: number = 10000) {
    await this.successToast.waitFor({ state: 'visible', timeout });
  }

  async waitForErrorToast(timeout: number = 10000) {
    await this.errorToast.waitFor({ state: 'visible', timeout });
  }

  async waitForWarningToast(timeout: number = 10000) {
    await this.warningToast.waitFor({ state: 'visible', timeout });
  }

  async waitForInfoToast(timeout: number = 10000) {
    await this.infoToast.waitFor({ state: 'visible', timeout });
  }

  // Check if specific toast type is visible
  async isSuccessToastVisible(): Promise<boolean> {
    return await this.successToast.isVisible();
  }

  async isErrorToastVisible(): Promise<boolean> {
    return await this.errorToast.isVisible();
  }

  async isWarningToastVisible(): Promise<boolean> {
    return await this.warningToast.isVisible();
  }

  async isInfoToastVisible(): Promise<boolean> {
    return await this.infoToast.isVisible();
  }

  // Get toast type based on CSS classes
  async getToastType(): Promise<string> {
    const classes = await this.toastMessage.getAttribute('class');
    if (classes?.includes('success')) return 'success';
    if (classes?.includes('error')) return 'error';
    if (classes?.includes('warning')) return 'warning';
    if (classes?.includes('info')) return 'info';
    return 'unknown';
  }

  // Wait for toast with specific text content
  async waitForToastWithText(text: string, timeout: number = 10000) {
    await this.toastMessage.filter({ hasText: text }).waitFor({ state: 'visible', timeout });
  }

  // Check if toast contains specific text
  async containsText(text: string): Promise<boolean> {
    const toastText = await this.getToastText();
    return toastText?.includes(text) || false;
  }

  // Take screenshot of toast
  async takeToastScreenshot(name: string) {
    await this.toastMessage.screenshot({ 
      path: `test-results/toast-screenshots/${name}-${Date.now()}.png`,
      timeout: 30000 // 30 seconds timeout for screenshot (fonts can be slow in headless mode)
    });
  }
}
