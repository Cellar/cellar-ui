import { describe, beforeEach, expect, it, vi, assertType } from 'vitest';
import {
  accessSecret,
  createSecret,
  deleteSecret,
  getSecretMetadata,
} from './client';
import { ISecretMetadata } from '../models/secretMetadata';
import { IApiError } from '../models/error';
import { ISecret } from '../models/secret';

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

  function createFetchResponse(data: any) {
    return { json: () => new Promise((resolve) => resolve(data)) };
  }

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  describe('when creating a secret', () => {
    async function performTest(): Promise<ISecretMetadata | IApiError> {
      return await createSecret(
        secret.content,
        secretMetadata.expiration,
        secretMetadata.access_limit,
      );
    }

    describe('and request is successful', () => {
      let actual: ISecretMetadata;

      beforeEach(async () => {
        fetch.mockResolvedValue(createFetchResponse(secretMetadata));
        actual = (await performTest()) as ISecretMetadata;
      });

      it('should make the correct request', () =>
        expect(fetch).toHaveBeenCalledExactlyOnceWith('/api/v1/secrets', {
          method: 'POST',
          body: JSON.stringify({
            content: secret.content,
            expiration_epoch: Math.floor(
              secretMetadata.expiration.getTime() / 1000,
            ),
            access_limit: secretMetadata.access_limit,
          }),
        }));
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

      it('should make the correct request', () =>
        expect(fetch).toHaveBeenCalledExactlyOnceWith('/api/v1/secrets', {
          method: 'POST',
          body: JSON.stringify({
            content: secret.content,
            expiration_epoch: Math.floor(
              secretMetadata.expiration.getTime() / 1000,
            ),
            access_limit: secretMetadata.access_limit,
          }),
        }));
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

      it('should make the correct request', () =>
        expect(fetch).toHaveBeenCalledExactlyOnceWith(
          `/api/v1/secrets/${secretMetadata.id}`,
          {
            method: 'GET',
          },
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

      beforeEach(async () => {
        fetch.mockResolvedValue(createFetchResponse(badRequest));
        actual = (await performTest()) as IApiError;
      });

      it('should make the correct request', () =>
        expect(fetch).toHaveBeenCalledExactlyOnceWith(
          `/api/v1/secrets/${secretMetadata.id}`,
          {
            method: 'GET',
          },
        ));
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

      it('should make the correct request', () =>
        expect(fetch).toHaveBeenCalledExactlyOnceWith(
          `/api/v1/secrets/${secret.id}/access`,
          {
            method: 'POST',
          },
        ));
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

      it('should make the correct request', () =>
        expect(fetch).toHaveBeenCalledExactlyOnceWith(
          `/api/v1/secrets/${secret.id}/access`,
          {
            method: 'POST',
          },
        ));
      it('should respond with error code', () =>
        expect(actual.code).toEqual(badRequest.code));
      it('should respond with error message', () =>
        expect(actual.message).toEqual(badRequest.message));
    });
  });

  describe('when deleting a secret', () => {
    async function performTest(): Promise<null | IApiError> {
      return await deleteSecret(secretMetadata.id);
    }

    describe('and request is successful', () => {
      let actual: ISecret;

      beforeEach(async () => {
        fetch.mockResolvedValue(createFetchResponse(null));
        actual = (await performTest()) as nuoo;
      });

      it('should make the correct request', () =>
        expect(fetch).toHaveBeenCalledWith(`/api/v1/secrets/${secret.id}`, {
          method: 'DELETE',
        }));
      it('should respond with null', () => expect(actual).toBeNull());
    });

    describe('and request is unsuccessful', () => {
      let actual: IApiError;

      beforeEach(async () => {
        fetch.mockResolvedValue(createFetchResponse(badRequest));
        actual = (await performTest()) as IApiError;
      });

      it('should make the correct request', () =>
        expect(fetch).toHaveBeenCalledWith(`/api/v1/secrets/${secret.id}`, {
          method: 'DELETE',
        }));
      it('should respond with error code', () =>
        expect(actual.code).toEqual(badRequest.code));
      it('should respond with error message', () =>
        expect(actual.message).toEqual(badRequest.message));
    });
  });
});
