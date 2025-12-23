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
    console.log(`WebkitApiClient initialized with API URL: ${this.baseUrl}`);
  }

  setRequest(request: APIRequestContext) {
    console.log('Setting WebkitApiClient request context');
    this.request = request;

    // Store the request in global context to make it more persistent
    // @ts-ignore - We're adding a global property
    if (global) {
      try {
        // @ts-ignore - We're adding a global property
        global.__lastWebkitRequest = request;
        console.log(
          'Stored WebKit request context in global.__lastWebkitRequest',
        );
      } catch (e) {
        console.warn('Failed to store WebKit request in global context:', e);
      }
    }

    // Log that the request context has been set
    if (this.request) {
      console.log('WebkitApiClient request context set successfully');
    } else {
      console.warn(
        'WebkitApiClient request context NOT set - operations will fail',
      );
    }
  }

  private getRequestContext(): APIRequestContext | null {
    // If we have a request context directly, use it
    if (this.request) {
      return this.request;
    }

    // Try to get it from global context
    try {
      // @ts-ignore - We're accessing a global property
      if (global && global.__lastWebkitRequest) {
        console.log(
          'Retrieved WebKit request context from global.__lastWebkitRequest',
        );
        // @ts-ignore - We're accessing a global property
        return global.__lastWebkitRequest;
      }

      // @ts-ignore - We're accessing a global property
      if (global && global.__webkitRequestContext) {
        console.log(
          'Retrieved WebKit request context from global.__webkitRequestContext',
        );
        // @ts-ignore - We're accessing a global property
        return global.__webkitRequestContext;
      }
    } catch (e) {
      console.warn('Failed to get WebKit request from global context:', e);
    }

    // No request context available
    return null;
  }

  async createSecret(
    content: string,
    expirationUtc: Date | number,
    accessLimit: number,
  ): Promise<ISecretMetadata | IApiError> {
    try {
      // Get request context with fallback to global
      const requestContext = this.getRequestContext();

      // Check if request is available, and log a very clear message if not
      if (!requestContext) {
        const error = 'WebkitApiClient requires a request context to be set';
        console.error(`ERROR: ${error}`);
        return {
          error,
          status: 500,
        } as IApiError;
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

      // Try alternative URLs if the primary one fails
      const urlFormats = [
        `${this.baseUrl}/v1/secrets`,
        `http://localhost:5173/api/v1/secrets`,
      ];

      // Add retry logic for API calls with enhanced error handling
      let retries = 5; // Increased retries for WebKit
      let response;
      let lastError;

      // Try each URL with retries
      for (const url of urlFormats) {
        if (response && response.ok()) break;

        retries = 5; // Reset retries for each URL

        console.log(`Trying to create secret at URL: ${url}`);

        while (retries > 0) {
          try {
            // Check if the request context is still valid
            if (!requestContext) {
              console.error(
                'Request context lost during retry, attempting to recover...',
              );
              // Try to get a fresh context
              const freshContext = this.getRequestContext();
              if (!freshContext) {
                throw new Error('Cannot recover request context');
              }

              // Use the fresh context
              response = await freshContext.post(url, {
                data: payload,
                headers: {
                  'Content-Type': 'application/json',
                },
                timeout: 30000, // Longer timeout for WebKit
              });
            } else {
              // Use the current context
              response = await requestContext.post(url, {
                data: payload,
                headers: {
                  'Content-Type': 'application/json',
                },
                timeout: 30000, // Longer timeout for WebKit
              });
            }

            if (response.ok()) {
              console.log(`Created secret successfully at ${url}`);
              break;
            }

            console.warn(
              `API call failed at ${url} (${retries} retries left): status ${response.status()}`,
            );
          } catch (e) {
            lastError = e;
            console.error(
              `Error during API call attempt to ${url} (${retries} retries left):`,
              e,
            );

            // Special handling for closed browser errors
            if (
              e
                .toString()
                .includes('Target page, context or browser has been closed')
            ) {
              console.log(
                'Detected closed browser error, attempting to recover request context...',
              );

              // Try to refresh the request context if possible
              try {
                // @ts-ignore - Accessing global property
                if (global && global.__webkitRequestContext) {
                  console.log(
                    'Recovered request context from global.__webkitRequestContext',
                  );
                  this.request = global.__webkitRequestContext;
                }
              } catch (recoveryError) {
                console.warn(
                  'Failed to recover request context:',
                  recoveryError,
                );
              }
            }
          }

          retries--;
          if (retries > 0) {
            // Wait longer between retries for WebKit
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        }

        // If we got a successful response, break out of the URL loop
        if (response && response.ok()) {
          break;
        }
      }

      // Handle the case where all URLs and retries failed
      if (!response || !response.ok()) {
        console.error(
          'Failed to create secret after all retries (WebKit)',
          response?.status(),
        );

        let errorText = '';
        try {
          errorText = (await response?.text()) || '';
        } catch (e) {
          errorText = 'Could not read error response';
        }

        return {
          error: `API error: ${response?.status()} ${errorText}`,
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
        status: 400,
      } as IApiError;
    }

    try {
      // Get request context with fallback to global
      const requestContext = this.getRequestContext();

      // Check if request is available, and log a very clear message if not
      if (!requestContext) {
        const error = 'WebkitApiClient requires a request context to be set';
        console.error(`ERROR: ${error}`);
        return {
          error,
          status: 500,
        } as IApiError;
      }

      // Try alternative URLs if the primary one fails
      const urlFormats = [
        `${this.baseUrl}/v1/secrets/${secretId}`,
        `http://localhost:5173/api/v1/secrets/${secretId}`,
      ];

      // Add retry logic for API calls with enhanced error handling
      let retries = 5; // Increased retries for WebKit
      let response;

      // Try each URL with retries
      for (const url of urlFormats) {
        if (response && response.ok()) break;

        retries = 5; // Reset retries for each URL
        console.log(`Trying to get metadata at URL: ${url}`);

        while (retries > 0) {
          try {
            // Check if the request context is still valid
            if (!requestContext) {
              console.error(
                'Request context lost during retry, attempting to recover...',
              );
              // Try to get a fresh context
              const freshContext = this.getRequestContext();
              if (!freshContext) {
                throw new Error('Cannot recover request context');
              }

              // Use the fresh context
              response = await freshContext.get(url, {
                timeout: 30000, // Longer timeout for WebKit
              });
            } else {
              // Use the current context
              response = await requestContext.get(url, {
                timeout: 30000, // Longer timeout for WebKit
              });
            }

            if (response.ok()) {
              console.log(`Got metadata successfully from ${url}`);
              break;
            }

            // Special case: For 404, we don't need to retry
            if (response.status() === 404) {
              console.log(`Secret ${secretId} not found (404)`);
              return {
                error: 'Secret not found',
                status: 404,
              } as IApiError;
            }

            console.warn(
              `Failed to get metadata from ${url} (${retries} retries left): status ${response.status()}`,
            );
          } catch (e) {
            console.error(
              `Error getting metadata from ${url} (${retries} retries left):`,
              e,
            );

            // Special handling for closed browser errors
            if (
              e
                .toString()
                .includes('Target page, context or browser has been closed')
            ) {
              console.log(
                'Detected closed browser error, attempting to recover request context...',
              );

              // Try to refresh the request context if possible
              try {
                // @ts-ignore - Accessing global property
                if (global && global.__webkitRequestContext) {
                  console.log(
                    'Recovered request context from global.__webkitRequestContext',
                  );
                  this.request = global.__webkitRequestContext;
                }
              } catch (recoveryError) {
                console.warn(
                  'Failed to recover request context:',
                  recoveryError,
                );
              }
            }
          }

          retries--;
          if (retries > 0) {
            // Wait longer between retries for WebKit
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        }

        // If we got a successful response, break out of the URL loop
        if (response && response.ok()) {
          break;
        }
      }

      // Handle the case where all URLs and retries failed
      if (!response || !response.ok()) {
        console.error(
          `Failed to get metadata for secret ${secretId} after all retries (WebKit):`,
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
        status: 400,
      } as IApiError;
    }

    try {
      // Get request context with fallback to global
      const requestContext = this.getRequestContext();

      // Check if request is available, and log a very clear message if not
      if (!requestContext) {
        const error = 'WebkitApiClient requires a request context to be set';
        console.error(`ERROR: ${error}`);
        return {
          error,
          status: 500,
        } as IApiError;
      }

      // Try alternative URLs if the primary one fails
      const urlFormats = [
        `${this.baseUrl}/v1/secrets/${secretId}/access`,
        `http://localhost:5173/api/v1/secrets/${secretId}/access`,
      ];

      // Add retry logic for API calls with enhanced error handling
      let retries = 5; // Increased retries for WebKit
      let response;

      // Try each URL with retries
      for (const url of urlFormats) {
        if (response && response.ok()) break;

        retries = 5; // Reset retries for each URL
        console.log(`Trying to access secret at URL: ${url}`);

        while (retries > 0) {
          try {
            // Check if the request context is still valid
            if (!requestContext) {
              console.error(
                'Request context lost during retry, attempting to recover...',
              );
              // Try to get a fresh context
              const freshContext = this.getRequestContext();
              if (!freshContext) {
                throw new Error('Cannot recover request context');
              }

              // Use the fresh context
              response = await freshContext.post(url, {
                headers: {
                  'Content-Type': 'application/json',
                },
                timeout: 30000, // Longer timeout for WebKit
              });
            } else {
              // Use the current context
              response = await requestContext.post(url, {
                headers: {
                  'Content-Type': 'application/json',
                },
                timeout: 30000, // Longer timeout for WebKit
              });
            }

            if (response.ok()) {
              console.log(`Accessed secret successfully from ${url}`);
              break;
            }

            // Special case: For 404, we don't need to retry
            if (response.status() === 404) {
              console.log(
                `Secret ${secretId} not found or access limit reached (404)`,
              );
              return {
                error: 'Secret not found or access limit reached',
                status: 404,
              } as IApiError;
            }

            console.warn(
              `Failed to access secret from ${url} (${retries} retries left): status ${response.status()}`,
            );
          } catch (e) {
            console.error(
              `Error accessing secret from ${url} (${retries} retries left):`,
              e,
            );

            // Special handling for closed browser errors
            if (
              e
                .toString()
                .includes('Target page, context or browser has been closed')
            ) {
              console.log(
                'Detected closed browser error, attempting to recover request context...',
              );

              // Try to refresh the request context if possible
              try {
                // @ts-ignore - Accessing global property
                if (global && global.__webkitRequestContext) {
                  console.log(
                    'Recovered request context from global.__webkitRequestContext',
                  );
                  this.request = global.__webkitRequestContext;
                }
              } catch (recoveryError) {
                console.warn(
                  'Failed to recover request context:',
                  recoveryError,
                );
              }
            }
          }

          retries--;
          if (retries > 0) {
            // Wait longer between retries for WebKit
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        }

        // If we got a successful response, break out of the URL loop
        if (response && response.ok()) {
          break;
        }
      }

      // Handle the case where all URLs and retries failed
      if (!response || !response.ok()) {
        console.error(
          `Failed to access secret ${secretId} after all retries (WebKit):`,
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
        status: 400,
      } as IApiError;
    }

    try {
      // Get request context with fallback to global
      const requestContext = this.getRequestContext();

      // Check if request is available, and log a very clear message if not
      if (!requestContext) {
        const error = 'WebkitApiClient requires a request context to be set';
        console.error(`ERROR: ${error}`);
        return {
          error,
          status: 500,
        } as IApiError;
      }

      // Try alternative URLs if the primary one fails
      const urlFormats = [
        `${this.baseUrl}/v1/secrets/${secretId}`,
        `http://localhost:5173/api/v1/secrets/${secretId}`,
      ];

      // Add retry logic for API calls with enhanced error handling
      let retries = 5; // Increased retries for WebKit
      let response;

      // Try each URL with retries
      for (const url of urlFormats) {
        if (
          response &&
          (response.ok() ||
            response.status() === 204 ||
            response.status() === 404)
        )
          break;

        retries = 5; // Reset retries for each URL
        console.log(`Trying to delete secret at URL: ${url}`);

        while (retries > 0) {
          try {
            // Check if the request context is still valid
            if (!requestContext) {
              console.error(
                'Request context lost during retry, attempting to recover...',
              );
              // Try to get a fresh context
              const freshContext = this.getRequestContext();
              if (!freshContext) {
                throw new Error('Cannot recover request context');
              }

              // Use the fresh context
              response = await freshContext.delete(url, {
                timeout: 30000, // Longer timeout for WebKit
              });
            } else {
              // Use the current context
              response = await requestContext.delete(url, {
                timeout: 30000, // Longer timeout for WebKit
              });
            }

            if (
              response.ok() ||
              response.status() === 204 ||
              response.status() === 404
            ) {
              console.log(
                `Deleted secret successfully from ${url} (status ${response.status()})`,
              );
              break;
            }

            console.warn(
              `Failed to delete secret from ${url} (${retries} retries left): status ${response.status()}`,
            );
          } catch (e) {
            console.error(
              `Error deleting secret from ${url} (${retries} retries left):`,
              e,
            );

            // Special handling for closed browser errors
            if (
              e
                .toString()
                .includes('Target page, context or browser has been closed')
            ) {
              console.log(
                'Detected closed browser error, attempting to recover request context...',
              );

              // Try to refresh the request context if possible
              try {
                // @ts-ignore - Accessing global property
                if (global && global.__webkitRequestContext) {
                  console.log(
                    'Recovered request context from global.__webkitRequestContext',
                  );
                  this.request = global.__webkitRequestContext;
                }
              } catch (recoveryError) {
                console.warn(
                  'Failed to recover request context:',
                  recoveryError,
                );
              }
            }
          }

          retries--;
          if (retries > 0) {
            // Wait longer between retries for WebKit
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        }

        // If we got a successful response, break out of the URL loop
        if (
          response &&
          (response.ok() ||
            response.status() === 204 ||
            response.status() === 404)
        ) {
          break;
        }
      }

      // Handle the case where all URLs failed
      if (!response) {
        console.error(
          'Failed to delete secret - no response after all retries',
        );
        return {
          error: 'Failed to delete secret',
          status: 500,
        } as IApiError;
      }

      // 204 = Success, no content
      if (response.status() === 204) {
        console.log(`Successfully deleted secret ${secretId} (204 No Content)`);
        return null;
      }

      // 404 = Already deleted or not found
      if (response.status() === 404) {
        console.log(`Secret ${secretId} already deleted or not found (404)`);
        return null;
      }

      if (!response.ok()) {
        console.error(
          `Unexpected response status ${response.status()} when deleting secret ${secretId}`,
        );

        // Try to parse error response
        try {
          const text = await response.text();
          console.log(`Error response text: ${text}`);
          return text
            ? JSON.parse(text)
            : ({
                error: `Unexpected response status: ${response.status()}`,
                status: response.status(),
              } as IApiError);
        } catch (jsonError) {
          console.error('Error parsing API response:', jsonError);
          return {
            error: `Failed to parse API response: ${jsonError}`,
            status: 500,
          } as IApiError;
        }
      }

      return null;
    } catch (error) {
      console.error(`Error deleting secret ${secretId} (WebKit):`, error);
      // Return null for deletion errors to be more lenient
      return null;
    }
  }
}
