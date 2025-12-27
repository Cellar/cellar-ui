import { test } from './fixtures/apiFixture';
import { expect } from '@playwright/test';
import { CreateSecretForm } from './models/createsecret';
import { SecretMetadataDisplay } from './models/secretmetadata';
import { AccessSecretDisplay } from './models/accesssecret';
import path from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync } from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testFilePath = path.join(
  __dirname,
  '../fixtures/files/test-document.txt',
);

test.describe('when opening create secret page', () => {
  let form: CreateSecretForm;

  test.beforeEach(async ({ page, browserName }) => {
    test.skip(
      browserName === 'webkit',
      'This test is skipped in WebKit due to security restrictions',
    );
    form = await CreateSecretForm.open(page);
  });

  test.describe('and switching to file upload mode', () => {
    test.beforeEach(async () => {
      await form.switchToFileMode();
    });

    test('it should show the file upload zone', async () => {
      expect(await form.fileUploadZone.isVisible()).toBe(true);
    });

    test('it should hide the text content textarea', async () => {
      await expect(form.secretContent.baseElement).toBeHidden();
    });

    test.describe('and uploading a valid file', () => {
      test.beforeEach(async () => {
        await form.uploadFile(testFilePath);
      });

      test('it should display the selected file name', async () => {
        await expect(form.selectedFileName.baseElement).toContainText(
          'test-document.txt',
        );
      });

      test('it should display the file size', async () => {
        expect(await form.selectedFileSize.isVisible()).toBe(true);
      });

      test.describe('and clicking remove', () => {
        test('it should return to empty upload state', async () => {
          await form.removeFileButton.click();

          await expect(form.fileUploadZone.baseElement).toContainText(
            'Drag and drop a file here or click to browse',
          );
        });
      });

      test.describe('and creating the secret', () => {
        test('it should redirect to metadata page', async ({ page }) => {
          const metadataDisplay = await form.createSecretButton.click();

          expect(metadataDisplay).toBeInstanceOf(SecretMetadataDisplay);
          expect(page.url()).toMatch(/\/secret\/[a-zA-Z0-9-]+$/);
        });
      });
    });

    test.describe('and uploading a file exceeding size limit', () => {
      test.beforeEach(async () => {
        const largeBuffer = Buffer.alloc(9 * 1024 * 1024);
        const largePath = path.join(
          __dirname,
          '../fixtures/files/large-file.bin',
        );
        writeFileSync(largePath, largeBuffer);

        await form.fileUploadInput.setInputFiles(largePath);
      });

      test('it should show an error message', async () => {
        await expect(form.fileUploadError.baseElement).toContainText(
          'File exceeds maximum size',
        );
      });
    });
  });
});

test.describe('when accessing a file secret', () => {
  let form: CreateSecretForm;
  let metadataDisplay: SecretMetadataDisplay;
  let accessDisplay: AccessSecretDisplay;

  test.beforeEach(async ({ page, browserName }) => {
    test.skip(
      browserName === 'webkit',
      'This test is skipped in WebKit due to security restrictions',
    );
    form = await CreateSecretForm.open(page);
    metadataDisplay = await form.createFileSecret(testFilePath);
    const secretId = await metadataDisplay.getSecretIdText();
    accessDisplay = await AccessSecretDisplay.open(page, secretId);
  });

  test('it should show file info card', async () => {
    expect(await accessDisplay.fileInfoCard.isVisible()).toBe(true);
  });

  test('it should display the download button', async () => {
    expect(await accessDisplay.downloadFileButton.isVisible()).toBe(true);
  });

  test.describe('and downloading the file', () => {
    test('it should download with correct filename', async ({ page }) => {
      const downloadPromise = page.waitForEvent('download');
      await accessDisplay.downloadFileButton.click();
      const download = await downloadPromise;

      expect(download.suggestedFilename()).toBe('test-document.txt');
    });
  });
});
