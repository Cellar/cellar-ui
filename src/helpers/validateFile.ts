import { formatFileSize } from './formatFileSize';

export function validateFile(file: File, maxSizeBytes: number): string | null {
  if (file.size <= 0) {
    return 'Empty files are not allowed';
  }

  if (file.size > maxSizeBytes) {
    return `File exceeds maximum size of ${formatFileSize(maxSizeBytes)}`;
  }

  return null;
}
