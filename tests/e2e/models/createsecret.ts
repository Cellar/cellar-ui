import { Clickable, ComponentModel, Fillable } from './componentmodel';
import { Page } from '@playwright/test';
import { config } from '../config';
import { SecretMetadataDisplay } from './secretmetadata';

export class CreateSecretForm extends ComponentModel {
  readonly baseTestId = 'create-secret-form';

  public constructor(protected page: Page) {
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
