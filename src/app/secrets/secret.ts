export interface ISecretMetadata {
  id: string;
  expiration: Date;
  access_count: number;
  access_limit: number;
}

export interface ISecret {
  id: string;
  content: string;
}
