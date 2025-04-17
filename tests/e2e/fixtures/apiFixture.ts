import { test as base, expect } from '@playwright/test';
import { ISecretMetadata } from '../../helpers/models/secretMetadata';
import { setBrowserType, setPlaywrightRequest } from '../../helpers/api/client';

export interface ApiFixtures {
  initApi: () => Promise<void>;
  verifySecretAccess: (
    secretId: string,
    expectedCount: number,
    expectedLimit?: number,
  ) => Promise<void>;
}

export const test = base.extend<ApiFixtures>({
  initApi: async ({ page, request }, use) => {
    const browserName = page.context().browser()?.browserType().name();

    if (browserName) {
      setBrowserType(browserName);

      if (browserName === 'webkit') {
        setPlaywrightRequest(request);
      }
    }

    await use(async () => {
      // Initialize API configuration
    });
  },

  verifySecretAccess: async ({ page, request }, use) => {
    const verifyFn = async (
      secretId: string,
      expectedCount: number,
      expectedLimit?: number,
    ) => {
      // Get the base URL from the current page context, but ensure it's a valid URL
      // This prevents "about:blank" and similar issues
      let baseUrl = page.url();

      // If we're on about:blank or another invalid URL, use a default
      if (baseUrl.startsWith('about:') || !baseUrl.includes('http')) {
        baseUrl = 'http://localhost:5173';
      } else {
        // Extract just the base part of the URL
        const urlParts = baseUrl.split('/secret/');
        baseUrl = urlParts[0];
      }

      // Now construct the API URL with the sanitized base URL
      const apiUrl = `${baseUrl}/api/v1/secrets/${secretId}`;
      console.log(`Checking secret metadata at: ${apiUrl}`);

      try {
        const metadata = await request.get(apiUrl);

        if (
          expectedCount > 0 &&
          expectedLimit &&
          expectedCount >= expectedLimit
        ) {
          // For secrets that have reached their access limit, we expect a 404
          expect(metadata.status()).toBe(404);
          return;
        }

        const isOk = metadata.ok();
        expect(isOk).toBeTruthy();

        const data = (await metadata.json()) as ISecretMetadata;
        const actualCount = data.access_count;
        expect(actualCount).toBe(expectedCount);

        if (expectedLimit !== undefined) {
          const actualLimit = data.access_limit;
          expect(actualLimit).toBe(expectedLimit);
        }
      } catch (error) {
        console.error(`Error verifying secret access for ${secretId}:`, error);
        throw error;
      }
    };

    await use(verifyFn);
  },
});
