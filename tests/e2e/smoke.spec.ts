import { test, expect } from '@playwright/test';
import { config } from './config';
import { getRelativeEpoch } from '../helpers/date';
import {
  createSecret,
  deleteSecret,
  getSecretMetadata,
} from '../helpers/api/client';
import { ISecretMetadata } from '../helpers/models/secretMetadata';
import { CreateSecretForm } from './models/createsecret';
import { SecretMetadataDisplay } from './models/secretmetadata';
import { AccessSecretDisplay } from './models/accesssecret';

test.describe('smoke test', () => {
  test.beforeEach(async ({ browserName }) => {
    // Skip entire test suite for WebKit due to API context issues in Docker
    test.skip(
      browserName === 'webkit',
      'This test is not reliable in WebKit Docker environment',
    );
  });
  test.describe('with secret', () => {
    let secretMetadata: ISecretMetadata;

    test.beforeEach(async () => {
      const expiration = getRelativeEpoch(24);
      const result = await createSecret('Test content', expiration, 1);

      // Check if the result is an API error
      if ('error' in result) {
        throw new Error(`Failed to create secret: ${result.error}`);
      }

      secretMetadata = result as ISecretMetadata;
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

    test('can navigate to metadata page', async ({ page }) => {
      await SecretMetadataDisplay.open(page, secretMetadata.id);
      expect(page.url()).toBe(`${config.appUrl}/secret/${secretMetadata.id}`);
    });

    test('can navigate to access page', async ({ page }) => {
      await AccessSecretDisplay.open(page, secretMetadata.id);
      expect(page.url()).toBe(
        `${config.appUrl}/secret/${secretMetadata.id}/access`,
      );
    });
  });

  test('can navigate to home page', async ({ page }) => {
    await page.goto(`${config.appUrl}`);
    expect(page.url().replace(/\/$/, '')).toBe(
      config.appUrl.replace(/\/$/, ''),
    );
  });

  test('can navigate to create secret page', async ({ page }) => {
    await CreateSecretForm.open(page);
    expect(page.url()).toBe(`${config.appUrl}/secret/create`);
  });

  test.describe('with secret deletion', () => {
    let id: string | null = null;

    test.afterEach(async () => {
      if (id !== null) await deleteSecret(id);
    });

    test('can create secret with defaults', async ({ page }) => {
      const secretPage = await CreateSecretForm.open(page);
      await secretPage.createSecret('Test content');

      const url = page.url();

      const idMatch = url.match(/\/secret\/([^/]+)/);
      id = idMatch ? idMatch[1] : null;

      expect(id).not.toBeNull();

      if (id !== null) {
        const result = await getSecretMetadata(id);

        // Check if the result is an API error
        if ('error' in result) {
          throw new Error(`Failed to get secret metadata: ${result.error}`);
        }

        const secretMetadata = result as ISecretMetadata;
        expect(secretMetadata.id).toBe(id);
        expect(secretMetadata.access_limit).toBe(1);
        expect(secretMetadata.access_count).toBe(0);
        expect(secretMetadata.expiration).toBeTruthy();
      }
    });
  });
});
