export interface ISecret {
  id: string;
  content: string;
  contentType?: 'text' | 'file';
  filename?: string;
  fileBlob?: Blob;
}
