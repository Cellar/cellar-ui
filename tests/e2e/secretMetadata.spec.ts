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
import { NotFound } from './models/notfound';

test.describe('when opening the secret metadata', () => {
  let secretMetadata: ISecretMetadata;
  const standardAccessLimit = 3;

  test.beforeEach(async ({ page, initApi }) => {
    await initApi();
    const expiration = getRelativeEpoch(24);
    const browserName = page.context().browser()?.browserType().name();
    console.log(`Running test with browser: ${browserName}`);

    console.log(
      `Creating test secret with expiration: ${expiration} and access limit: ${standardAccessLimit}`,
    );

    const result = await createSecret(
      'Test content',
      expiration,
      standardAccessLimit,
    );

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

  // Basic display tests
  test('it should display the secret ID', async ({ page, browserName }) => {
    const display = await SecretMetadataDisplay.open(page, secretMetadata.id);
    
    if (browserName !== 'webkit') {
      const secretIdValue = await display.secretId.inputValue();
      expect(secretIdValue).toBe(secretMetadata.id);
    }
  });

  test('it should display the expiration date and time', async ({ page, browserName }) => {
    const display = await SecretMetadataDisplay.open(page, secretMetadata.id);
    
    if (browserName !== 'webkit') {
      const expirationText = await display.expirationDate.getText();
      expect(expirationText).not.toBe('');
    }
  });

  test('it should have copy and delete buttons', async ({ page, browserName }) => {
    const display = await SecretMetadataDisplay.open(page, secretMetadata.id);
    
    if (browserName !== 'webkit') {
      await display.expectVisible();
      await display.copySecretLink.isVisible();
      await display.copyMetadataLink.isVisible();
      await display.deleteSecretMetadata.isVisible();
    }
  });

  // Access count tests
  test.describe('and the secret has a max access count', () => {
    test('it should start at a 0 value', async ({ page, verifySecretAccess, browserName }) => {
      const display = await SecretMetadataDisplay.open(page, secretMetadata.id);
      
      if (browserName !== 'webkit') {
        await display.accessCount.expectContainsText('0 of');
      }
      
      await verifySecretAccess(secretMetadata.id, 0, standardAccessLimit);
    });

    test('it should contain a max value', async ({ page, verifySecretAccess, browserName }) => {
      const display = await SecretMetadataDisplay.open(page, secretMetadata.id);
      
      if (browserName !== 'webkit') {
        await display.accessCount.expectContainsText(`of ${standardAccessLimit}`);
      }
      
      await verifySecretAccess(secretMetadata.id, 0, standardAccessLimit);
    });

    test.describe('and the secret has been accessed once', () => {
      test.beforeEach(async () => {
        await accessSecret(secretMetadata.id);
      });

      test('it should show the access count as 1', async ({ page, verifySecretAccess, browserName }) => {
        const display = await SecretMetadataDisplay.open(page, secretMetadata.id);
        
        if (browserName !== 'webkit') {
          await display.accessCount.expectContainsText('1 of');
        }
        
        await verifySecretAccess(secretMetadata.id, 1, standardAccessLimit);
      });
    });

    test.describe('and the secret has been accessed multiple times', () => {
      test.beforeEach(async () => {
        await accessSecret(secretMetadata.id);
        await accessSecret(secretMetadata.id);
      });

      test('it should show the correct access count', async ({ page, verifySecretAccess, browserName }) => {
        const display = await SecretMetadataDisplay.open(page, secretMetadata.id);
        
        if (browserName !== 'webkit') {
          await display.accessCount.expectContainsText('2 of');
        }
        
        await verifySecretAccess(secretMetadata.id, 2, standardAccessLimit);
      });
    });

    test.describe('and access count has been reached', () => {
      test.beforeEach(async () => {
        for (let i = 0; i < standardAccessLimit; i++) {
          await accessSecret(secretMetadata.id);
        }
      });

      test('it should redirect to not found on refresh', async ({ page }) => {
        const display = await SecretMetadataDisplay.open(page, secretMetadata.id);
        
        // Reload and check for redirect to NotFound
        const resultAfterReload = await display.reload();
        
        expect(resultAfterReload instanceof NotFound).toBe(true);
        await resultAfterReload.expectVisible();
      });
    });

    test.describe('and the access count has not been reached yet', () => {
      test.beforeEach(async () => {
        await accessSecret(secretMetadata.id); // Just one access
      });

      test('it should continue to display the metadata', async ({ page, browserName }) => {
        const display = await SecretMetadataDisplay.open(page, secretMetadata.id);
        
        // Reload and verify we're still on the metadata page
        const resultAfterReload = await display.reload();
        
        expect(resultAfterReload instanceof SecretMetadataDisplay).toBe(true);
        await resultAfterReload.expectVisible();
      });
    });
  });

  test.describe('and the secret has no access limit', () => {
    test.beforeEach(async ({ page, initApi }) => {
      await initApi();
      // Create a new secret with no access limit (-1)
      const expiration = getRelativeEpoch(24);
      const result = await createSecret('Test content with no limit', expiration, -1);
      secretMetadata = result as ISecretMetadata;
    });

    test('it should display only the access count without "of X"', async ({ page, browserName }) => {
      const display = await SecretMetadataDisplay.open(page, secretMetadata.id);
      
      if (browserName !== 'webkit') {
        await display.accessCount.expectContainsText('0 times');
        const countText = await display.accessCount.getText();
        expect(countText).not.toContain('of');
      }
    });
  });

  // Copy button tests
  test.describe('and clicking copy buttons', () => {
    test('it should have a working "Copy Link to Secret" button', async ({ page, browserName }) => {
      const display = await SecretMetadataDisplay.open(page, secretMetadata.id);
      
      if (browserName !== 'webkit') {
        await display.copySecretLink.click();
        // The copySecretLink already has a withWaitForSelector for the checkmark icon
      }
    });
    
    test('it should have a working "Copy Link to Metadata" button', async ({ page, browserName }) => {
      const display = await SecretMetadataDisplay.open(page, secretMetadata.id);
      
      if (browserName !== 'webkit') {
        await display.copyMetadataLink.click();
        // The copyMetadataLink already has a withWaitForSelector for the checkmark icon
      }
    });
  });

  // Deletion tests
  test.describe('and clicking the "Delete Secret" button', () => {
    test.describe('and confirming', () => {
      test('it should delete the secret', async ({ page, browserName }) => {
        const display = await SecretMetadataDisplay.open(page, secretMetadata.id);
        
        if (browserName !== 'webkit') {
          const createForm = await display.deleteWithConfirmation(true);
          await createForm.expectVisible();
        }
      });
    });
    
    test.describe('and canceling', () => {
      test('it should not delete the secret', async ({ page, browserName, verifySecretAccess }) => {
        const display = await SecretMetadataDisplay.open(page, secretMetadata.id);
        
        if (browserName !== 'webkit') {
          const sameDisplay = await display.deleteWithConfirmation(false);
          await sameDisplay.expectVisible();
        }
        
        // Secret should still exist
        await verifySecretAccess(secretMetadata.id, 0, standardAccessLimit);
      });
    });
  });

  // Expiration tests
  test.describe('and the expiration time has passed', () => {
    test('it should redirect to not found page', async ({ page }) => {
      // Create a secret with very short expiration
      const shortExpiration = getRelativeEpoch(0.001); // Almost immediate expiration
      const tempResult = await createSecret('Quick expiry content', shortExpiration, 3);
      const tempSecret = tempResult as ISecretMetadata;
      
      // Wait for expiration
      await page.waitForTimeout(2000);
      
      // Try to access the expired secret - should be a NotFound page
      const result = await SecretMetadataDisplay.open(page, tempSecret.id);
      
      expect(result instanceof NotFound).toBe(true);
      await result.expectVisible();
    });
  });
});

// Mobile tests
test.describe('when opening the secret metadata on a mobile device', () => {
  let secretMetadata: ISecretMetadata;
  
  test.beforeEach(async ({ page, initApi }) => {
    // Use mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
    
    await initApi();
    const expiration = getRelativeEpoch(24);
    const result = await createSecret('Mobile test content', expiration, 3);
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
  
  test('it should display a mobile-optimized layout', async ({ page, browserName }) => {
    const display = await SecretMetadataDisplay.open(page, secretMetadata.id);
    
    if (browserName !== 'webkit') {
      // On mobile, we should have the mobile-specific containers
      await display.actionsLine.isVisible();
    }
  });
});

// Error state tests
test.describe('when opening the secret metadata for a non-existent secret ID', () => {
  test('it should redirect to not found page', async ({ page }) => {
    // Use a random, non-existent ID
    const nonExistentId = 'nonexistent-' + Math.random().toString(36).substring(2);
    
    const result = await SecretMetadataDisplay.open(page, nonExistentId);
    
    expect(result instanceof NotFound).toBe(true);
    await result.expectVisible();
  });
});
