import { Clickable, Readable, ComponentModel } from './componentmodel';
import { CreateSecretForm } from './createsecret';
import { NotFound } from './notfound';
import { Page } from '@playwright/test';
import { config } from '../config';

export class SecretMetadataDisplay extends ComponentModel {
  readonly baseTestId = 'secret-metadata-display';

  public constructor(protected page: Page) {
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

    // Check if we landed on a NotFound page (secret might not exist)
    const notFoundElement = page.getByTestId('not-found');
    if (await notFoundElement.isVisible()) {
      return new NotFound(page);
    }

    return new SecretMetadataDisplay(page);
  }

  // Basic display elements
  get accessCount() {
    const accessCountLocator = this.page.locator('#access-count');
    return new Readable(SecretMetadataDisplay, this.page, accessCountLocator);
  }

  get secretId() {
    return new Readable(SecretMetadataDisplay, this.page, this.page.locator('.secretId'));
  }

  get expirationDate() {
    return new Readable(SecretMetadataDisplay, this.page, this.page.locator('.metadataText').first());
  }

  get detailsLabel() {
    return new Readable(SecretMetadataDisplay, this.page, 'details-label');
  }

  // Action buttons
  get copySecretLink() {
    return new Clickable(
      SecretMetadataDisplay,
      this.page,
      'copy-secret-link-button',
    ).withWaitForSelector('.checkmark-icon', { state: 'visible' });
  }

  get copyMetadataLink() {
    return new Clickable(
      SecretMetadataDisplay,
      this.page,
      'copy-metadata-link-button',
    ).withWaitForSelector('.checkmark-icon', { state: 'visible' });
  }

  get deleteSecretMetadata() {
    return new Clickable(SecretMetadataDisplay, this.page, 'delete-secret-button');
  }

  // Mobile-specific elements
  get actionsLine() {
    return new Readable(SecretMetadataDisplay, this.page, this.page.locator('.actionsLine'));
  }

  // Helper methods for test scenarios
  public async deleteWithConfirmation(confirm: boolean) {
    // Set up window.confirm mock to return the desired value
    await this.page.evaluate((shouldConfirm) => {
      window.confirm = () => shouldConfirm;
    }, confirm);
    
    if (confirm) {
      // When confirmed, we should be redirected to the CreateSecret page
      await this.deleteSecretMetadata.withWaitForUrl(/.*\/secret\/create/).click();
      return new CreateSecretForm(this.page);
    } else {
      // When canceled, we should stay on the same page
      await this.deleteSecretMetadata.click();
      return this;
    }
  }

  public async reload() {
    await this.page.reload();
    await this.page.waitForLoadState('networkidle');
    
    // Check if we've been redirected to NotFound page
    const notFoundElement = this.page.getByTestId('not-found');
    if (await notFoundElement.isVisible()) {
      return new NotFound(this.page);
    }
    
    return this;
  }

  public async hasMaxAccessCount(): Promise<boolean> {
    const text = await this.accessCount.getText();
    return text.includes('of');
  }

  public async getAccessCount(): Promise<number> {
    const text = await this.accessCount.getText();
    const match = text.match(/(\d+)/);
    if (match) {
      return parseInt(match[1], 10);
    }
    return 0;
  }
}
