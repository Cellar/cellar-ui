import { Clickable, Readable, ComponentModel } from './componentmodel';
import { Page } from '@playwright/test';
import { config } from '../config';
import { CreateSecretForm } from './createsecret';

export class NotFound extends ComponentModel {
  readonly baseTestId = 'not-found';

  public constructor(protected page: Page) {
    super(page);
  }

  public static async open(page: Page) {
    await page.goto(`${config.appUrl}/404`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    return new NotFound(page);
  }

  public static async openWithInvalidId(page: Page, invalidId: string) {
    await page.goto(`${config.appUrl}/secret/${invalidId}`, {
      waitUntil: 'networkidle',
    });
    await page.waitForTimeout(500);
    return new NotFound(page);
  }

  get header() {
    return new Readable(NotFound, this.page, 'header');
  }

  get message() {
    return new Readable(NotFound, this.page, 'message');
  }

  get cta() {
    return new Readable(NotFound, this.page, 'cta');
  }

  get newSecretButton() {
    return new Clickable(
      CreateSecretForm,
      this.page,
      'new-secret-button',
    ).withWaitForUrl('**/secret/create');
  }

  /**
   * Clicks the "here" link in the CTA text to navigate to the create page
   * @returns CreateSecretForm model
   */
  public async clickCtaLink() {
    // Move to the cta element first to ensure visibility
    await this.cta.baseElement.hover();

    // Click the actual link within the CTA area using a more specific selector
    await this.page.locator('[data-testid="cta"] a').click();

    await this.page.waitForURL('**/secret/create', { timeout: 10000 });
    return new CreateSecretForm(this.page);
  }

  /**
   * Checks if the footer is blocking interaction with page elements
   * @returns true if footer appears to be blocking, false otherwise
   */
  public async isFooterBlockingInteraction() {
    const footerContainer = this.page.locator('.footerContainer').first();
    const newSecretButton = this.newSecretButton.baseElement;

    // Check if footer container exists and get its bounding box
    if (!(await footerContainer.isVisible())) {
      return false;
    }

    const footerBox = await footerContainer.boundingBox();
    const buttonBox = await newSecretButton.boundingBox();

    if (!footerBox || !buttonBox) {
      return false;
    }

    // Check if footer overlaps with button
    const overlaps =
      footerBox.x < buttonBox.x + buttonBox.width &&
      footerBox.x + footerBox.width > buttonBox.x &&
      footerBox.y < buttonBox.y + buttonBox.height &&
      footerBox.y + footerBox.height > buttonBox.y;

    // Also check z-index to see if footer is in front
    if (overlaps) {
      const footerZIndex = await footerContainer.evaluate(
        (el) => window.getComputedStyle(el).zIndex,
      );
      const buttonZIndex = await newSecretButton.evaluate(
        (el) => window.getComputedStyle(el).zIndex,
      );
      return (
        footerZIndex !== 'auto' &&
        parseInt(footerZIndex) > (parseInt(buttonZIndex) || 0)
      );
    }

    return false;
  }

  /**
   * Attempts to click an element at specific coordinates
   * @returns true if click succeeded, false if blocked
   */
  public async canClickButton() {
    try {
      await this.newSecretButton.baseElement.click({
        timeout: 2000,
        force: false,
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}
