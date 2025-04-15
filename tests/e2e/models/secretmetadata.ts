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
    console.log(`Opening secret metadata page for ID: ${id}`);

    try {
      const response = await page.request.get(
        `${config.apiUrl}/v1/secrets/${id}`,
      );
      if (!response.ok()) {
        console.error(
          `Error checking secret metadata for ${id}: Status ${response.status()}`,
        );
      } else {
        console.log(`Secret metadata for ${id} exists in API`);
      }
    } catch (error) {
      console.error(`Exception checking secret metadata: ${error}`);
    }

    await page.goto(`${config.appUrl}/secret/${id}`, {
      timeout: 30000,
      waitUntil: 'networkidle',
    });

    // Log the current URL to see if we got redirected
    console.log(`Current URL after navigation: ${page.url()}`);

    await page.waitForTimeout(1000);

    return new SecretMetadataDisplay(page);
  }

  get accessCount() {
    const accessCountLocator = this.page.locator('#access-count');
    console.log('Using ID selector for access count: #access-count');

    return new Readable(SecretMetadataDisplay, this.page, accessCountLocator);
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
