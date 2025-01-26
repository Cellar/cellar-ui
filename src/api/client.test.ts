import { describe, beforeEach, expect, it, vi } from 'vitest';
import {
  accessSecret,
  createSecret,
  deleteSecret,
  getSecretMetadata,
} from './client';
import { ISecretMetadata } from '../models/secretMetadata';
import { IApiError } from '../models/error';
import { ISecret } from '../models/secret';

function createFetchResponse(data: any) {
  return { json: () => new Promise((resolve) => resolve(data)) };
}

describe('SecretsService', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  describe('when creating a secret', () => {
    let actual: ISecretMetadata | IApiError;

    const expected: ISecretMetadata = {
      id: 'V5nIvLMxZUYP4',
      access_count: 0,
      access_limit: 5,
      expiration: new Date(),
    };
    const secretContent =
      'TSJ271HWvlSM 0dkxJ0J Cp57zLGlJsgwIl1 Oe510U893sU 7zn';

    beforeEach(async () => {
      fetch.mockResolvedValue(createFetchResponse(expected));
      actual = await createSecret(
        secretContent,
        expected.expiration,
        expected.access_limit,
      );
    });

    it('should make the correct request', () =>
      expect(fetch).toHaveBeenCalledExactlyOnceWith('/api/v1/secrets', {
        method: 'POST',
        body: JSON.stringify({
          content: secretContent,
          expiration_epoch: Math.floor(expected.expiration.getTime() / 1000),
          access_limit: expected.access_limit,
        }),
      }));
    it('should respond with expected id', () =>
      expect(actual.id).toEqual(expected.id));
    it('should respond with expected access limit', () =>
      expect(actual.access_limit).toEqual(expected.access_limit));
    it('should respond with expected access count', () =>
      expect(actual.access_count).toEqual(expected.access_count));
    it('should respond with expected expiration', () =>
      expect(actual.expiration).toEqual(expected.expiration));
  });

  describe('when getting secret metadata', () => {
    let actual: ISecretMetadata | IApiError;

    const expected: ISecretMetadata = {
      id: 'V5nIvLMxZUYP4',
      access_count: 0,
      access_limit: 5,
      expiration: new Date(),
    };

    beforeEach(async () => {
      fetch.mockResolvedValue(createFetchResponse(expected));
      actual = await getSecretMetadata(expected.id);
    });

    it('should make the correct request', () =>
      expect(fetch).toHaveBeenCalledExactlyOnceWith(
        `/api/v1/secrets/${expected.id}`,
        {
          method: 'GET',
        },
      ));
    it('should respond with expected id', () =>
      expect(actual.id).toEqual(expected.id));
    it('should respond with expected access limit', () =>
      expect(actual.access_limit).toEqual(expected.access_limit));
    it('should respond with expected access count', () =>
      expect(actual.access_count).toEqual(expected.access_count));
    it('should respond with expected expiration', () =>
      expect(actual.expiration).toEqual(expected.expiration));
  });

  describe('when accessing a secret', () => {
    let actual: ISecret | IApiError;

    const expected: ISecret = {
      id: 'V5nIvLMxZUYP4',
      content: 'TSJ271HWvlSM 0dkxJ0J Cp57zLGlJsgwIl1 Oe510U893sU 7zn',
    };

    beforeEach(async () => {
      fetch.mockResolvedValue(createFetchResponse(expected));
      actual = await accessSecret(expected.id);
    });

    it('should make the correct request', () =>
      expect(fetch).toHaveBeenCalledExactlyOnceWith(
        `/api/v1/secrets/${expected.id}/access`,
        {
          method: 'POST',
        },
      ));
    it('should respond with expected id', () =>
      expect(actual.id).toEqual(expected.id));
    it('should respond with expected content', () =>
      expect(actual.content).toEqual(expected.content));
  });

  describe('when deleting a secret', () => {
    let actual: null | IApiError;

    const secretId = 'V5nIvLMxZUYP4';

    beforeEach(async () => {
      fetch.mockResolvedValue(createFetchResponse(null));
      actual = await deleteSecret(secretId);
    });

    it('should make the correct request', () =>
      expect(fetch).toHaveBeenCalledWith(`/api/v1/secrets/${secretId}`, {
        method: 'DELETE',
      }));
    it('should respond with null', () => expect(actual).toBeNull());
  });
});
