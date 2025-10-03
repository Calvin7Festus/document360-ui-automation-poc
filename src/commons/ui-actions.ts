import { Page, Locator, expect } from '@playwright/test';

export class UIActions {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private resolve(locator: string | Locator): Locator {
    return typeof locator === 'string' ? this.page.locator(locator) : locator;
  }

  async click(locator: string | Locator) {
    await this.resolve(locator).click();
  }

  async type(locator: string | Locator, text: string) {
    await this.resolve(locator).fill(text);
  }

  async getText(locator: string | Locator): Promise<string> {
    return await this.resolve(locator).innerText();
  }

  async waitForVisible(locator: string | Locator, timeout: number = 5000) {
    await expect(this.resolve(locator)).toBeVisible({ timeout });
  }

  async waitForHidden(locator: string | Locator, timeout: number = 5000) {
    await expect(this.resolve(locator)).toBeHidden({ timeout });
  }

  async waitForUrl(url: string) {
    await this.page.waitForURL(url);
  }

  async uploadFile(locator: string | Locator, filePath: string) {
    await this.resolve(locator).setInputFiles(filePath);
  }

  async navigate(url: string) {
    await this.page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `screenshots/${name}.png`, 
      fullPage: true,
      timeout: 30000 // 30 seconds timeout for screenshot (fonts can be slow in headless mode)
    });
  }

  async assertVisible(locator: string | Locator) {
    await expect(this.resolve(locator)).toBeVisible();
  }

  async assertContainsText(locator: string | Locator, expected: string) {
    await expect(this.resolve(locator)).toContainText(expected);
  }

  // Generic locator methods
  getByTitle(title: string) {
    return this.page.locator(`a[title='${title}']`);
  }

  getByAttribute(element: string, attribute: string, value: string) {
    return this.page.locator(`${element}[${attribute}='${value}']`);
  }

  getByDataTestId(testId: string) {
    return this.page.locator(`[data-testid='${testId}']`);
  }

  getByClassName(className: string) {
    return this.page.locator(`.${className}`);
  }

  getById(id: string) {
    return this.page.locator(`#${id}`);
  }
}
