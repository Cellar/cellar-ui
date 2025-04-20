import { ISecretMetadata } from '../models/secretMetadata';
import { IApiError } from '../models/error';
import { ISecret } from '../models/secret';
import { APIRequestContext } from '@playwright/test';
import { getApiClient } from './iapiclient';
import { WebkitApiClient } from './webkitapiclient';

let currentClient = getApiClient();
let browserType: string | null = null;
let requestContext: APIRequestContext | null = null;

export const setBrowserType = (type: string) => {
  browserType = type;
  console.log(`Setting browser type to: ${type}`);
  currentClient = getApiClient(type);
  
  // If we already have a request context and now WebKit is selected,
  // make sure the client has the context set
  if (type === 'webkit' && requestContext && currentClient instanceof WebkitApiClient) {
    console.log('Setting existing request context on new WebkitApiClient');
    (currentClient as WebkitApiClient).setRequest(requestContext);
  }
};

export const setPlaywrightRequest = (request: APIRequestContext) => {
  // Store the request context for potential later use
  requestContext = request;
  console.log('Setting Playwright request context');
  
  if (browserType === 'webkit' && currentClient instanceof WebkitApiClient) {
    console.log('Setting request context on WebkitApiClient');
    (currentClient as WebkitApiClient).setRequest(request);
  } else {
    console.log(`Not setting request: browserType=${browserType}, client is WebkitApiClient=${currentClient instanceof WebkitApiClient}`);
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
