import { test, expect } from '@playwright/test';
import { config } from 'tests/e2e/config';
import { getRelativeEpoch } from 'tests/helpers/date';
import {
  createSecret,
  deleteSecret,
  getSecretMetadata,
} from 'tests/helpers/api/client';
import { ISecretMetadata } from 'tests/helpers/models/secretMetadata';
import {
  CreateSecretForm,
  goToCreateSecretPage,
} from 'tests/e2e/models/createsecret';
import { SecretMetadataDisplay } from 'tests/e2e/models/secretmetadata';
import { AccessSecretDisplay } from 'tests/e2e/models/accesssecret';

test.describe('smoke test', () => {
  test.describe('with secret', () => {
    let secretMetadata: ISecretMetadata;

    test.beforeEach(async () => {
      const expiration = getRelativeEpoch(24);
      secretMetadata = await createSecret('Test content', expiration, 1);
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
      if (id) await deleteSecret(id);
    });

    test('can create secret with defaults', async ({ page }) => {
      const secretPage = await CreateSecretForm.open(page);
      await secretPage.createSecret('Test content');

      const url = page.url();

      const idMatch = url.match(/\/secret\/([^/]+)/);
      id = idMatch ? idMatch[1] : null;

      expect(id).not.toBeNull();

      const secretMetadata = await getSecretMetadata(id);
      expect(secretMetadata.id).toBe(id);
      expect(secretMetadata.access_limit).toBe(1);
      expect(secretMetadata.access_count).toBe(0);
      expect(secretMetadata.expiration).toBeTruthy();
    });
  });
});
