import {ISecretMetadata} from "../models/secretMetadata";
import {IApiError} from "../models/error";
import {ISecret} from "../models/secret";

export const createSecret = async (content: string, expiration: Date, accessLimit: number): Promise<ISecretMetadata | IApiError>  => {
  const expirationEpoch = Math.floor(expiration.getTime() / 1000); // epoch in seconds (getTime returns milliseconds)
  const res = await fetch(`/api/v1/secrets`, { method: 'POST',
    body: JSON.stringify({
      content: content,
      expiration_epoch: expirationEpoch,
      access_limit: accessLimit,
    })
  });
  return res.json();
}

export const getSecretMetadata = async (secretId: string): Promise<ISecretMetadata | IApiError>  => {
  const res = await fetch(`/api/v1/secrets/${secretId}`, { method: 'GET' });
  return res.json();
}

export const accessSecret = async (secretId: string): Promise<ISecret | IApiError>  => {
  const res = await fetch(`/api/v1/secrets/${secretId}/access`, { method: 'POST' });
  return res.json();
}

export const deleteSecret = async (secretId: string): Promise<null | IApiError>  => {
  const res = await fetch(`/api/v1/secrets/${secretId}`, { method: 'DELETE' });
  if (res.status === 204)
    return null;

  return res.json();
}
