import { expect } from '@playwright/test';
import { test } from './fixtures/apiFixture';
import { getRelativeEpoch } from '../helpers/date';
import {
  accessSecret,
  createSecret,
  deleteSecret,
} from '../helpers/api/client';
import { ISecretMetadata } from '../helpers/models/secretMetadata';
import { SecretMetadataDisplay } from './models/secretmetadata';

test.describe('secret metadata', () => {
  test.describe('with max access count', () => {
    let secretMetadata: ISecretMetadata;
    const startingAccessCount = 3;

    test.beforeEach(async ({ page, initApi }) => {
      await initApi();

      const expiration = getRelativeEpoch(24);
      const browserName = page.context().browser()?.browserType().name();
      console.log(`Running test with browser: ${browserName}`);

      console.log(
        `Creating test secret with expiration: ${expiration} and access limit: ${startingAccessCount}`,
      );

      const result = await createSecret(
        'Test content',
        expiration,
        startingAccessCount,
      );

      // Check if the result is an API error
      if ('error' in result) {
        throw new Error(`Failed to create secret: ${result.error}`);
      }

      secretMetadata = result as ISecretMetadata;

      console.log(`Created secret with ID: ${secretMetadata.id}`);

      if (!secretMetadata.id) {
        throw new Error('Failed to create secret for testing');
      }

      await page.waitForTimeout(500);
    });

    test.afterEach(async () => {
      if (secretMetadata?.id) {
        try {
          await deleteSecret(secretMetadata.id);
        } catch {
          // ignore
        }
      }
    });

    test('starts at 0 value', async ({
      page,
      verifySecretAccess,
      browserName,
    }) => {
      // Open the secret metadata page
      await SecretMetadataDisplay.open(page, secretMetadata.id);

      // For non-WebKit browsers, verify through UI
      if (browserName !== 'webkit') {
        // Check that we're not on the NotFound page
        const notFoundElement = page.getByTestId('not-found');
        expect(await notFoundElement.isVisible()).toBe(false);
        await expect(page.locator('#access-count')).toContainText('0 of');
      }

      await verifySecretAccess(secretMetadata.id, 0, startingAccessCount);
    });

    test('contains max value', async ({
      page,
      verifySecretAccess,
      browserName,
    }) => {
      // Open the secret metadata page
      await SecretMetadataDisplay.open(page, secretMetadata.id);

      // For non-WebKit browsers, verify through UI
      if (browserName !== 'webkit') {
        // Check that we're not on the NotFound page
        const notFoundElement = page.getByTestId('not-found');
        expect(await notFoundElement.isVisible()).toBe(false);
        await expect(page.locator('#access-count')).toContainText(
          `of ${startingAccessCount.toString()}`,
        );
      }

      await verifySecretAccess(secretMetadata.id, 0, startingAccessCount);
    });

    test.describe('and has been accessed once', () => {
      test('shows access count', async ({
        page,
        verifySecretAccess,
        browserName,
      }) => {
        await accessSecret(secretMetadata.id);

        // Open the secret metadata page
        await SecretMetadataDisplay.open(page, secretMetadata.id);

        // For non-WebKit browsers, verify through UI
        if (browserName !== 'webkit') {
          // Check that we're not on the NotFound page
          const notFoundElement = page.getByTestId('not-found');
          expect(await notFoundElement.isVisible()).toBe(false);
          await expect(page.locator('#access-count')).toContainText('1');
        }

        await verifySecretAccess(secretMetadata.id, 1, startingAccessCount);
      });
    });

    test.describe('and access count has been reached', () => {
      test('it should redirect on refresh', async ({
        page,
        verifySecretAccess,
      }) => {
        // Open the secret metadata page
        await SecretMetadataDisplay.open(page, secretMetadata.id);

        // Store the locator for the secret metadata element to check later
        const secretMetadataElement = page.getByTestId(
          'secret-metadata-display',
        );

        for (let i = 0; i < startingAccessCount; i++) {
          await accessSecret(secretMetadata.id);
        }

        await verifySecretAccess(
          secretMetadata.id,
          startingAccessCount,
          startingAccessCount,
        );

        // Reload the page and check if we're redirected to NotFound
        await page.reload();
        await page.waitForLoadState();

        // We should now be on the NotFound page
        const notFoundElement = page.getByTestId('not-found');
        expect(await notFoundElement.isVisible()).toBe(true);

        // And the secret metadata display should no longer be visible
        expect(await secretMetadataElement.isVisible()).toBe(false);
      });
    });
  });
});
