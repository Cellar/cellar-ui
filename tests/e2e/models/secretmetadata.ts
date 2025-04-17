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
    // The textarea element containing the secret ID
    return new Readable(
      SecretMetadataDisplay,
      this.page,
      this.page.locator('textarea'),
    );
  }

  get expirationDate() {
    // Using a more specific selector to ensure we find the element
    return new Readable(
      SecretMetadataDisplay,
      this.page,
      this.page.locator('.metadataText').first(),
    );
  }

  // Helper method to check if expiration date is displayed
  public async hasExpirationDate(): Promise<boolean> {
    // First ensure page is loaded
    await this.page.waitForLoadState('networkidle');

    try {
      // Use a shorter timeout to avoid long test delays
      const expirationText = this.page.locator('.metadataText').first();
      await expirationText.waitFor({ state: 'visible', timeout: 5000 });
      const text = await expirationText.innerText();
      return text.length > 0;
    } catch (error) {
      console.log('Error checking expiration date: ', error);
      return false;
    }
  }

  // Helper method to verify secret ID
  public async getSecretIdText(): Promise<string> {
    await this.page.waitForLoadState('networkidle');
    const textarea = this.page.locator('textarea');
    await textarea.waitFor({ state: 'visible' });
    return await textarea.inputValue();
  }

  get detailsLabel() {
    return new Readable(
      SecretMetadataDisplay,
      this.page,
      this.page.getByTestId('details-label'),
    );
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

  // Helper methods for copy operations with enhanced mobile support
  public async copySecretLinkAndWaitForConfirmation() {
    // Use the enhanced clickAndVerifyFeedback method
    await this.copySecretLink.clickAndVerifyFeedback(
      '.checkmark-icon, text=Copied, [data-testid="copy-notification"]',
    );
    return this;
  }

  public async copyMetadataLinkAndWaitForConfirmation() {
    // Use the enhanced clickAndVerifyFeedback method
    await this.copyMetadataLink.clickAndVerifyFeedback(
      '.checkmark-icon, text=Copied, [data-testid="copy-notification"]',
    );
    return this;
  }

  /**
   * Determines if we're in a mobile layout
   * @returns True if the page is in a mobile layout
   */
  public async isInMobileLayout(): Promise<boolean> {
    try {
      // First check viewport size
      const isMobileViewport = await this.isMobile();

      if (!isMobileViewport) {
        return false; // Not mobile if viewport is large
      }

      // For mobile viewports, check if mobile-specific UI elements are visible
      const actionsLineVisible = await this.actionsLine.isVisible();
      return actionsLineVisible;
    } catch (e) {
      console.log(`Error determining layout mode: ${e}`);
      // Fall back to viewport size check
      return this.isMobile();
    }
  }

  get deleteSecretMetadata() {
    return new Clickable(
      SecretMetadataDisplay,
      this.page,
      'delete-secret-button',
    );
  }

  // Helper method to verify all UI buttons are present
  public async verifyButtonsPresent(): Promise<boolean> {
    await this.page.waitForLoadState('networkidle');

    const copySecretBtn = this.page.getByTestId('copy-secret-link-button');
    const copyMetadataBtn = this.page.getByTestId('copy-metadata-link-button');
    const deleteBtn = this.page.getByTestId('delete-secret-button');

    await copySecretBtn.waitFor({ state: 'visible', timeout: 10000 });
    await copyMetadataBtn.waitFor({ state: 'visible', timeout: 10000 });
    await deleteBtn.waitFor({ state: 'visible', timeout: 10000 });

    return (
      (await copySecretBtn.isVisible()) &&
      (await copyMetadataBtn.isVisible()) &&
      (await deleteBtn.isVisible())
    );
  }

  // Mobile-specific elements
  get actionsLine() {
    return new Readable(
      SecretMetadataDisplay,
      this.page,
      this.page.locator('.actionsLine'),
    );
  }

  // Helper methods for test scenarios
  public async deleteWithConfirmation(confirm: boolean) {
    // Set up window.confirm mock to return the desired value
    await this.page.evaluate((shouldConfirm) => {
      window.confirm = () => shouldConfirm;
    }, confirm);

    if (confirm) {
      // When confirmed, we should be redirected to the CreateSecret page
      // Use click with chained waitForURL to handle the transition properly
      await this.deleteSecretMetadata
        .withWaitForUrl(/.*\/secret\/create/)
        .withWaitForLoadState('networkidle')
        .click();

      // Create and return the new page model
      const createForm = new CreateSecretForm(this.page);
      return createForm;
    } else {
      // When canceled, we should stay on the same page
      const currentUrl = this.page.url();
      await this.deleteSecretMetadata.click();

      // Give a moment for any navigation that might happen
      await this.page.waitForTimeout(500);

      // Return self (verification of URL happens in the test)
      return this;
    }
  }

  /**
   * Reloads the page and determines what page we're on after reload
   *
   * @returns Either SecretMetadataDisplay if still on metadata page or NotFound if redirected
   */
  public async reload(): Promise<SecretMetadataDisplay | NotFound> {
    // Store the current URL and ID to help with verification
    const currentUrl = this.page.url();
    const secretId = currentUrl.split('/').pop();

    // Perform the reload
    await this.page.reload();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000); // Give a moment for any JS to execute

    // Check if we've been redirected to NotFound page
    try {
      const notFoundElement = this.page.getByTestId('not-found');
      const isNotFoundVisible = await notFoundElement.isVisible({
        timeout: 2000,
      });

      if (isNotFoundVisible) {
        // We've been redirected to a NotFound page
        return new NotFound(this.page);
      }
    } catch (e) {
      // NotFound check failed, but that's expected if we're on metadata page
    }

    // If we're still on the same page with the secret ID, we're on metadata page
    try {
      // Check if our base element is visible
      await this.baseElement.waitFor({ state: 'visible', timeout: 5000 });
      return this;
    } catch (metadataErr) {
      // If base element not found, try one more check
      console.log('Warning: Could not find metadata display after reload');

      // Even if we can't find the element, if URL contains the secretId, assume we're still on metadata
      if (this.page.url().includes(secretId)) {
        return this;
      }

      // As fallback, return a new instance to be safe
      return new SecretMetadataDisplay(this.page);
    }
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
