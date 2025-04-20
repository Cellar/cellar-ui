import { ISecretMetadata } from '../models/secretMetadata';
import { IApiError } from '../models/error';
import { ISecret } from '../models/secret';
import { config } from '../../e2e/config';
import { IApiClient } from './iapiclient';
import { APIRequestContext } from '@playwright/test';

export class WebkitApiClient implements IApiClient {
  private baseUrl: string;
  private request: APIRequestContext | null = null;

  constructor() {
    this.baseUrl = config.apiUrl;
  }

  setRequest(request: APIRequestContext) {
    console.log('Setting WebkitApiClient request context');
    this.request = request;
    
    // Log that the request context has been set
    if (this.request) {
      console.log('WebkitApiClient request context set successfully');
    } else {
      console.warn('WebkitApiClient request context NOT set - operations will fail');
    }
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

      // Add retry logic for API calls
      let retries = 3;
      let response;
      
      while (retries > 0) {
        response = await this.request.post(`${this.baseUrl}/v1/secrets`, {
          data: payload,
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 15000, // Increase timeout
        });
        
        if (response.ok()) {
          break;
        }
        
        console.warn(
          `API call failed (${retries} retries left): status ${response.status()}`,
          await response.text(),
        );
        
        retries--;
        if (retries > 0) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (!response || !response.ok()) {
        console.error(
          'Failed to create secret after retries (WebKit):',
          response?.status(),
        );
        
        return {
          error: `API error: ${response?.status()} ${await response?.text()}`,
          status: response?.status() || 500,
        } as IApiError;
      }

      try {
        const data = await response.json();
        console.log(`Created secret with ID: ${data.id} (WebKit)`);
        
        // Extra validation to ensure we have a valid response
        if (!data.id) {
          console.warn('API returned success but missing secret ID');
          return {
            error: 'API returned success but missing secret ID',
            status: 500,
          } as IApiError;
        }
        
        return data;
      } catch (jsonError) {
        console.error('Error parsing API response:', jsonError);
        return {
          error: 'Failed to parse API response',
          status: 500,
        } as IApiError;
      }
    } catch (error) {
      console.error('Error creating secret (WebKit):', error);
      return {
        error: String(error),
        status: 500,
      } as IApiError;
    }
  }

  async getSecretMetadata(
    secretId: string,
  ): Promise<ISecretMetadata | IApiError> {
    if (!secretId) {
      console.warn('Cannot get metadata - secretId is undefined or empty');
      return {
        error: 'Secret ID is undefined or empty',
        status: 400
      } as IApiError;
    }
    
    try {
      if (!this.request) {
        throw new Error('WebkitApiClient requires a request context to be set');
      }

      // Add retry logic for API calls
      let retries = 3;
      let response;
      
      while (retries > 0) {
        response = await this.request.get(
          `${this.baseUrl}/v1/secrets/${secretId}`,
          { timeout: 15000 } // Increase timeout
        );
        
        if (response.ok()) {
          break;
        }
        
        // Special case: For 404, we don't need to retry
        if (response.status() === 404) {
          return {
            error: 'Secret not found',
            status: 404
          } as IApiError;
        }
        
        console.warn(
          `Failed to get metadata (${retries} retries left): status ${response.status()}`,
        );
        
        retries--;
        if (retries > 0) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (!response || !response.ok()) {
        console.error(
          `Failed to get metadata for secret ${secretId} after retries (WebKit):`,
          response?.status(),
        );
        
        return {
          error: `API error: ${response?.status()}`,
          status: response?.status() || 500,
        } as IApiError;
      }

      try {
        const data = await response.json();
        return data;
      } catch (jsonError) {
        console.error('Error parsing API response:', jsonError);
        return {
          error: 'Failed to parse API response',
          status: 500,
        } as IApiError;
      }
    } catch (error) {
      console.error(
        `Error getting metadata for secret ${secretId} (WebKit):`,
        error,
      );
      return {
        error: String(error),
        status: 500,
      } as IApiError;
    }
  }

  async accessSecret(secretId: string): Promise<ISecret | IApiError> {
    if (!secretId) {
      console.warn('Cannot access secret - secretId is undefined or empty');
      return {
        error: 'Secret ID is undefined or empty',
        status: 400
      } as IApiError;
    }
    
    try {
      if (!this.request) {
        throw new Error('WebkitApiClient requires a request context to be set');
      }

      // Add retry logic for API calls
      let retries = 3;
      let response;
      
      while (retries > 0) {
        response = await this.request.post(
          `${this.baseUrl}/v1/secrets/${secretId}/access`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 15000 // Increase timeout
          },
        );
        
        if (response.ok()) {
          break;
        }
        
        // Special case: For 404, we don't need to retry
        if (response.status() === 404) {
          return {
            error: 'Secret not found or access limit reached',
            status: 404
          } as IApiError;
        }
        
        console.warn(
          `Failed to access secret (${retries} retries left): status ${response.status()}`,
        );
        
        retries--;
        if (retries > 0) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (!response || !response.ok()) {
        console.error(
          `Failed to access secret ${secretId} after retries (WebKit):`,
          response?.status(),
        );
        
        return {
          error: `API error: ${response?.status()}`,
          status: response?.status() || 500,
        } as IApiError;
      }

      try {
        const data = await response.json();
        return data;
      } catch (jsonError) {
        console.error('Error parsing API response:', jsonError);
        return {
          error: 'Failed to parse API response',
          status: 500,
        } as IApiError;
      }
    } catch (error) {
      console.error(`Error accessing secret ${secretId} (WebKit):`, error);
      return {
        error: String(error),
        status: 500,
      } as IApiError;
    }
  }

  async deleteSecret(secretId: string): Promise<null | IApiError> {
    if (!secretId) {
      console.warn('Cannot delete secret - secretId is undefined or empty');
      return {
        error: 'Secret ID is undefined or empty',
        status: 400
      } as IApiError;
    }
    
    try {
      if (!this.request) {
        throw new Error('WebkitApiClient requires a request context to be set');
      }

      // Add retry logic for API calls
      let retries = 3;
      let response;
      
      while (retries > 0) {
        response = await this.request.delete(
          `${this.baseUrl}/v1/secrets/${secretId}`,
          { timeout: 15000 } // Increase timeout
        );
        
        if (response.ok() || response.status() === 204 || response.status() === 404) {
          break;
        }
        
        console.warn(
          `Failed to delete secret (${retries} retries left): status ${response.status()}`,
        );
        
        retries--;
        if (retries > 0) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (!response) {
        return {
          error: 'Failed to delete secret',
          status: 500
        } as IApiError;
      }
      
      // 204 = Success, no content
      if (response.status() === 204) {
        return null;
      }
      
      // 404 = Already deleted or not found
      if (response.status() === 404) {
        return null;
      }
      
      // Try to parse error response
      try {
        const text = await response.text();
        return text ? JSON.parse(text) : null;
      } catch (jsonError) {
        console.error('Error parsing API response:', jsonError);
        return {
          error: 'Failed to parse API response',
          status: 500,
        } as IApiError;
      }
    } catch (error) {
      console.error(`Error deleting secret ${secretId} (WebKit):`, error);
      return null;
    }
  }
}
