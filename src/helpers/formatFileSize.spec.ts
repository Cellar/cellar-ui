import { describe, it, expect } from 'vitest';
import { formatFileSize } from './formatFileSize';

describe('formatFileSize', () => {
  describe('when formatting zero bytes', () => {
    it('should return 0 Bytes', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
    });
  });

  describe('when formatting bytes', () => {
    it('should return bytes with Bytes suffix', () => {
      expect(formatFileSize(500)).toBe('500 Bytes');
    });

    it('should handle 1 byte', () => {
      expect(formatFileSize(1)).toBe('1 Bytes');
    });

    it('should handle 1023 bytes', () => {
      expect(formatFileSize(1023)).toBe('1023 Bytes');
    });
  });

  describe('when formatting kilobytes', () => {
    it('should return KB for 1024 bytes', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
    });

    it('should return KB with decimal for partial KB', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });

    it('should handle large KB values', () => {
      expect(formatFileSize(153600)).toBe('150 KB');
    });
  });

  describe('when formatting megabytes', () => {
    it('should return MB for megabyte values', () => {
      expect(formatFileSize(1048576)).toBe('1 MB');
    });

    it('should return MB with decimal precision', () => {
      expect(formatFileSize(2516582)).toBe('2.4 MB');
    });

    it('should handle 8MB limit', () => {
      expect(formatFileSize(8388608)).toBe('8 MB');
    });
  });

  describe('when formatting gigabytes', () => {
    it('should return GB for gigabyte values', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });

    it('should return GB with decimal precision', () => {
      expect(formatFileSize(1610612736)).toBe('1.5 GB');
    });
  });
});
