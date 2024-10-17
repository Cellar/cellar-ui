import {ISecretMetadata} from "../models/secretMetadata";
import {IApiError} from "../models/error";
import {ISecret} from "../models/secret";

export const getSecretMetadata = async (secretId: string): Promise<ISecretMetadata | IApiError>  => {
  const res = await fetch(`/api/v1/secrets/${secretId}`);
  return res.json();
}

export const accessSecret = async (secretId: string): Promise<ISecret | IApiError>  => {
  const res = await fetch(`/api/v1/secrets/${secretId}/access`, { method: 'POST' });
  return res.json();
}
