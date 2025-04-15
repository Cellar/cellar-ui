import { ISecretMetadata } from '../models/secretMetadata';
import { IApiError } from '../models/error';
import { ISecret } from '../models/secret';
import { config } from 'tests/e2e/config';
import { Iapiclient } from 'tests/helpers/api/iapiclient';

export class StandardApiClient implements Iapiclient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.apiUrl;
  }

  async createSecret(
    content: string,
    expirationUtc: Date | number,
    accessLimit: number,
  ): Promise<ISecretMetadata | IApiError> {
    try {
      const expirationEpoch =
        typeof expirationUtc === 'number'
          ? expirationUtc
          : Math.floor(expirationUtc.getTime() / 1000);

      const payload = {
        content: content,
        expiration_epoch: expirationEpoch,
        access_limit: accessLimit,
      };

      console.log(
        `Creating secret with expiration ${expirationEpoch} and access limit ${accessLimit}`,
      );

      const res = await fetch(`${this.baseUrl}/v1/secrets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error('Failed to create secret:', res.status, res.statusText);
      }

      const data = await res.json();
      console.log(`Created secret with ID: ${data.id}`);
      return data;
    } catch (error) {
      console.error('Error creating secret:', error);
      throw error;
    }
  }

  async getSecretMetadata(
    secretId: string,
  ): Promise<ISecretMetadata | IApiError> {
    try {
      const res = await fetch(`${this.baseUrl}/v1/secrets/${secretId}`, {
        method: 'GET',
      });

      if (!res.ok) {
        console.error(
          `Failed to get metadata for secret ${secretId}:`,
          res.status,
        );
      }

      return await res.json();
    } catch (error) {
      console.error(`Error getting metadata for secret ${secretId}:`, error);
      throw error;
    }
  }

  async accessSecret(secretId: string): Promise<ISecret | IApiError> {
    try {
      const res = await fetch(`${this.baseUrl}/v1/secrets/${secretId}/access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        console.error(
          `Failed to access secret ${secretId}:`,
          res.status,
          res.statusText,
        );
      }

      return await res.json();
    } catch (error) {
      console.error(`Error accessing secret ${secretId}:`, error);
      throw error;
    }
  }

  async deleteSecret(secretId: string): Promise<null | IApiError> {
    try {
      const res = await fetch(`${this.baseUrl}/v1/secrets/${secretId}`, {
        method: 'DELETE',
      });

      if (res.status === 204) return null;

      const text = await res.text();
      return text ? JSON.parse(text) : null;
    } catch (error) {
      console.error(`Error deleting secret ${secretId}:`, error);
      return null;
    }
  }
}
