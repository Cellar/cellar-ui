import { describe, it, expect } from 'vitest';
import { IApiError, isRateLimitError, hasRateLimitInfo } from './error';

describe('when isRateLimitError is called', () => {
  const validRateLimitErrors = [
    {
      name: 'basic 429 error',
      error: { code: 429, message: 'Rate limit exceeded' },
    },
    {
      name: '429 with retryAfter',
      error: { code: 429, message: 'Rate limit exceeded', retryAfter: 60 },
    },
    {
      name: '429 with rateLimit info',
      error: {
        code: 429,
        message: 'Rate limit exceeded',
        rateLimit: {
          limit: 300,
          remaining: 0,
          reset: 123456,
          percentUsed: 100,
        },
      },
    },
  ];

  validRateLimitErrors.forEach(({ name, error }) => {
    describe(`and error is ${name}`, () => {
      it('should return true', () => {
        expect(isRateLimitError(error)).toBe(true);
      });
    });
  });

  const invalidInputs = [
    { name: 'non-429 IApiError', value: { code: 404, message: 'Not found' } },
    { name: 'null', value: null },
    { name: 'undefined', value: undefined },
    { name: 'string', value: 'error' },
    { name: 'number', value: 429 },
    { name: 'object without code', value: { message: 'error' } },
    { name: 'empty object', value: {} },
  ];

  invalidInputs.forEach(({ name, value }) => {
    describe(`and error is ${name}`, () => {
      it('should return false', () => {
        expect(isRateLimitError(value)).toBe(false);
      });
    });
  });
});

describe('when hasRateLimitInfo is called', () => {
  const validResponses = [
    {
      name: 'object with rateLimit',
      response: {
        id: 'test-id',
        rateLimit: {
          limit: 300,
          remaining: 250,
          reset: 1736705220,
          percentUsed: 16.67,
        },
      },
    },
    {
      name: 'IApiError with rateLimit',
      response: {
        code: 429,
        message: 'Rate limit exceeded',
        rateLimit: {
          limit: 300,
          remaining: 0,
          reset: 1736705220,
          percentUsed: 100,
        },
      },
    },
    {
      name: 'minimal object with rateLimit',
      response: {
        rateLimit: {
          limit: 100,
          remaining: 50,
          reset: 123456,
          percentUsed: 50,
        },
      },
    },
  ];

  validResponses.forEach(({ name, response }) => {
    describe(`and response is ${name}`, () => {
      it('should return true', () => {
        expect(hasRateLimitInfo(response)).toBe(true);
      });
    });
  });

  const invalidInputs = [
    {
      name: 'object without rateLimit',
      value: { id: 'test-id', message: 'success' },
    },
    { name: 'null', value: null },
    { name: 'undefined', value: undefined },
    { name: 'string', value: 'response' },
    { name: 'number', value: 123 },
    {
      name: 'object with rateLimit as string',
      value: { rateLimit: 'invalid' },
    },
    { name: 'object with rateLimit as null', value: { rateLimit: null } },
    { name: 'object with rateLimit as number', value: { rateLimit: 100 } },
    { name: 'empty object', value: {} },
  ];

  invalidInputs.forEach(({ name, value }) => {
    describe(`and response is ${name}`, () => {
      it('should return false', () => {
        expect(hasRateLimitInfo(value)).toBe(false);
      });
    });
  });
});
