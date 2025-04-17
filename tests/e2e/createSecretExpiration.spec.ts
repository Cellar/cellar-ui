import { test } from './fixtures/apiFixture';
import { expect } from '@playwright/test';
import { CreateSecretForm } from './models/createsecret';
import { format, addDays } from 'date-fns';

/**
 * E2E tests for the Create Secret page - Expiration Settings
 */
test.describe('when using expiration settings on the create secret page', () => {
  test.describe('with relative expiration (default)', () => {
    test('it should display hours and minutes inputs', async ({
      page,
      browserName,
    }) => {
      // Skip WebKit browsers due to security restrictions
      test.skip(
        browserName === 'webkit',
        'This test is skipped in WebKit due to security restrictions',
      );

      const form = await CreateSecretForm.open(page);

      // Verify relative expiration is shown by default
      const isRelativeVisible =
        await form.relativeExpirationContainer.baseElement.isVisible();
      expect(isRelativeVisible).toBe(true);

      // Verify hours and minutes inputs are visible
      await form.relativeExpirationHours.baseElement.waitFor({
        state: 'visible',
      });
      await form.relativeExpirationMinutes.baseElement.waitFor({
        state: 'visible',
      });
      expect(await form.relativeExpirationHours.baseElement.isVisible()).toBe(
        true,
      );
      expect(await form.relativeExpirationMinutes.baseElement.isVisible()).toBe(
        true,
      );
    });

    test('it should default to 24 hours from now', async ({
      page,
      browserName,
    }) => {
      // Skip WebKit browsers due to security restrictions
      test.skip(
        browserName === 'webkit',
        'This test is skipped in WebKit due to security restrictions',
      );

      const form = await CreateSecretForm.open(page);

      // Verify default hours is 24
      const hoursValue =
        await form.relativeExpirationHours.baseElement.inputValue();
      const minutesValue =
        await form.relativeExpirationMinutes.baseElement.inputValue();

      // Should be around 24 hours and 0 minutes (might vary slightly due to page load time)
      expect(parseInt(hoursValue, 10)).toBeCloseTo(24, 1);
      expect(parseInt(minutesValue, 10)).toBeLessThanOrEqual(60);
      expect(parseInt(minutesValue, 10)).toBeGreaterThanOrEqual(0);
    });

    test('it should update expiration when changing hours and minutes', async ({
      page,
      browserName,
    }) => {
      // Skip WebKit browsers due to security restrictions
      test.skip(
        browserName === 'webkit',
        'This test is skipped in WebKit due to security restrictions',
      );

      const form = await CreateSecretForm.open(page);

      // Set hours and minutes to specific values
      await form.setRelativeExpiration(5, 30);

      // Verify values were updated
      const hoursValue =
        await form.relativeExpirationHours.baseElement.inputValue();
      const minutesValue =
        await form.relativeExpirationMinutes.baseElement.inputValue();
      expect(parseInt(hoursValue, 10)).toBe(5);
      expect(parseInt(minutesValue, 10)).toBe(30);
    });
  });

  test.describe('with absolute expiration', () => {
    test('it should display date, time and AM/PM inputs', async ({
      page,
      browserName,
    }) => {
      // Skip WebKit browsers due to security restrictions
      test.skip(
        browserName === 'webkit',
        'This test is skipped in WebKit due to security restrictions',
      );

      const form = await CreateSecretForm.open(page);

      // Switch to absolute expiration
      await form.switchToAbsoluteExpiration();

      // Verify absolute inputs are visible
      await form.absoluteExpirationDate.baseElement.waitFor({
        state: 'visible',
      });
      await form.absoluteExpirationTime.baseElement.waitFor({
        state: 'visible',
      });
      await form.absoluteExpirationAmPm.baseElement.waitFor({
        state: 'visible',
      });

      expect(await form.absoluteExpirationDate.baseElement.isVisible()).toBe(
        true,
      );
      expect(await form.absoluteExpirationTime.baseElement.isVisible()).toBe(
        true,
      );
      expect(await form.absoluteExpirationAmPm.baseElement.isVisible()).toBe(
        true,
      );
    });

    test('it should be able to set a future date and time', async ({
      page,
      browserName,
    }) => {
      // Skip WebKit browsers due to security restrictions
      test.skip(
        browserName === 'webkit',
        'This test is skipped in WebKit due to security restrictions',
      );

      const form = await CreateSecretForm.open(page);

      // Switch to absolute expiration
      await form.switchToAbsoluteExpiration();

      // Get tomorrow's date
      const tomorrow = addDays(new Date(), 1);
      const formattedDate = format(tomorrow, 'yyyy-MM-dd');

      // Set absolute expiration to tomorrow at 10:00 AM
      await form.setAbsoluteExpiration(formattedDate, '10:00', 'AM');

      // Create a test secret to verify no validation errors
      const testContent = 'Absolute expiration test ' + Date.now();
      await form.secretContent.fill(testContent);
      await form.createSecretButton.click();

      // Check we're redirected to metadata page (meaning form submission was successful)
      expect(page.url()).toMatch(/\/secret\/[a-zA-Z0-9-]+$/);
    });
  });

  test.describe('when switching between expiration modes', () => {
    test('it should switch from relative to absolute', async ({
      page,
      browserName,
    }) => {
      // Skip WebKit browsers due to security restrictions
      test.skip(
        browserName === 'webkit',
        'This test is skipped in WebKit due to security restrictions',
      );

      const form = await CreateSecretForm.open(page);

      // Verify we start with relative expiration
      const initialRelativeVisible =
        await form.relativeExpirationContainer.baseElement.isVisible();
      expect(initialRelativeVisible).toBe(true);

      // Switch to absolute expiration
      await form.switchToAbsoluteExpiration();

      // Verify absolute inputs are now visible and relative are hidden
      const absVisible =
        await form.absoluteExpirationContainer.baseElement.isVisible();
      const relVisible =
        await form.relativeExpirationContainer.baseElement.isVisible();
      expect(absVisible).toBe(true);
      expect(relVisible).toBe(false);
    });

    test('it should switch from absolute to relative', async ({
      page,
      browserName,
    }) => {
      // Skip WebKit browsers due to security restrictions
      test.skip(
        browserName === 'webkit',
        'This test is skipped in WebKit due to security restrictions',
      );

      const form = await CreateSecretForm.open(page);

      // Switch to absolute first
      await form.switchToAbsoluteExpiration();

      // Verify we're in absolute mode
      const absVisible =
        await form.absoluteExpirationContainer.baseElement.isVisible();
      expect(absVisible).toBe(true);

      // Switch back to relative
      await form.switchToRelativeExpiration();

      // Verify relative inputs are now visible and absolute are hidden
      const newRelVisible =
        await form.relativeExpirationContainer.baseElement.isVisible();
      const newAbsVisible =
        await form.absoluteExpirationContainer.baseElement.isVisible();
      expect(newRelVisible).toBe(true);
      expect(newAbsVisible).toBe(false);
    });
  });

  test.describe('when entering invalid expiration values', () => {
    test('it should show error for expiration less than 30 minutes', async ({
      page,
      browserName,
    }) => {
      // Skip WebKit browsers due to security restrictions
      test.skip(
        browserName === 'webkit',
        'This test is skipped in WebKit due to security restrictions',
      );

      const form = await CreateSecretForm.open(page);

      // Set expiration to less than 30 minutes
      await form.setRelativeExpiration(0, 10);

      // Enter content so that's not the validation error
      await form.secretContent.fill('Too soon expiration test');

      // Try to submit
      await form.createSecretButton.click();

      // Verify error message appears
      const errorMessage = await form.expirationError.baseElement.textContent();
      expect(errorMessage?.trim()).toBeTruthy();
    });
  });
});
