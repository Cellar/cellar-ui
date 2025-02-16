import { ISecretMetadata } from '../models/secretMetadata';
import { IApiError } from '../models/error';
import { ISecret } from '../models/secret';
import { config } from 'tests/e2e/config';

const baseUrl = config.apiUrl;

export const createSecret = async (
  content: string,
  expirationUtc: Date | number,
  accessLimit: number,
): Promise<ISecretMetadata | IApiError> => {
  const expirationEpoch =
    typeof expirationUtc === 'number'
      ? expirationUtc
      : Math.floor(expirationUtc.getTime() / 1000);

  const res = await fetch(`${baseUrl}/v1/secrets`, {
    method: 'POST',
    body: JSON.stringify({
      content: content,
      expiration_epoch: expirationEpoch,
      access_limit: accessLimit,
    }),
  });
  return res.json();
};

export const getSecretMetadata = async (
  secretId: string,
): Promise<ISecretMetadata | IApiError> => {
  const res = await fetch(`${baseUrl}/v1/secrets/${secretId}`, {
    method: 'GET',
  });
  return res.json();
};

export const accessSecret = async (
  secretId: string,
): Promise<ISecret | IApiError> => {
  const res = await fetch(`${baseUrl}/v1/secrets/${secretId}/access`, {
    method: 'POST',
  });
  return res.json();
};

export const deleteSecret = async (
  secretId: string,
): Promise<null | IApiError> => {
  const res = await fetch(`${baseUrl}/v1/secrets/${secretId}`, {
    method: 'DELETE',
  });
  if (res.status === 204) return null;

  return res.json();
};
