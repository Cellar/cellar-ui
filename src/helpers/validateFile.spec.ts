import { describe, it, expect } from 'vitest';
import { validateFile } from './validateFile';

describe('validateFile', () => {
  [
    { readableLimit: '1 MB', maxSize: 1 * 1024 * 1024 },
    { readableLimit: '8 MB', maxSize: 8 * 1024 * 1024 },
    { readableLimit: '10 MB', maxSize: 10 * 1024 * 1024 },
  ].forEach(({ readableLimit, maxSize }) => {
    describe(`when max file size is set to ${readableLimit}`, () => {
      function createAndValidateFile(
        content: ArrayBuffer | string[],
        filename: string,
      ): string | null {
        const fileContent =
          content instanceof ArrayBuffer ? [content] : content;
        const contentType =
          content instanceof ArrayBuffer ? undefined : 'text/plain';
        const file = new File(fileContent, filename, { type: contentType });

        return validateFile(file, maxSize);
      }

      describe('and file is within size limit', () => {
        [
          { name: 'is 1 byte', filename: 'single-byte.txt', content: ['a'] },
          {
            name: 'is a standard string',
            filename: 'test.txt',
            content: ['test content'],
          },
          {
            name: 'is at exact size limit',
            filename: 'exact-size.bin',
            content: new ArrayBuffer(maxSize),
          },
        ].forEach(({ name, filename, content }) => {
          describe(name, () => {
            const error = createAndValidateFile(content, filename);

            it('should return null', () => {
              expect(error).toBeNull();
            });
          });
        });
      });

      describe('and file is not within the size limit', () => {
        describe('and file is empty', () => {
          const error = createAndValidateFile([], 'empty.txt');

          it('should return an error message', () => {
            expect(error).not.toBeNull();
          });

          it('should indicate empty files are not allowed', () => {
            expect(error).toBe('Empty files are not allowed');
          });
        });

        describe('and file exceeds size limit', () => {
          const buffer = new ArrayBuffer(maxSize + 1);
          const error = createAndValidateFile(buffer, 'too-large.bin');

          it('should return an error message', () => {
            expect(error).not.toBeNull();
          });

          it('should indicate file exceeds maximum size', () => {
            expect(error).toContain('File exceeds maximum size');
          });

          it('should include the size limit in message', () => {
            expect(error).toContain(readableLimit);
          });
        });
      });
    });
  });
});
