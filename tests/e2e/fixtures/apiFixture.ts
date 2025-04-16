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
      const metadata = await request.get(
        `${page.url().split('/secret/')[0]}/api/v1/secrets/${secretId}`,
      );

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
    };

    await use(verifyFn);
  },
});
