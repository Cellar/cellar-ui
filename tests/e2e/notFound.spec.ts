import { expect, test } from '@playwright/test';
import { NotFound } from './models/notfound';
import { CreateSecretForm } from './models/createsecret';

test.describe('Not Found Page', () => {
  // Skip all WebKit tests due to persistent issues
  test.beforeEach(async ({ browserName }) => {
    test.skip(
      browserName === 'webkit',
      'Skipping WebKit tests in Docker due to persistent API context issues',
    );
  });
  test.describe('When loaded directly', () => {
    test('it should display the correct header', async ({ page }) => {
      const notFound = await NotFound.open(page);
      await expect(notFound.header.baseElement).toContainText(
        'No Secrets Here',
      );
    });

    test('it should display the error message about page not found', async ({
      page,
    }) => {
      const notFound = await NotFound.open(page);
      await expect(notFound.message.baseElement).toContainText(
        'Sorry, but the page you were trying',
      );
      await expect(notFound.message.baseElement).toContainText(
        'to view could not be found',
      );
    });

    test('it should display CTA text with link to create page', async ({
      page,
    }) => {
      const notFound = await NotFound.open(page);
      await expect(notFound.cta.baseElement).toContainText(
        'Click here to create a new secret',
      );
      // Verify that the link element exists and has the correct href
      await expect(page.locator('[data-testid="cta"] a')).toHaveAttribute(
        'href',
        '/secret/create',
      );
    });

    test('it should display New Secret button', async ({ page }) => {
      const notFound = await NotFound.open(page);
      await expect(notFound.newSecretButton.baseElement).toBeVisible();
    });

    test.describe('and interacting with buttons', () => {
      test('it should successfully click the New Secret button', async ({
        page,
      }) => {
        const notFound = await NotFound.open(page);

        await notFound.newSecretButton.baseElement.click();
        await page.waitForURL('**/secret/create', { timeout: 10000 });

        const createForm = new CreateSecretForm(page);
        await createForm.expectVisible();
        expect(page.url()).toContain('/secret/create');
      });

      test('it should successfully click the link in CTA text', async ({
        page,
      }) => {
        const notFound = await NotFound.open(page);

        await page.locator('[data-testid="cta"] a').click();
        await page.waitForURL('**/secret/create', { timeout: 10000 });

        const createForm = new CreateSecretForm(page);
        await createForm.expectVisible();
        expect(page.url()).toContain('/secret/create');
      });

      test('it should verify buttons are not blocked by footer', async ({
        page,
      }) => {
        const notFound = await NotFound.open(page);

        const isBlocked = await notFound.isFooterBlockingInteraction();
        expect(isBlocked).toBe(false);
      });

      test('it should allow clicking through to buttons without force', async ({
        page,
      }) => {
        const notFound = await NotFound.open(page);

        const canClick = await notFound.canClickButton();
        expect(canClick).toBe(true);
      });
    });
  });

  test.describe('When navigating to an invalid secret', () => {
    test('it should display Not Found page for invalid secret ID', async ({
      page,
    }) => {
      // Try to access a secret with an invalid ID
      const invalidId = 'invalid-secret-id-123';
      const notFound = await NotFound.openWithInvalidId(page, invalidId);

      // Verify we see the Not Found page
      await notFound.expectVisible();
      await expect(notFound.header.baseElement).toContainText(
        'No Secrets Here',
      );
    });
  });

  test.describe('When viewed on different screen sizes', () => {
    test('it should adapt layout for mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 400, height: 800 });

      const notFound = await NotFound.open(page);
      await notFound.expectVisible();

      // Check if model reports mobile viewport correctly
      expect(await notFound.isMobile()).toBe(true);

      // Visual verification could go here if needed
      await expect(notFound.header.baseElement).toContainText(
        'No Secrets Here',
      );
    });
  });
});
