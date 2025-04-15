import { ISecretMetadata } from '../models/secretMetadata';
import { IApiError } from '../models/error';
import { ISecret } from '../models/secret';
import { config } from 'tests/e2e/config';
import { Iapiclient } from 'tests/helpers/api/iapiclient';
import { APIRequestContext } from '@playwright/test';

export class WebkitApiClient implements Iapiclient {
  private baseUrl: string;
  private request: APIRequestContext | null = null;

  constructor() {
    this.baseUrl = config.apiUrl;
  }

  setRequest(request: APIRequestContext) {
    this.request = request;
  }

  async createSecret(
    content: string,
    expirationUtc: Date | number,
    accessLimit: number,
  ): Promise<ISecretMetadata | IApiError> {
    try {
      if (!this.request) {
        throw new Error('WebkitApiClient requires a request context to be set');
      }

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
        `Creating secret with expiration ${expirationEpoch} and access limit ${accessLimit} (WebKit)`,
      );

      const response = await this.request.post(`${this.baseUrl}/v1/secrets`, {
        data: payload,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok()) {
        console.error(
          'Failed to create secret (WebKit):',
          response.status(),
          await response.text(),
        );
      }

      const data = await response.json();
      console.log(`Created secret with ID: ${data.id} (WebKit)`);
      return data;
    } catch (error) {
      console.error('Error creating secret (WebKit):', error);
      throw error;
    }
  }

  async getSecretMetadata(
    secretId: string,
  ): Promise<ISecretMetadata | IApiError> {
    try {
      if (!this.request) {
        throw new Error('WebkitApiClient requires a request context to be set');
      }

      const response = await this.request.get(
        `${this.baseUrl}/v1/secrets/${secretId}`,
      );

      if (!response.ok()) {
        console.error(
          `Failed to get metadata for secret ${secretId} (WebKit):`,
          response.status(),
        );
      }

      return await response.json();
    } catch (error) {
      console.error(
        `Error getting metadata for secret ${secretId} (WebKit):`,
        error,
      );
      throw error;
    }
  }

  async accessSecret(secretId: string): Promise<ISecret | IApiError> {
    try {
      if (!this.request) {
        throw new Error('WebkitApiClient requires a request context to be set');
      }

      const response = await this.request.post(
        `${this.baseUrl}/v1/secrets/${secretId}/access`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok()) {
        console.error(
          `Failed to access secret ${secretId} (WebKit):`,
          response.status(),
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`Error accessing secret ${secretId} (WebKit):`, error);
      throw error;
    }
  }

  async deleteSecret(secretId: string): Promise<null | IApiError> {
    try {
      if (!this.request) {
        throw new Error('WebkitApiClient requires a request context to be set');
      }

      const response = await this.request.delete(
        `${this.baseUrl}/v1/secrets/${secretId}`,
      );

      if (response.status() === 204) return null;

      const text = await response.text();
      return text ? JSON.parse(text) : null;
    } catch (error) {
      console.error(`Error deleting secret ${secretId} (WebKit):`, error);
      return null;
    }
  }
}
