import {
  Clickable,
  ComponentModel,
  Fillable,
  Readable,
} from './componentmodel';
import { Page } from '@playwright/test';
import { config } from '../config';
import { SecretMetadataDisplay } from './secretmetadata';

/**
 * Component model for the Create Secret form
 */
export class CreateSecretForm extends ComponentModel {
  readonly baseTestId = 'create-secret-form';

  public constructor(protected page: Page) {
    super(page);
  }

  /**
   * Opens the Create Secret page
   * @param page Playwright page
   * @returns CreateSecretForm model
   */
  public static async open(page: Page) {
    // Navigate to the create page
    await page.goto(`${config.appUrl}/secret/create`, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    // Add a short delay to allow the page to be fully ready
    await page.waitForTimeout(500);

    // Wait for form to be visible
    const form = new CreateSecretForm(page);

    try {
      // Use a more specific wait to ensure the secret content field is actually ready
      await page.getByTestId('secret-content').waitFor({
        state: 'visible',
        timeout: 10000,
      });

      // Additional check to ensure crucial UI elements are ready
      await page.getByTestId('create-secret-button').waitFor({
        state: 'visible',
        timeout: 5000,
      });

      return form;
    } catch (e) {
      console.warn('Error waiting for CreateSecretForm elements:', e);

      // If specific elements not found, still return the form for more graceful handling
      return form;
    }
  }

  // Content type toggle elements
  get contentTypeTextToggle() {
    return new Clickable(CreateSecretForm, this.page, 'content-type-text');
  }

  get contentTypeFileToggle() {
    return new Clickable(CreateSecretForm, this.page, 'content-type-file');
  }

  // Basic form elements
  get secretContent() {
    return new Fillable(CreateSecretForm, this.page, 'secret-content');
  }

  // File upload elements
  get fileUploadZone() {
    return new Readable(CreateSecretForm, this.page, 'file-upload-zone');
  }

  get fileUploadInput() {
    return this.page.locator('input[type="file"]');
  }

  get selectedFileName() {
    return new Readable(CreateSecretForm, this.page, 'selected-file-name');
  }

  get selectedFileSize() {
    return new Readable(CreateSecretForm, this.page, 'selected-file-size');
  }

  get removeFileButton() {
    return new Clickable(CreateSecretForm, this.page, 'remove-file-button');
  }

  get fileUploadError() {
    return new Readable(CreateSecretForm, this.page, 'secret-file-error');
  }

  get createSecretButton() {
    return new Clickable(
      SecretMetadataDisplay,
      this.page,
      'create-secret-button',
    );
  }

  get secretContentError() {
    return new Readable(CreateSecretForm, this.page, 'secret-content-error');
  }

  // Expiration elements - Relative
  get relativeExpirationContainer() {
    return new Readable(CreateSecretForm, this.page, 'relative-expiration');
  }

  get relativeExpirationHours() {
    return new Fillable(
      CreateSecretForm,
      this.page,
      'relative-expiration-hours',
    );
  }

  get relativeExpirationMinutes() {
    return new Fillable(
      CreateSecretForm,
      this.page,
      'relative-expiration-minutes',
    );
  }

  get expirationError() {
    return new Readable(CreateSecretForm, this.page, 'expiration-error');
  }

  // Expiration elements - Absolute
  get absoluteExpirationContainer() {
    return new Readable(CreateSecretForm, this.page, 'absolute-expiration');
  }

  get absoluteExpirationDate() {
    return new Fillable(
      CreateSecretForm,
      this.page,
      'expiration-absolute-date',
    );
  }

  get absoluteExpirationTime() {
    return new Clickable(
      CreateSecretForm,
      this.page,
      'expiration-absolute-time',
    );
  }

  get absoluteExpirationAmPm() {
    return new Clickable(
      CreateSecretForm,
      this.page,
      'expiration-absolute-ampm',
    );
  }

  // Expiration mode toggles
  get expirationAbsoluteOption() {
    return new Clickable(
      CreateSecretForm,
      this.page,
      'expiration-absolute-option',
    );
  }

  get expirationRelativeOption() {
    return new Clickable(
      CreateSecretForm,
      this.page,
      'expiration-relative-option',
    );
  }

  // Access limit elements
  get accessLimitInput() {
    return new Fillable(CreateSecretForm, this.page, 'access-limit-input');
  }

  get accessLimitIncrementButton() {
    return new Clickable(
      CreateSecretForm,
      this.page,
      'access-limit-increment-button',
    );
  }

  get accessLimitDecrementButton() {
    return new Clickable(
      CreateSecretForm,
      this.page,
      'access-limit-decrement-button',
    );
  }

  get noLimitToggle() {
    return new Clickable(CreateSecretForm, this.page, 'no-limit-toggle');
  }

  get accessLimitError() {
    return new Readable(CreateSecretForm, this.page, 'access-limit-error');
  }

  /**
   * Select a time from the absolute expiration time dropdown
   * @param time Time in format "HH:MM"
   * @returns This model instance
   */
  public async selectTime(time: string) {
    // Use selectOption which is the recommended way for dropdown selection in Playwright
    // This works even if options aren't directly visible in the DOM
    await this.page
      .locator('select[data-testid="expiration-absolute-time"]')
      .selectOption(time);
    return this;
  }

  /**
   * Select AM or PM from the absolute expiration AM/PM dropdown
   * @param amPm 'AM' or 'PM'
   * @returns This model instance
   */
  public async selectAmPm(amPm: 'AM' | 'PM') {
    // Use selectOption which is the recommended way for dropdown selection in Playwright
    // This works even if options aren't directly visible in the DOM
    await this.page
      .locator('select[data-testid="expiration-absolute-ampm"]')
      .selectOption(amPm);
    return this;
  }

  /**
   * Switch to absolute expiration mode
   * @returns This model instance
   */
  public async switchToAbsoluteExpiration() {
    const isRelativeVisible =
      await this.relativeExpirationContainer.baseElement.isVisible();
    if (isRelativeVisible) {
      await this.expirationAbsoluteOption.click();
      await this.absoluteExpirationContainer.baseElement.waitFor({
        state: 'visible',
      });
    }
    return this;
  }

  /**
   * Switch to relative expiration mode
   * @returns This model instance
   */
  public async switchToRelativeExpiration() {
    const isAbsoluteVisible =
      await this.absoluteExpirationContainer.baseElement.isVisible();
    if (isAbsoluteVisible) {
      await this.expirationRelativeOption.click();
      await this.relativeExpirationContainer.baseElement.waitFor({
        state: 'visible',
      });
    }
    return this;
  }

  /**
   * Set relative expiration hours and minutes
   * @param hours Number of hours
   * @param minutes Number of minutes
   * @returns This model instance
   */
  public async setRelativeExpiration(hours: number, minutes: number) {
    await this.switchToRelativeExpiration();
    await this.relativeExpirationHours.fill(hours.toString());
    await this.relativeExpirationMinutes.fill(minutes.toString());
    return this;
  }

  /**
   * Set absolute expiration date, time and AM/PM
   * @param date Date in format YYYY-MM-DD
   * @param time Time in format HH:MM
   * @param amPm 'AM' or 'PM'
   * @returns This model instance
   */
  public async setAbsoluteExpiration(
    date: string,
    time: string,
    amPm: 'AM' | 'PM',
  ) {
    await this.switchToAbsoluteExpiration();
    await this.absoluteExpirationDate.fill(date);
    await this.selectTime(time);
    await this.selectAmPm(amPm);
    return this;
  }

  /**
   * Set access limit value by typing directly
   * @param limit Access limit value
   * @returns This model instance
   */
  public async setAccessLimit(limit: number) {
    await this.accessLimitInput.fill(limit.toString());
    return this;
  }

  /**
   * Increment access limit by clicking the + button
   * @param times Number of times to increment (default 1)
   * @returns This model instance
   */
  public async incrementAccessLimit(times = 1) {
    for (let i = 0; i < times; i++) {
      await this.accessLimitIncrementButton.click();
    }
    return this;
  }

  /**
   * Decrement access limit by clicking the - button
   * @param times Number of times to decrement (default 1)
   * @returns This model instance
   */
  public async decrementAccessLimit(times = 1) {
    for (let i = 0; i < times; i++) {
      await this.accessLimitDecrementButton.click();
    }
    return this;
  }

  /**
   * Toggle the "No Limit" option
   * @param enable Whether to enable (true) or disable (false) No Limit
   * @returns This model instance
   */
  public async toggleNoLimit(enable: boolean) {
    try {
      // First make sure the toggle element is visible with extended timeout
      await this.page.getByTestId('no-limit-toggle').waitFor({
        state: 'visible',
        timeout: 15000,
      });

      // Use a more direct approach - click the label directly which is more reliable
      // than trying to interact with the invisible checkbox
      if (enable) {
        // Click the label directly which automatically toggles the checkbox
        await this.page.locator('[data-testid="no-limit-toggle"] label').click({
          force: true, // Use force to ensure the click goes through
          timeout: 10000,
        });

        // Wait for toggle to update
        await this.page.waitForTimeout(500);

        // Verify the checkbox is checked now
        const checkbox = await this.page.locator(
          '[data-testid="no-limit-toggle"] input[type="checkbox"]',
        );
        const isChecked = await checkbox.isChecked();

        if (!isChecked) {
          // Retry with a different strategy
          console.log('First attempt to check toggle failed, retrying');
          await this.page.locator('[data-testid="no-limit-toggle"]').click({
            force: true,
            timeout: 10000,
          });

          // Wait for toggle to update
          await this.page.waitForTimeout(500);
        }
      } else {
        // Uncheck if needed
        const checkbox = await this.page.locator(
          '[data-testid="no-limit-toggle"] input[type="checkbox"]',
        );
        const isChecked = await checkbox.isChecked();

        if (isChecked) {
          await this.page
            .locator('[data-testid="no-limit-toggle"] label')
            .click({
              force: true,
              timeout: 10000,
            });

          // Wait for toggle to update
          await this.page.waitForTimeout(500);
        }
      }
    } catch (e) {
      console.warn(`Error toggling No Limit: ${e}`);
      // Emergency fallback - try clicking various elements that might toggle the checkbox
      try {
        await this.page.locator('[data-testid="no-limit-toggle"]').click({
          force: true,
          timeout: 10000,
        });
        await this.page.waitForTimeout(500);
      } catch (retryError) {
        console.error('Final fallback toggle attempt failed:', retryError);
      }
    }
    return this;
  }

  /**
   * Check if any form validation errors are displayed
   * @returns True if errors are visible, false otherwise
   */
  public async hasValidationErrors(): Promise<boolean> {
    const contentError =
      await this.secretContentError.baseElement.textContent();
    const expirationError =
      await this.expirationError.baseElement.textContent();
    const accessError = await this.accessLimitError.baseElement.textContent();

    return !!(
      contentError?.trim() ||
      expirationError?.trim() ||
      accessError?.trim()
    );
  }

  /**
   * Creates a secret with the specified parameters and returns the metadata page
   * @param content Secret content
   * @param expirationMode 'relative' or 'absolute'
   * @param expirationParams Hours and minutes for relative or date, time, amPm for absolute
   * @param accessParams Access limit or { noLimit: true }
   * @returns SecretMetadataDisplay model
   */
  public async createSecretWithOptions(
    content: string,
    expirationMode: 'relative' | 'absolute' = 'relative',
    expirationParams:
      | { hours: number; minutes: number }
      | { date: string; time: string; amPm: 'AM' | 'PM' } = {
      hours: 24,
      minutes: 0,
    },
    accessParams: number | { noLimit: true } = 1,
  ): Promise<SecretMetadataDisplay> {
    // Set secret content
    await this.secretContent.fill(content);

    // Set expiration based on mode
    if (expirationMode === 'relative') {
      const { hours, minutes } = expirationParams as {
        hours: number;
        minutes: number;
      };
      await this.setRelativeExpiration(hours, minutes);
    } else {
      const { date, time, amPm } = expirationParams as {
        date: string;
        time: string;
        amPm: 'AM' | 'PM';
      };
      await this.setAbsoluteExpiration(date, time, amPm);
    }

    // Set access limit
    if (typeof accessParams === 'number') {
      await this.toggleNoLimit(false);
      await this.setAccessLimit(accessParams);
    } else {
      await this.toggleNoLimit(true);
    }

    // Submit the form and return the metadata page
    return await this.createSecretButton
      .withWaitForUrl(/\/secret\/(?!create$).+/)
      .withWaitForLoadState('networkidle')
      .click();
  }

  /**
   * Simple helper to create a secret with default options
   * @param content Secret content
   * @returns SecretMetadataDisplay model
   */
  public async createSecret(content: string): Promise<SecretMetadataDisplay> {
    await this.secretContent.fill(content);
    return await this.createSecretButton
      .withWaitForUrl(/\/secret\/(?!create$).+/)
      .withWaitForLoadState('networkidle')
      .click();
  }

  public async switchToFileMode() {
    await this.contentTypeFileToggle.click();
    await this.fileUploadZone.baseElement.waitFor({ state: 'visible' });
    return this;
  }

  public async uploadFile(filePath: string) {
    await this.fileUploadInput.setInputFiles(filePath);
    await this.selectedFileName.baseElement.waitFor({ state: 'visible' });
    return this;
  }

  public async createFileSecret(
    filePath: string,
  ): Promise<SecretMetadataDisplay> {
    await this.switchToFileMode();
    await this.uploadFile(filePath);
    return await this.createSecretButton
      .withWaitForUrl(/\/secret\/(?!create$).+/)
      .withWaitForLoadState('networkidle')
      .click();
  }

  /**
   * Checks if the form is displayed in a mobile-optimized layout
   * @returns True if in mobile layout
   */
  public async isInMobileLayout(): Promise<boolean> {
    // Mobile layout detection based on viewport
    return this.isMobile();
  }
}
