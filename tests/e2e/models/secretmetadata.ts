import {
  Clickable,
  Readable,
  ComponentModel,
} from 'tests/e2e/models/componentmodel';
import { CreateSecretForm } from 'tests/e2e/models/createsecret';
import { Page } from '@playwright/test';
import { config } from 'tests/e2e/config';

export class SecretMetadataDisplay extends ComponentModel {
  readonly baseTestId = 'secret-metadata-display';

  protected constructor(protected page: Page) {
    super(page);
  }

  public static async open(page: Page, id: string) {
    await page.goto(`${config.appUrl}/secret/${id}`);
    return new SecretMetadataDisplay(page);
  }

  get accessCount() {
    return new Readable(SecretMetadataDisplay, this.page, 'access-count');
  }

  get copySecretLink() {
    return new Clickable(
      SecretMetadataDisplay,
      this.page,
      'copy-secret-link-button',
    );
  }

  get copyMetadataLink() {
    return new Clickable(
      SecretMetadataDisplay,
      this.page,
      'copy-metadata-link-button',
    );
  }

  get deleteSecretMetadata() {
    return new Clickable(CreateSecretForm, this.page, 'delete-secret-button');
  }
}
