export interface ISecretMetadata {
  id: string;
  expiration: Date;
  access_count: number;
  access_limit: number;
  content_type: 'text' | 'file';
  filename?: string;
  file_size?: number;
}
