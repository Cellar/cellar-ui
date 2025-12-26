import { ISecretMetadata } from '../models/secretMetadata';
import { IApiError } from '../models/error';
import { ISecret } from '../models/secret';

export const createSecret = async (
  content: string,
  expirationUtc: Date,
  accessLimit: number,
): Promise<ISecretMetadata | IApiError> => {
  const expirationEpoch = Math.floor(expirationUtc.getTime() / 1000);

  const formData = new FormData();
  formData.append('content', content);
  formData.append('expiration_epoch', String(expirationEpoch));
  formData.append('access_limit', String(accessLimit));

  const res = await fetch(`/api/v2/secrets`, {
    method: 'POST',
    body: formData,
  });
  return res.json();
};

export const getSecretMetadata = async (
  secretId: string,
): Promise<ISecretMetadata | IApiError> => {
  const res = await fetch(`/api/v2/secrets/${secretId}`, { method: 'GET' });
  return res.json();
};

export const accessSecret = async (
  secretId: string,
): Promise<ISecret | IApiError> => {
  const res = await fetch(`/api/v2/secrets/${secretId}/access`, {
    method: 'POST',
  });
  return res.json();
};

export const deleteSecret = async (
  secretId: string,
): Promise<null | IApiError> => {
  const res = await fetch(`/api/v2/secrets/${secretId}`, { method: 'DELETE' });
  if (res.status === 204) return null;

  return res.json();
};
