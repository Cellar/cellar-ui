export interface ISecretMetadata {
  id: string;
  expiration: Date;
  access_count: number;
  access_limit: number;
}
