import { ISecretMetadata } from '../models/secretMetadata';
import { IApiError } from '../models/error';
import { ISecret } from '../models/secret';

export interface IApiClient {
  createSecret(
    content: string,
    expirationUtc: Date | number,
    accessLimit: number,
  ): Promise<ISecretMetadata | IApiError>;
  getSecretMetadata(secretId: string): Promise<ISecretMetadata | IApiError>;
  accessSecret(secretId: string): Promise<ISecret | IApiError>;
  deleteSecret(secretId: string): Promise<null | IApiError>;
}

import { WebkitApiClient } from './webkitapiclient';
import { StandardApiClient } from './standardapiclient';

export function getApiClient(browserName?: string): IApiClient {
  if (browserName === 'webkit') {
    return new WebkitApiClient();
  }
  return new StandardApiClient();
}
