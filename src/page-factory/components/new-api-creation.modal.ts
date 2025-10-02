import { Locator, Page } from "@playwright/test";
import { UIActions } from "../../commons/ui-actions";

export class NewApiCreationModal extends UIActions {

  readonly uploadApiDefinitionButton: Locator;
  readonly createFromUrlButton: Locator;
  readonly uploadFromMyDeviceButton: Locator;
  readonly newApiReferenceButton: Locator;
  readonly publishButton: Locator;
  readonly cancelButton: Locator;
  readonly inputUrlTextBox: Locator;
  readonly uploadApiDefinitionRadio: Locator;
  readonly createFromUrlRadio: Locator;
  readonly cicdFlowRadio: Locator;
  readonly trySamplePetStoreRadio: Locator;
  readonly urlInputBox: Locator;
  readonly alertMessage: Locator;
  

  constructor(page: Page) {
    super(page);
    this.uploadApiDefinitionButton = page.getByRole('button', { name: 'Upload from my device' });
    this.createFromUrlButton = page.getByRole('button', { name: 'Create from URL' });
    this.uploadFromMyDeviceButton = page.locator('input[type="file"][accept=".JSON,.YAML,.YML"]');
    this.newApiReferenceButton = page.getByRole('button', { name: 'New API reference' });
    this.publishButton = page.getByRole('button', { name: 'Publish' });
    this.cancelButton = page.locator('button#Cancel');
    this.inputUrlTextBox = page.getByRole('textbox', { name: 'URL' });
    this.uploadApiDefinitionRadio = page.getByRole('radio', { name: 'Upload API definition' });
    this.createFromUrlRadio = page.getByRole('radio', { name: 'Create from URL' });
    this.cicdFlowRadio = page.getByRole('radio', { name: 'CI/CD Flow' });
    this.trySamplePetStoreRadio = page.getByRole('radio', { name: 'Try sample pet store API file' });
    this.urlInputBox = page.locator('#api-reference-url');
    this.alertMessage = page.getByRole('alert');
  }

  async clickOnUploadDefinitionButton() {
    await this.uploadApiDefinitionButton.click();
  }

  async clickOnNewApiReferenceButton() {
    await this.newApiReferenceButton.click();
  }

  async clickOnPublishButton() {
    await this.publishButton.click();
  }

  async clickOnCancelButton() {
    await this.cancelButton.click();
  }

  // Add method to wait for modal to be visible
  async waitForModalToBeVisible() {
    await this.uploadApiDefinitionButton.waitFor({ state: 'visible', timeout: 10000 });
  }

  // Add method to wait for file upload section to be visible
  async waitForFileUploadSection() {
    await this.uploadFromMyDeviceButton.waitFor({ state: 'visible', timeout: 10000 });
  }

  // Radio button click methods
  async clickUploadApiDefinitionRadio() {
    await this.uploadApiDefinitionRadio.click();
  }

  async clickCreateFromUrlRadio() {
    await this.createFromUrlRadio.click();
  }

  async clickCicdFlowRadio() {
    await this.cicdFlowRadio.click();
  }

  async clickTrySamplePetStoreRadio() {
    await this.trySamplePetStoreRadio.click();
  }

  // URL input box fill method
  async fillUrlInputBox(url: string) {
    await this.urlInputBox.fill(url);
  }

  // Alert message methods
  async waitForAlertToBeVisible() {
    await this.alertMessage.waitFor({ state: 'visible', timeout: 60000 });
  }

  async isAlertVisible() {
    return await this.alertMessage.isVisible();
  }

  async getAlertText() {
    return await this.alertMessage.textContent();
  }
}
  