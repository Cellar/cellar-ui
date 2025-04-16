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
    // The textarea element might have a different class in the actual DOM
    return new Readable(SecretMetadataDisplay, this.page, this.page.locator('textarea'));
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
    );
  }

  get copyMetadataLink() {
    return new Clickable(
      SecretMetadataDisplay,
      this.page,
      'copy-metadata-link-button',
    );
  }
  
  // Helper methods for copy operations
  public async copySecretLinkAndWaitForConfirmation() {
    await this.copySecretLink.click();
    // Wait for the copy confirmation to appear
    await this.page.waitForSelector('.checkmark-icon, text=Copied', { state: 'visible', timeout: 5000 });
    return this;
  }
  
  public async copyMetadataLinkAndWaitForConfirmation() {
    await this.copyMetadataLink.click();
    // Wait for the copy confirmation to appear
    await this.page.waitForSelector('.checkmark-icon, text=Copied', { state: 'visible', timeout: 5000 });
    return this;
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
      await this.deleteSecretMetadata.click();
      
      // Wait explicitly for navigation to the create page
      await this.page.waitForURL(/.*\/secret\/create/, { timeout: 10000 });
      await this.page.waitForLoadState('networkidle');
      
      const createForm = new CreateSecretForm(this.page);
      // Wait a bit to ensure the form is fully loaded
      await this.page.waitForTimeout(500);
      return createForm;
    } else {
      // When canceled, we should stay on the same page
      await this.deleteSecretMetadata.click();
      // Wait a bit to ensure any potential navigation would have happened
      await this.page.waitForTimeout(500);
      return this;
    }
  }

  public async reload() {
    await this.page.reload();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(500); // Give it a moment to settle
    
    // Check if we've been redirected to NotFound page
    try {
      const notFoundElement = this.page.getByTestId('not-found');
      const isNotFoundVisible = await notFoundElement.isVisible({ timeout: 2000 });
      
      if (isNotFoundVisible) {
        const notFoundPage = new NotFound(this.page);
        await notFoundPage.baseElement.waitFor({ state: 'visible', timeout: 2000 });
        return notFoundPage;
      }
    } catch (e) {
      // If we get an error checking for NotFound, assume we're still on the metadata page
      console.log("Error checking for NotFound, assuming still on metadata page:", e);
    }
    
    // Wait for our own element to be visible again
    try {
      await this.baseElement.waitFor({ state: 'visible', timeout: 2000 });
    } catch (e) {
      console.log("Warning: Could not find metadata display after reload:", e);
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
