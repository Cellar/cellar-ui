import { ISecretMetadata } from '../models/secretMetadata';
import { IApiError } from '../models/error';
import { ISecret } from '../models/secret';
import { APIRequestContext } from '@playwright/test';
import { getApiClient } from './iapiclient';
import { WebkitApiClient } from './webkitapiclient';

let currentClient = getApiClient();
let browserType: string | null = null;

export const setBrowserType = (type: string) => {
  browserType = type;
  currentClient = getApiClient(type);
};

export const setPlaywrightRequest = (request: APIRequestContext) => {
  if (browserType === 'webkit' && currentClient instanceof WebkitApiClient) {
    (currentClient as WebkitApiClient).setRequest(request);
  }
};

export const createSecret = async (
  content: string,
  expirationUtc: Date | number,
  accessLimit: number,
): Promise<ISecretMetadata | IApiError> => {
  return currentClient.createSecret(content, expirationUtc, accessLimit);
};

export const getSecretMetadata = async (
  secretId: string,
): Promise<ISecretMetadata | IApiError> => {
  return currentClient.getSecretMetadata(secretId);
};

export const accessSecret = async (
  secretId: string,
): Promise<ISecret | IApiError> => {
  return currentClient.accessSecret(secretId);
};

export const deleteSecret = async (
  secretId: string,
): Promise<null | IApiError> => {
  return currentClient.deleteSecret(secretId);
};
