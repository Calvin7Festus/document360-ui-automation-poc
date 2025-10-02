import { Locator, Page } from '@playwright/test';
import { UIActions } from '../../commons/ui-actions';

export class LoginPage extends UIActions {
  readonly usernameInput: Locator;

  readonly passwordInput: Locator;

  readonly loginButton: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('#emailOrSubdomain');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('#login_button');
  }

  async gotoLogin(baseURL: string) {
    await this.navigate(`${baseURL}/login`);
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.loginButton.click();
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.page.waitForLoadState('networkidle');
  }
}
