import { expect } from '@playwright/test';
import { test } from './fixtures/apiFixture';
import { getRelativeEpoch } from 'tests/helpers/date';
import {
  accessSecret,
  createSecret,
  deleteSecret,
} from 'tests/helpers/api/client';
import { ISecretMetadata } from 'tests/helpers/models/secretMetadata';
import { SecretMetadataDisplay } from 'tests/e2e/models/secretmetadata';
import { NotFound } from 'tests/e2e/models/notfound';

test.describe('secret metadata', () => {
  test.describe('with max access count', () => {
    let secretMetadata: ISecretMetadata;
    const startingAccessCount = 3;

    test.beforeEach(async ({ page, initApi }) => {
      await initApi;

      const expiration = getRelativeEpoch(24);
      const browserName = page.context().browser()?.browserType().name();
      console.log(`Running test with browser: ${browserName}`);

      console.log(
        `Creating test secret with expiration: ${expiration} and access limit: ${startingAccessCount}`,
      );

      secretMetadata = await createSecret(
        'Test content',
        expiration,
        startingAccessCount,
      );

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
      const display = await SecretMetadataDisplay.open(page, secretMetadata.id);

      // For non-WebKit browsers, verify through UI
      if (browserName !== 'webkit') {
        const notFound = new NotFound(page);
        expect(await notFound.displayed()).toBe(
          false,
          'Secret page was not found - got 404 page instead',
        );
        expect(display.accessCount.baseElement).toContainText('0 of');
      }

      await verifySecretAccess(secretMetadata.id, 0, startingAccessCount);
    });

    test('contains max value', async ({
      page,
      verifySecretAccess,
      browserName,
    }) => {
      const display = await SecretMetadataDisplay.open(page, secretMetadata.id);

      // For non-WebKit browsers, verify through UI
      if (browserName !== 'webkit') {
        const notFound = new NotFound(page);
        expect(await notFound.displayed()).toBe(
          false,
          'Secret page was not found - got 404 page instead',
        );
        expect(display.accessCount.baseElement).toContainText(
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

        const display = await SecretMetadataDisplay.open(
          page,
          secretMetadata.id,
        );

        // For non-WebKit browsers, verify through UI
        if (browserName !== 'webkit') {
          const notFound = new NotFound(page);
          expect(await notFound.displayed()).toBe(
            false,
            'Secret page was not found - got 404 page instead',
          );
          expect(display.accessCount.baseElement).toContainText('1');
        }

        await verifySecretAccess(secretMetadata.id, 1, startingAccessCount);
      });
    });

    test.describe('and access count has been reached', () => {
      test('it should redirect on refresh', async ({
        page,
        verifySecretAccess,
      }) => {
        const display = await SecretMetadataDisplay.open(
          page,
          secretMetadata.id,
        );

        for (let i = 0; i < startingAccessCount; i++) {
          await accessSecret(secretMetadata.id);
        }

        await verifySecretAccess(
          secretMetadata.id,
          startingAccessCount,
          startingAccessCount,
        );

        const notFound = await display.reload(NotFound);
        expect(await notFound.displayed()).toBe(true);
        expect(await display.displayed()).toBe(false);
      });
    });
  });
});
