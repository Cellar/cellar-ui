import { describe, beforeEach, expect, it, vi } from 'vitest';
import {
  accessSecret,
  createSecretWithText,
  createSecretWithFile,
  deleteSecret,
  getSecretMetadata,
} from './client';
import { ISecretMetadata } from '@/models/secretMetadata';
import { IApiError } from '@/models/error';
import { ISecret } from '@/models/secret';

describe('SecretsService', () => {
  const secretMetadata: ISecretMetadata = {
    id: 'V5nIvLMxZUYP4',
    access_count: 0,
    access_limit: 5,
    expiration: new Date(),
  };

  const secret: ISecret = {
    id: 'V5nIvLMxZUYP4',
    content: 'TSJ271HWvlSM 0dkxJ0J Cp57zLGlJsgwIl1 Oe510U893sU 7zn',
  };
  const badRequest: IApiError = { code: 400, message: 'Bad Request' };

  function createFetchResponse(
    data: any,
    contentType: string = 'application/json',
    status: number = 200,
    headers: Record<string, string> = {},
  ) {
    return {
      ok: status >= 200 && status < 300,
      status,
      json: () => new Promise((resolve) => resolve(data)),
      blob: () => new Promise((resolve) => resolve(data)),
      headers: {
        get: (name: string) => {
          if (name === 'content-type') return contentType;
          return headers[name] || null;
        },
      },
    };
  }

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  describe('when creating a secret with text', () => {
    async function performTest(): Promise<ISecretMetadata | IApiError> {
      return await createSecretWithText(
        secret.content,
        secretMetadata.expiration,
        secretMetadata.access_limit,
      );
    }

    describe('and request is successful', () => {
      let actual: ISecretMetadata;
      let formData: FormData;

      beforeEach(async () => {
        fetch.mockResolvedValue(createFetchResponse(secretMetadata));
        actual = (await performTest()) as ISecretMetadata;
        formData = fetch.mock.calls[0][1].body as FormData;
      });

      it('should make POST request to v2 endpoint', () =>
        expect(fetch.mock.calls[0][0]).toBe('/api/v2/secrets'));
      it('should use POST method', () =>
        expect(fetch.mock.calls[0][1].method).toBe('POST'));
      it('should include content in FormData', () =>
        expect(formData.get('content')).toBe(secret.content));
      it('should include expiration_epoch in FormData', () =>
        expect(formData.get('expiration_epoch')).toBe(
          String(Math.floor(secretMetadata.expiration.getTime() / 1000)),
        ));
      it('should include access_limit in FormData', () =>
        expect(formData.get('access_limit')).toBe(
          String(secretMetadata.access_limit),
        ));
      it('should respond with expected id', () =>
        expect(actual.id).toEqual(secretMetadata.id));
      it('should respond with expected access limit', () =>
        expect(actual.access_limit).toEqual(secretMetadata.access_limit));
      it('should respond with expected access count', () =>
        expect(actual.access_count).toEqual(secretMetadata.access_count));
      it('should respond with expected expiration', () =>
        expect(actual.expiration).toEqual(secretMetadata.expiration));
    });

    describe('and request is unsuccessful', () => {
      let actual: IApiError;
      let formData: FormData;

      beforeEach(async () => {
        fetch.mockResolvedValue(createFetchResponse(badRequest));
        actual = (await performTest()) as IApiError;
        formData = fetch.mock.calls[0][1].body as FormData;
      });

      it('should make POST request to v2 endpoint', () =>
        expect(fetch.mock.calls[0][0]).toBe('/api/v2/secrets'));
      it('should use POST method', () =>
        expect(fetch.mock.calls[0][1].method).toBe('POST'));
      it('should include content in FormData', () =>
        expect(formData.get('content')).toBe(secret.content));
      it('should include expiration_epoch in FormData', () =>
        expect(formData.get('expiration_epoch')).toBe(
          String(Math.floor(secretMetadata.expiration.getTime() / 1000)),
        ));
      it('should include access_limit in FormData', () =>
        expect(formData.get('access_limit')).toBe(
          String(secretMetadata.access_limit),
        ));
      it('should respond with error code', () =>
        expect(actual.code).toEqual(badRequest.code));
      it('should respond with error message', () =>
        expect(actual.message).toEqual(badRequest.message));
    });
  });

  describe('when creating a secret with file', () => {
    const testFile = new File(['test content'], 'test.txt', {
      type: 'text/plain',
    });

    async function performTest(): Promise<ISecretMetadata | IApiError> {
      return await createSecretWithFile(
        testFile,
        secretMetadata.expiration,
        secretMetadata.access_limit,
      );
    }

    describe('and request is successful', () => {
      let actual: ISecretMetadata;
      let formData: FormData;

      beforeEach(async () => {
        fetch.mockResolvedValue(createFetchResponse(secretMetadata));
        actual = (await performTest()) as ISecretMetadata;
        formData = fetch.mock.calls[0][1].body as FormData;
      });

      it('should make POST request to v2 endpoint', () =>
        expect(fetch.mock.calls[0][0]).toBe('/api/v2/secrets'));
      it('should use POST method', () =>
        expect(fetch.mock.calls[0][1].method).toBe('POST'));
      it('should include file in FormData', () =>
        expect(formData.get('file')).toBe(testFile));
      it('should include expiration_epoch in FormData', () =>
        expect(formData.get('expiration_epoch')).toBe(
          String(Math.floor(secretMetadata.expiration.getTime() / 1000)),
        ));
      it('should include access_limit in FormData', () =>
        expect(formData.get('access_limit')).toBe(
          String(secretMetadata.access_limit),
        ));
      it('should respond with expected id', () =>
        expect(actual.id).toEqual(secretMetadata.id));
      it('should respond with expected access limit', () =>
        expect(actual.access_limit).toEqual(secretMetadata.access_limit));
      it('should respond with expected access count', () =>
        expect(actual.access_count).toEqual(secretMetadata.access_count));
      it('should respond with expected expiration', () =>
        expect(actual.expiration).toEqual(secretMetadata.expiration));
    });

    describe('and request is unsuccessful', () => {
      let actual: IApiError;
      let formData: FormData;

      beforeEach(async () => {
        fetch.mockResolvedValue(createFetchResponse(badRequest));
        actual = (await performTest()) as IApiError;
        formData = fetch.mock.calls[0][1].body as FormData;
      });

      it('should make POST request to v2 endpoint', () =>
        expect(fetch.mock.calls[0][0]).toBe('/api/v2/secrets'));
      it('should use POST method', () =>
        expect(fetch.mock.calls[0][1].method).toBe('POST'));
      it('should include file in FormData', () =>
        expect(formData.get('file')).toBe(testFile));
      it('should include expiration_epoch in FormData', () =>
        expect(formData.get('expiration_epoch')).toBe(
          String(Math.floor(secretMetadata.expiration.getTime() / 1000)),
        ));
      it('should include access_limit in FormData', () =>
        expect(formData.get('access_limit')).toBe(
          String(secretMetadata.access_limit),
        ));
      it('should respond with error code', () =>
        expect(actual.code).toEqual(badRequest.code));
      it('should respond with error message', () =>
        expect(actual.message).toEqual(badRequest.message));
    });
  });

  describe('when getting secret metadata', () => {
    async function performTest(): Promise<ISecretMetadata | IApiError> {
      return await getSecretMetadata(secretMetadata.id);
    }

    describe('and request is successful', () => {
      let actual: ISecretMetadata;

      beforeEach(async () => {
        fetch.mockResolvedValue(createFetchResponse(secretMetadata));
        actual = (await performTest()) as ISecretMetadata;
      });

      it('should make GET request to v2 endpoint', () =>
        expect(fetch.mock.calls[0][0]).toBe(
          `/api/v2/secrets/${secretMetadata.id}`,
        ));
      it('should use GET method', () =>
        expect(fetch.mock.calls[0][1].method).toBe('GET'));
      it('should respond with expected id', () =>
        expect(actual.id).toEqual(secretMetadata.id));
      it('should respond with expected access limit', () =>
        expect(actual.access_limit).toEqual(secretMetadata.access_limit));
      it('should respond with expected access count', () =>
        expect(actual.access_count).toEqual(secretMetadata.access_count));
      it('should respond with expected expiration', () =>
        expect(actual.expiration).toEqual(secretMetadata.expiration));
    });

    describe('and request is unsuccessful', () => {
      let actual: IApiError;

      beforeEach(async () => {
        fetch.mockResolvedValue(createFetchResponse(badRequest));
        actual = (await performTest()) as IApiError;
      });

      it('should make GET request to v2 endpoint', () =>
        expect(fetch.mock.calls[0][0]).toBe(
          `/api/v2/secrets/${secretMetadata.id}`,
        ));
      it('should use GET method', () =>
        expect(fetch.mock.calls[0][1].method).toBe('GET'));
      it('should respond with error code', () =>
        expect(actual.code).toEqual(badRequest.code));
      it('should respond with error message', () =>
        expect(actual.message).toEqual(badRequest.message));
    });
  });

  describe('when accessing a secret', () => {
    async function performTest(): Promise<ISecret | IApiError> {
      return await accessSecret(secretMetadata.id);
    }

    describe('and request is successful', () => {
      let actual: ISecret;

      beforeEach(async () => {
        fetch.mockResolvedValue(createFetchResponse(secret));
        actual = (await performTest()) as ISecret;
      });

      it('should make POST request to v2 access endpoint', () =>
        expect(fetch.mock.calls[0][0]).toBe(
          `/api/v2/secrets/${secret.id}/access`,
        ));
      it('should use POST method', () =>
        expect(fetch.mock.calls[0][1].method).toBe('POST'));
      it('should respond with expected id', () =>
        expect(actual.id).toEqual(secret.id));
      it('should respond with expected content', () =>
        expect(actual.content).toEqual(secret.content));
    });

    describe('and request is unsuccessful', () => {
      let actual: IApiError;

      beforeEach(async () => {
        fetch.mockResolvedValue(createFetchResponse(badRequest));
        actual = (await performTest()) as IApiError;
      });

      it('should make POST request to v2 access endpoint', () =>
        expect(fetch.mock.calls[0][0]).toBe(
          `/api/v2/secrets/${secret.id}/access`,
        ));
      it('should use POST method', () =>
        expect(fetch.mock.calls[0][1].method).toBe('POST'));
      it('should respond with error code', () =>
        expect(actual.code).toEqual(badRequest.code));
      it('should respond with error message', () =>
        expect(actual.message).toEqual(badRequest.message));
    });

    describe('and response is a file (octet-stream)', () => {
      let actual: ISecret;
      const fileContent = new Uint8Array([1, 2, 3, 4, 5]);
      const testBlob = new Blob([fileContent], {
        type: 'application/octet-stream',
      });

      beforeEach(async () => {
        fetch.mockResolvedValue({
          ok: true,
          status: 200,
          headers: {
            get: (name: string) => {
              if (name === 'content-type') return 'application/octet-stream';
              if (name === 'content-disposition')
                return 'attachment; filename="test-file.pdf"';
              return null;
            },
          },
          blob: () => Promise.resolve(testBlob),
        });
        actual = (await performTest()) as ISecret;
      });

      it('should make POST request to v2 access endpoint', () =>
        expect(fetch.mock.calls[0][0]).toBe(
          `/api/v2/secrets/${secretMetadata.id}/access`,
        ));
      it('should use POST method', () =>
        expect(fetch.mock.calls[0][1].method).toBe('POST'));
      it('should respond with contentType as file', () =>
        expect(actual.contentType).toBe('file'));
      it('should respond with extracted filename', () =>
        expect(actual.filename).toBe('test-file.pdf'));
      it('should respond with fileBlob', () =>
        expect(actual.fileBlob).toEqual(testBlob));
      it('should respond with empty content', () =>
        expect(actual.content).toBe(''));
      it('should respond with secret id', () =>
        expect(actual.id).toBe(secretMetadata.id));
    });

    describe('and response is a file without filename in header', () => {
      let actual: ISecret;
      const fileContent = new Uint8Array([1, 2, 3]);
      const testBlob = new Blob([fileContent], {
        type: 'application/octet-stream',
      });

      beforeEach(async () => {
        fetch.mockResolvedValue({
          ok: true,
          status: 200,
          headers: {
            get: (name: string) => {
              if (name === 'content-type') return 'application/octet-stream';
              return null;
            },
          },
          blob: () => Promise.resolve(testBlob),
        });
        actual = (await performTest()) as ISecret;
      });

      it('should use fallback filename with secret id prefix', () =>
        expect(actual.filename).toBe(
          `cellar-${secretMetadata.id.slice(0, 8)}`,
        ));
      it('should respond with contentType as file', () =>
        expect(actual.contentType).toBe('file'));
      it('should respond with fileBlob', () =>
        expect(actual.fileBlob).toEqual(testBlob));
    });
  });

  describe('when deleting a secret', () => {
    async function performTest(): Promise<null | IApiError> {
      return await deleteSecret(secretMetadata.id);
    }

    describe('and request is successful', () => {
      let actual: ISecret;

      beforeEach(async () => {
        fetch.mockResolvedValue(
          createFetchResponse(null, 'application/json', 204),
        );
        actual = (await performTest()) as null;
      });

      it('should make DELETE request to v2 endpoint', () =>
        expect(fetch.mock.calls[0][0]).toBe(`/api/v2/secrets/${secret.id}`));
      it('should use DELETE method', () =>
        expect(fetch.mock.calls[0][1].method).toBe('DELETE'));
      it('should respond with null', () => expect(actual).toBeNull());
    });

    describe('and request is unsuccessful', () => {
      let actual: IApiError;

      beforeEach(async () => {
        fetch.mockResolvedValue(createFetchResponse(badRequest));
        actual = (await performTest()) as IApiError;
      });

      it('should make DELETE request to v2 endpoint', () =>
        expect(fetch.mock.calls[0][0]).toBe(`/api/v2/secrets/${secret.id}`));
      it('should use DELETE method', () =>
        expect(fetch.mock.calls[0][1].method).toBe('DELETE'));
      it('should respond with error code', () =>
        expect(actual.code).toEqual(badRequest.code));
      it('should respond with error message', () =>
        expect(actual.message).toEqual(badRequest.message));
    });
  });

  describe('when rate limit error (429) occurs', () => {
    const rateLimitError = {
      error: 'Rate limit exceeded. Try again in 60 seconds.',
    };

    const rateLimitHeaders = {
      'Retry-After': '60',
      'X-RateLimit-Limit': '300',
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': '1736705220',
    };

    describe('and createSecretWithText receives 429', () => {
      let actual: IApiError;

      beforeEach(async () => {
        fetch.mockResolvedValue(
          createFetchResponse(
            rateLimitError,
            'application/json',
            429,
            rateLimitHeaders,
          ),
        );

        vi.useFakeTimers();
        const promise = createSecretWithText(
          secret.content,
          secretMetadata.expiration,
          secretMetadata.access_limit,
        );
        // Wait for all retry attempts: 60s * 3 retries + buffer
        await vi.advanceTimersByTimeAsync(200000);
        actual = (await promise) as IApiError;
        vi.useRealTimers();
      });

      it('should return error with code 429', () =>
        expect(actual.code).toBe(429));
      it('should include error message', () =>
        expect(actual.message).toBe(rateLimitError.error));
      it('should include retryAfter', () => expect(actual.retryAfter).toBe(60));
      it('should include rateLimit info', () => {
        expect(actual.rateLimit).toBeDefined();
        expect(actual.rateLimit?.limit).toBe(300);
        expect(actual.rateLimit?.remaining).toBe(0);
      });
    });

    describe('and retry logic succeeds after 429', () => {
      let actual: ISecretMetadata;

      beforeEach(async () => {
        vi.useFakeTimers();
        fetch
          .mockResolvedValueOnce(
            createFetchResponse(
              rateLimitError,
              'application/json',
              429,
              rateLimitHeaders,
            ),
          )
          .mockResolvedValueOnce(
            createFetchResponse(
              rateLimitError,
              'application/json',
              429,
              rateLimitHeaders,
            ),
          )
          .mockResolvedValueOnce(createFetchResponse(secretMetadata));

        const promise = createSecretWithText(
          secret.content,
          secretMetadata.expiration,
          secretMetadata.access_limit,
        );

        // Wait for 2 retries: 60s * 2 + buffer
        await vi.advanceTimersByTimeAsync(130000);
        actual = (await promise) as ISecretMetadata;
        vi.useRealTimers();
      });

      it('should call fetch 3 times', () =>
        expect(fetch).toHaveBeenCalledTimes(3));
      it('should return successful result', () =>
        expect(actual.id).toBe(secretMetadata.id));
    });

    describe('and retry exhausted after max attempts', () => {
      let actual: IApiError;

      beforeEach(async () => {
        vi.useFakeTimers();
        fetch.mockResolvedValue(
          createFetchResponse(
            rateLimitError,
            'application/json',
            429,
            rateLimitHeaders,
          ),
        );

        const promise = createSecretWithText(
          secret.content,
          secretMetadata.expiration,
          secretMetadata.access_limit,
        );

        // Wait for all retry attempts: 60s * 3 retries + buffer
        await vi.advanceTimersByTimeAsync(200000);
        actual = (await promise) as IApiError;
        vi.useRealTimers();
      });

      it('should call fetch 4 times (initial + 3 retries)', () =>
        expect(fetch).toHaveBeenCalledTimes(4));
      it('should return 429 error', () => expect(actual.code).toBe(429));
    });
  });

  describe('when successful response includes rate limit headers', () => {
    const rateLimitHeaders = {
      'X-RateLimit-Limit': '300',
      'X-RateLimit-Remaining': '250',
      'X-RateLimit-Reset': '1736705220',
    };

    describe('and getSecretMetadata succeeds', () => {
      let actual: ISecretMetadata & { rateLimit?: any };

      beforeEach(async () => {
        fetch.mockResolvedValue(
          createFetchResponse(
            secretMetadata,
            'application/json',
            200,
            rateLimitHeaders,
          ),
        );
        actual = (await getSecretMetadata(
          secretMetadata.id,
        )) as ISecretMetadata;
      });

      it('should include rateLimit in response', () => {
        expect(actual.rateLimit).toBeDefined();
      });
      it('should include correct limit', () => {
        expect(actual.rateLimit?.limit).toBe(300);
      });
      it('should include correct remaining', () => {
        expect(actual.rateLimit?.remaining).toBe(250);
      });
      it('should calculate percentUsed', () => {
        expect(actual.rateLimit?.percentUsed).toBeCloseTo(16.67, 1);
      });
    });
  });

  describe('when network error occurs', () => {
    describe('and error is thrown during fetch', () => {
      let actual: IApiError;

      beforeEach(async () => {
        vi.useFakeTimers();
        fetch
          .mockRejectedValueOnce(new Error('Network error'))
          .mockRejectedValueOnce(new Error('Network error'))
          .mockResolvedValueOnce(createFetchResponse(secretMetadata));

        const promise = getSecretMetadata(secretMetadata.id);
        await vi.advanceTimersByTimeAsync(5000);
        actual = (await promise) as any;
        vi.useRealTimers();
      });

      it('should retry on network errors', () =>
        expect(fetch).toHaveBeenCalledTimes(3));
      it('should succeed after retries', () =>
        expect((actual as ISecretMetadata).id).toBe(secretMetadata.id));
    });
  });
});
