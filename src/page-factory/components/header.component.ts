import { Locator, Page } from "@playwright/test";
import { UIActions } from "../../commons/ui-actions";

export class Header extends UIActions {

  readonly createButton: Locator;

  readonly newApiButton: Locator;

  constructor(page: Page) {
    super(page);
    // Updated locators based on recorded interactions
    this.createButton = page.getByRole('button', { name: 'Create', exact: true });
    this.newApiButton = page.getByRole('button', { name: ' New API' });
  }

  async clickOnCreateButton() {
    // Wait for the button to be visible and clickable
    await this.createButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.createButton.click();
  }

  async clickOnNewApiButton() {
    // Wait for the button to be visible and clickable
    await this.newApiButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.newApiButton.click();
  }

}
  