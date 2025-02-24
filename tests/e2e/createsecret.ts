import { Clickable, ComponentModel, Fillable } from './componentmodel';
import { Page } from '@playwright/test';
import { config } from 'tests/e2e/config';

export async function goToCreateSecretPage(page: Page) {
  await page.goto(`${config.appUrl}`);
  return new CreateSecretForm(page);
}

export class CreateSecretForm extends ComponentModel {
  readonly baseTestId = 'create-secret-form';

  readonly secretContent = new Fillable(
    CreateSecretForm,
    this.page,
    'secret-content',
  );

  readonly createSecretButton = new Clickable(
    SecretMetadataDisplay,
    this.page,
    'create-secret-button',
  );
}

export class SecretMetadataDisplay extends ComponentModel {
  readonly baseTestId = 'secret-metadata-display';
}
