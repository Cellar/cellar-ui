import { test } from './fixtures/apiFixture';
import { expect } from '@playwright/test';
import { CreateSecretForm } from './models/createsecret';
import { SecretMetadataDisplay } from './models/secretmetadata';
import { getRelativeEpoch, format, addDays } from '../helpers/date';

/**
 * E2E tests for the Create Secret page
 */
test.describe('when opening the create secret page', () => {
  test('it should display the form with default values', async ({
    page,
    browserName,
  }) => {
    // Skip WebKit browsers due to security restrictions
    test.skip(
      browserName === 'webkit',
      'This test is skipped in WebKit due to security restrictions',
    );

    const form = await CreateSecretForm.open(page);

    // Verify base form is visible
    await form.expectVisible();

    // Verify relative expiration is shown by default
    const isRelativeVisible =
      await form.relativeExpirationContainer.baseElement.isVisible();
    expect(isRelativeVisible).toBe(true);

    // Verify access limit defaults to 1
    const accessLimitValue =
      await form.accessLimitInput.baseElement.inputValue();
    expect(accessLimitValue).toBe('1');
  });

  test('it should have a secret content textarea', async ({
    page,
    browserName,
  }) => {
    // Skip WebKit browsers due to security restrictions
    test.skip(
      browserName === 'webkit',
      'This test is skipped in WebKit due to security restrictions',
    );

    const form = await CreateSecretForm.open(page);

    // Verify secret content textarea is visible
    await form.secretContent.baseElement.waitFor({ state: 'visible' });
    expect(await form.secretContent.baseElement.isVisible()).toBe(true);
  });

  test('it should have a "Create Secret" button', async ({
    page,
    browserName,
  }) => {
    // Skip WebKit browsers due to security restrictions
    test.skip(
      browserName === 'webkit',
      'This test is skipped in WebKit due to security restrictions',
    );

    const form = await CreateSecretForm.open(page);

    // Verify create button is visible
    await form.createSecretButton.baseElement.waitFor({ state: 'visible' });
    expect(await form.createSecretButton.baseElement.isVisible()).toBe(true);
  });

  test.describe('when entering secret content', () => {
    test('it should accept and display the entered text', async ({
      page,
      browserName,
    }) => {
      // Skip WebKit browsers due to security restrictions
      test.skip(
        browserName === 'webkit',
        'This test is skipped in WebKit due to security restrictions',
      );

      const form = await CreateSecretForm.open(page);
      const testContent = 'Test secret content ' + Date.now();

      // Enter content and verify it's displayed
      await form.secretContent.fill(testContent);
      const displayedContent =
        await form.secretContent.baseElement.inputValue();
      expect(displayedContent).toBe(testContent);
    });

    test('it should validate empty content with an error message', async ({
      page,
      browserName,
    }) => {
      // Skip WebKit browsers due to security restrictions
      test.skip(
        browserName === 'webkit',
        'This test is skipped in WebKit due to security restrictions',
      );

      const form = await CreateSecretForm.open(page);

      // Leave content empty and try to submit
      await form.secretContent.fill('');
      await form.createSecretButton.click();

      // Check for error message
      const errorMessage =
        await form.secretContentError.baseElement.textContent();
      expect(errorMessage?.trim()).toBeTruthy();
    });
  });

  test.describe('when submitting the form with valid data', () => {
    test('it should create a secret and redirect to the metadata page', async ({
      page,
      browserName,
    }) => {
      // Skip WebKit browsers due to security restrictions
      test.skip(
        browserName === 'webkit',
        'This test is skipped in WebKit due to security restrictions',
      );

      const form = await CreateSecretForm.open(page);
      const testContent = 'Valid secret content ' + Date.now();

      // Complete the form with valid data
      const metadata = await form.createSecret(testContent);

      // Verify we're redirected to the metadata page
      expect(metadata).toBeInstanceOf(SecretMetadataDisplay);
      expect(page.url()).toMatch(/\/secret\/[a-zA-Z0-9-]+$/);
    });
  });

  test.describe('and on mobile devices', () => {
    test('it should display a mobile-optimized layout', async ({
      page,
      browserName,
    }) => {
      // Skip non-mobile devices
      const form = await CreateSecretForm.open(page);
      const isMobile = await form.isMobile();

      test.skip(!isMobile, 'This test is only relevant for mobile viewports');

      // Check for mobile layout
      const isInMobileLayout = await form.isInMobileLayout();
      expect(isInMobileLayout).toBe(true);

      // The textarea should be responsive with appropriate height for mobile
      const textarea = page.locator('[data-testid="secret-content"]');
      const box = await textarea.boundingBox();

      expect(box).not.toBeNull();

      if (box) {
        // On mobile the width should be appropriate for the viewport
        const viewport = page.viewportSize();
        if (viewport) {
          // The textarea should be slightly narrower than the viewport
          expect(box.width).toBeLessThanOrEqual(viewport.width);
        }
      }
    });
  });
});
