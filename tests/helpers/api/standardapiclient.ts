import { ISecretMetadata } from '../models/secretMetadata';
import { IApiError } from '../models/error';
import { ISecret } from '../models/secret';
import { config } from '../../e2e/config';
import { IApiClient } from './iapiclient';

export class StandardApiClient implements IApiClient {
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

      // Add retry logic for API calls
      let retries = 3;
      let res;
      
      while (retries > 0) {
        try {
          res = await fetch(`${this.baseUrl}/v1/secrets`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });
          
          if (res.ok) {
            break;
          }
          
          console.warn(
            `API call failed (${retries} retries left): status ${res.status}`,
          );
        } catch (fetchError) {
          console.warn(`Fetch error (${retries} retries left):`, fetchError);
        }
        
        retries--;
        if (retries > 0) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (!res || !res.ok) {
        console.error(
          'Failed to create secret after retries:',
          res?.status,
          res?.statusText,
        );
        
        return {
          error: `API error: ${res?.status} ${res?.statusText}`,
          status: res?.status || 500,
        } as IApiError;
      }

      try {
        const data = await res.json();
        console.log(`Created secret with ID: ${data.id}`);
        
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
      console.error('Error creating secret:', error);
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
      // Add retry logic for API calls
      let retries = 3;
      let res;
      
      while (retries > 0) {
        try {
          res = await fetch(`${this.baseUrl}/v1/secrets/${secretId}`, {
            method: 'GET',
          });
          
          if (res.ok) {
            break;
          }
          
          // Special case: For 404, we don't need to retry
          if (res.status === 404) {
            return {
              error: 'Secret not found',
              status: 404
            } as IApiError;
          }
          
          console.warn(
            `Failed to get metadata (${retries} retries left): status ${res.status}`,
          );
        } catch (fetchError) {
          console.warn(`Fetch error (${retries} retries left):`, fetchError);
        }
        
        retries--;
        if (retries > 0) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (!res || !res.ok) {
        console.error(
          `Failed to get metadata for secret ${secretId} after retries:`,
          res?.status,
        );
        
        return {
          error: `API error: ${res?.status}`,
          status: res?.status || 500,
        } as IApiError;
      }

      try {
        const data = await res.json();
        return data;
      } catch (jsonError) {
        console.error('Error parsing API response:', jsonError);
        return {
          error: 'Failed to parse API response',
          status: 500,
        } as IApiError;
      }
    } catch (error) {
      console.error(`Error getting metadata for secret ${secretId}:`, error);
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
      // Add retry logic for API calls
      let retries = 3;
      let res;
      
      while (retries > 0) {
        try {
          res = await fetch(`${this.baseUrl}/v1/secrets/${secretId}/access`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (res.ok) {
            break;
          }
          
          // Special case: For 404, we don't need to retry
          if (res.status === 404) {
            return {
              error: 'Secret not found or access limit reached',
              status: 404
            } as IApiError;
          }
          
          console.warn(
            `Failed to access secret (${retries} retries left): status ${res.status}`,
          );
        } catch (fetchError) {
          console.warn(`Fetch error (${retries} retries left):`, fetchError);
        }
        
        retries--;
        if (retries > 0) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (!res || !res.ok) {
        console.error(
          `Failed to access secret ${secretId} after retries:`,
          res?.status,
        );
        
        return {
          error: `API error: ${res?.status}`,
          status: res?.status || 500,
        } as IApiError;
      }

      try {
        const data = await res.json();
        return data;
      } catch (jsonError) {
        console.error('Error parsing API response:', jsonError);
        return {
          error: 'Failed to parse API response',
          status: 500,
        } as IApiError;
      }
    } catch (error) {
      console.error(`Error accessing secret ${secretId}:`, error);
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
      // Add retry logic for API calls
      let retries = 3;
      let res;
      
      while (retries > 0) {
        try {
          res = await fetch(`${this.baseUrl}/v1/secrets/${secretId}`, {
            method: 'DELETE',
          });
          
          if (res.ok || res.status === 204 || res.status === 404) {
            break;
          }
          
          console.warn(
            `Failed to delete secret (${retries} retries left): status ${res.status}`,
          );
        } catch (fetchError) {
          console.warn(`Fetch error (${retries} retries left):`, fetchError);
        }
        
        retries--;
        if (retries > 0) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (!res) {
        return {
          error: 'Failed to delete secret',
          status: 500
        } as IApiError;
      }
      
      // 204 = Success, no content
      if (res.status === 204) {
        return null;
      }
      
      // 404 = Already deleted or not found
      if (res.status === 404) {
        return null;
      }
      
      // Try to parse error response
      try {
        const text = await res.text();
        return text ? JSON.parse(text) : null;
      } catch (jsonError) {
        console.error('Error parsing API response:', jsonError);
        return {
          error: 'Failed to parse API response',
          status: 500,
        } as IApiError;
      }
    } catch (error) {
      console.error(`Error deleting secret ${secretId}:`, error);
      return null;
    }
  }
}
