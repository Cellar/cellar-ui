import { test, expect } from '@playwright/test';
import { getRelativeEpoch } from 'tests/helpers/date';
import {
  accessSecret,
  createSecret,
  deleteSecret,
  getSecretMetadata,
} from 'tests/helpers/api/client';
import { ISecretMetadata } from 'tests/helpers/models/secretMetadata';
import { SecretMetadataDisplay } from 'tests/e2e/models/secretmetadata';
import { NotFound } from 'tests/e2e/models/notfound';

test.describe('secret metadata', () => {
  test.describe('with max access count', () => {
    let secretMetadata: ISecretMetadata;
    const startingAccessCount = 3;

    test.beforeEach(async () => {
      const expiration = getRelativeEpoch(24);
      secretMetadata = await createSecret(
        'Test content',
        expiration,
        startingAccessCount,
      );
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

    test('starts at 0 value', async ({ page }) => {
      const display = await SecretMetadataDisplay.open(page, secretMetadata.id);
      expect(display.accessCount.baseElement).toContainText('0 of');
    });

    test('contains max value', async ({ page }) => {
      const display = await SecretMetadataDisplay.open(page, secretMetadata.id);
      expect(display.accessCount.baseElement).toContainText(
        `of ${startingAccessCount.toString()}`,
      );
    });

    test.describe('and has been accessed once', () => {
      test('shows access count', async ({ page }) => {
        accessSecret(secretMetadata.id);

        const display = await SecretMetadataDisplay.open(
          page,
          secretMetadata.id,
        );
        expect(display.accessCount.baseElement).toContainText('1');
      });
    });

    test.describe('and access count has been reached', () => {
      test('it should redirect on refresh', async ({ page }) => {
        const display = await SecretMetadataDisplay.open(
          page,
          secretMetadata.id,
        );

        for (let i = 0; i < startingAccessCount; i++) {
          accessSecret(secretMetadata.id);
        }

        const notFound = await display.reload(NotFound);
        expect(await notFound.displayed()).toBe(true);
        expect(await display.displayed()).toBe(false);
      });
    });
  });
});
