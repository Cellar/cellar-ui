import {
  Clickable,
  ComponentModel,
  Fillable,
} from 'tests/e2e/models/componentmodel';
import { Page } from '@playwright/test';
import { config } from 'tests/e2e/config';
import { SecretMetadataDisplay } from 'tests/e2e/models/secretmetadata';

export class CreateSecretForm extends ComponentModel {
  readonly baseTestId = 'create-secret-form';

  protected constructor(protected page: Page) {
    super(page);
  }

  public static async open(page: Page) {
    await page.goto(`${config.appUrl}/secret/create`);
    return new CreateSecretForm(page);
  }

  get secretContent() {
    return new Fillable(CreateSecretForm, this.page, 'secret-content');
  }

  get createSecretButton() {
    return new Clickable(
      SecretMetadataDisplay,
      this.page,
      'create-secret-button',
    );
  }

  public async createSecret(content: string) {
    await this.secretContent.fill(content);
    return await this.createSecretButton
      .withWaitForUrl(/\/secret\/(?!create$).+/)
      .withWaitForLoadState('load')
      .click();
  }
}
