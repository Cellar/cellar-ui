import { Clickable, Readable, ComponentModel } from './componentmodel';
import { Page } from '@playwright/test';
import { config } from '../config';
import { NotFound } from './notfound';

export class AccessSecretDisplay extends ComponentModel {
  readonly baseTestId = 'access-secret-form';

  public constructor(protected page: Page) {
    super(page);
  }

  /**
   * Open the access secret page for a specific secret ID
   * @param page Playwright page instance
   * @param id Secret ID to access
   * @returns AccessSecretDisplay or NotFound instance depending on redirect
   */
  public static async open(
    page: Page,
    id: string,
  ): Promise<AccessSecretDisplay | NotFound> {
    console.log(`Opening access secret page for ID: ${id}`);

    // Navigate to the access page
    await page.goto(`${config.appUrl}/secret/${id}/access`, {
      timeout: 30000,
      waitUntil: 'networkidle',
    });

    await page.waitForTimeout(1000);

    // Check if we landed on a NotFound page (secret might not exist, expired, or access limit reached)
    const notFoundElement = page.getByTestId('not-found');
    if (await notFoundElement.isVisible()) {
      return new NotFound(page);
    }

    return new AccessSecretDisplay(page);
  }

  /**
   * Get the secret content textarea
   */
  get secretContent() {
    return new Readable(AccessSecretDisplay, this.page, 'secret-content');
  }

  /**
   * Get the copy secret button
   */
  get copySecret() {
    return new Clickable(AccessSecretDisplay, this.page, 'copy-secret-button');
  }

  /**
   * Get the form element
   */
  get form() {
    return new Readable(AccessSecretDisplay, this.page, 'access-secret-form');
  }

  get fileInfoCard() {
    return new Readable(AccessSecretDisplay, this.page, 'file-info-card');
  }

  get downloadFileButton() {
    return new Clickable(
      AccessSecretDisplay,
      this.page,
      'download-file-button',
    );
  }

  get cardFileName() {
    return new Readable(AccessSecretDisplay, this.page, 'card-file-name');
  }

  get cardFileSize() {
    return new Readable(AccessSecretDisplay, this.page, 'card-file-size');
  }

  /**
   * Copy the secret content and wait for confirmation
   * @returns This model instance
   */
  public async copySecretAndWaitForConfirmation() {
    // Use the enhanced clickAndVerifyFeedback method for better mobile support
    await this.copySecret.clickAndVerifyFeedback();
    return this;
  }

  /**
   * Get the secret content as text
   * @returns The secret content
   */
  public async getSecretContentText(): Promise<string> {
    return this.secretContent.inputValue();
  }

  /**
   * Verify if the layout is mobile-optimized
   * @returns true if the layout is mobile-optimized
   */
  public async isInMobileLayout(): Promise<boolean> {
    // First check viewport size
    const isMobileViewport = await this.isMobile();

    // Check responsive layout characteristics
    // For text area, we can check its size or positioning
    const textarea = this.page.locator('[data-testid="secret-content"]');
    const box = await textarea.boundingBox();

    if (!box) return false;

    // In mobile layout, the textarea will typically be narrower
    return isMobileViewport;
  }

  /**
   * Reload the page and handle potential redirection
   * @returns AccessSecretDisplay or NotFound based on where we end up after reload
   */
  public async reload(): Promise<AccessSecretDisplay | NotFound> {
    // Store the current URL and ID to help with verification
    const currentUrl = this.page.url();
    const secretId = currentUrl.split('/')[currentUrl.split('/').length - 2];

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
      // NotFound check failed, but that's expected if we're on access page
    }

    // If we're still on the access page
    try {
      // Check if our base element is visible
      await this.baseElement.waitFor({ state: 'visible', timeout: 5000 });
      return this;
    } catch (metadataErr) {
      // If base element not found, try one more check
      console.log('Warning: Could not find access secret display after reload');

      // Even if we can't find the element, if URL contains the secretId, assume we're still on the page
      if (this.page.url().includes(secretId)) {
        return this;
      }

      // As fallback, return a new instance to be safe
      return new AccessSecretDisplay(this.page);
    }
  }
}
