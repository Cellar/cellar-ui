import { ISecretMetadata } from '../models/secretMetadata';
import { IApiError, isRateLimitError } from '../models/error';
import { ISecret } from '../models/secret';
import {
  parseRateLimitHeaders,
  parseRetryAfter,
  calculateRetryDelay,
} from './helpers';

async function handleApiResponse<T>(
  response: Response,
  parseBody: (res: Response) => Promise<T>,
): Promise<T | IApiError> {
  const rateLimit = parseRateLimitHeaders(response);

  if (response.status === 429) {
    const retryAfter = parseRetryAfter(response.headers.get('Retry-After'));
    const errorData = await response.json().catch(() => ({
      error: 'Rate limit exceeded',
    }));

    return {
      code: 429,
      message: errorData.error || 'Rate limit exceeded',
      retryAfter,
      rateLimit,
    };
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      code: response.status,
      message: response.statusText,
    }));

    return {
      code: errorData.code || response.status,
      message: errorData.message || errorData.error || response.statusText,
      rateLimit,
    };
  }

  const data = await parseBody(response);
  if (rateLimit && typeof data === 'object' && data !== null) {
    (data as { rateLimit?: typeof rateLimit }).rateLimit = rateLimit;
  }

  return data;
}

async function retryableRequest<T>(
  request: () => Promise<Response>,
  parseBody: (res: Response) => Promise<T>,
  maxRetries: number = 3,
): Promise<T | IApiError> {
  let lastError: IApiError | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await request();
      const result = await handleApiResponse(response, parseBody);

      if (isRateLimitError(result)) {
        lastError = result;

        if (attempt === maxRetries) break;

        const delay = calculateRetryDelay(attempt, result.retryAfter);
        console.log(
          `Rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      return result;
    } catch (error) {
      lastError = {
        code: 500,
        message: error instanceof Error ? error.message : 'Network error',
      };

      if (attempt === maxRetries) break;

      const delay = calculateRetryDelay(attempt);
      console.log(
        `Request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return lastError || { code: 500, message: 'Request failed after retries' };
}

export const createSecretWithText = async (
  content: string,
  expirationUtc: Date,
  accessLimit: number,
): Promise<ISecretMetadata | IApiError> => {
  const expirationEpoch = Math.floor(expirationUtc.getTime() / 1000);

  const formData = new FormData();
  formData.append('content', content);
  formData.append('expiration_epoch', String(expirationEpoch));
  formData.append('access_limit', String(accessLimit));

  return retryableRequest(
    () => fetch(`/api/v2/secrets`, { method: 'POST', body: formData }),
    (res) => res.json(),
  );
};

export const createSecretWithFile = async (
  file: File,
  expirationUtc: Date,
  accessLimit: number,
): Promise<ISecretMetadata | IApiError> => {
  const expirationEpoch = Math.floor(expirationUtc.getTime() / 1000);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('expiration_epoch', String(expirationEpoch));
  formData.append('access_limit', String(accessLimit));

  return retryableRequest(
    () => fetch(`/api/v2/secrets`, { method: 'POST', body: formData }),
    (res) => res.json(),
  );
};

export const getSecretMetadata = async (
  secretId: string,
): Promise<ISecretMetadata | IApiError> => {
  return retryableRequest(
    () => fetch(`/api/v2/secrets/${secretId}`, { method: 'GET' }),
    (res) => res.json(),
  );
};

export const accessSecret = async (
  secretId: string,
): Promise<ISecret | IApiError> => {
  return retryableRequest(
    () => fetch(`/api/v2/secrets/${secretId}/access`, { method: 'POST' }),
    async (res) => {
      const contentType = res.headers.get('content-type');

      if (contentType && contentType.includes('application/octet-stream')) {
        const blob = await res.blob();
        const contentDisposition = res.headers.get('content-disposition');
        const filenameMatch = contentDisposition?.match(/filename="([^"]+)"/);
        const filename = filenameMatch
          ? filenameMatch[1]
          : `cellar-${secretId.slice(0, 8)}`;

        return {
          id: secretId,
          content: '',
          contentType: 'file' as const,
          filename: filename,
          fileBlob: blob,
        };
      }

      const jsonResponse = await res.json();
      return {
        ...jsonResponse,
        contentType: 'text' as const,
      };
    },
  );
};

export const deleteSecret = async (
  secretId: string,
): Promise<null | IApiError> => {
  return retryableRequest(
    () => fetch(`/api/v2/secrets/${secretId}`, { method: 'DELETE' }),
    async (res) => {
      if (res.status === 204) return null;
      return res.json();
    },
  );
};
