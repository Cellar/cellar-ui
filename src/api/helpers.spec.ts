import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  parseRateLimitHeaders,
  parseRetryAfter,
  calculateRetryDelay,
} from './helpers';

describe('when parseRateLimitHeaders is called', () => {
  describe('and all headers are present', () => {
    const testCases = [
      {
        name: 'typical rate limit values',
        headers: { limit: '300', remaining: '250', reset: '1736705220' },
        expected: {
          limit: 300,
          remaining: 250,
          reset: 1736705220,
          percentUsed: 16.666666666666664,
        },
      },
      {
        name: 'zero remaining',
        headers: { limit: '300', remaining: '0', reset: '1736705220' },
        expected: {
          limit: 300,
          remaining: 0,
          reset: 1736705220,
          percentUsed: 100,
        },
      },
      {
        name: 'full remaining',
        headers: { limit: '100', remaining: '100', reset: '1736705220' },
        expected: {
          limit: 100,
          remaining: 100,
          reset: 1736705220,
          percentUsed: 0,
        },
      },
    ];

    testCases.forEach(({ name, headers, expected }) => {
      describe(`and headers contain ${name}`, () => {
        let response: Response;

        beforeEach(() => {
          response = new Response(null, {
            headers: {
              'X-RateLimit-Limit': headers.limit,
              'X-RateLimit-Remaining': headers.remaining,
              'X-RateLimit-Reset': headers.reset,
            },
          });
        });

        it('should return IRateLimitInfo', () => {
          expect(parseRateLimitHeaders(response)).toEqual(expected);
        });
      });
    });
  });

  describe('and headers are missing', () => {
    const missingHeaderCases = [
      { name: 'all headers', headers: {} },
      {
        name: 'limit header',
        headers: { remaining: '250', reset: '1736705220' },
      },
      {
        name: 'remaining header',
        headers: { limit: '300', reset: '1736705220' },
      },
      { name: 'reset header', headers: { limit: '300', remaining: '250' } },
    ];

    missingHeaderCases.forEach(({ name, headers }) => {
      describe(`and ${name} missing`, () => {
        let response: Response;

        beforeEach(() => {
          response = new Response(null, { headers });
        });

        it('should return undefined', () => {
          expect(parseRateLimitHeaders(response)).toBeUndefined();
        });
      });
    });
  });
});

describe('when parseRetryAfter is called', () => {
  describe('and header is seconds format', () => {
    const secondsCases = [
      { name: 'small value', header: '5', expected: 5 },
      { name: 'medium value', header: '60', expected: 60 },
      { name: 'large value', header: '300', expected: 300 },
      { name: 'zero', header: '0', expected: 0 },
    ];

    secondsCases.forEach(({ name, header, expected }) => {
      describe(`and header is ${name}`, () => {
        it('should return seconds as number', () => {
          expect(parseRetryAfter(header)).toBe(expected);
        });
      });
    });
  });

  describe('and header is HTTP date format', () => {
    it('should return seconds until date', () => {
      const futureDate = new Date(Date.now() + 60000);
      const result = parseRetryAfter(futureDate.toUTCString());
      expect(result).toBeGreaterThanOrEqual(59);
      expect(result).toBeLessThanOrEqual(61);
    });
  });

  describe('and header is invalid', () => {
    const invalidCases = [
      { name: 'null', header: null },
      { name: 'empty string', header: '' },
      { name: 'invalid string', header: 'invalid' },
      { name: 'negative number', header: '-10' },
    ];

    invalidCases.forEach(({ name, header }) => {
      describe(`and header is ${name}`, () => {
        it('should return undefined', () => {
          const result = parseRetryAfter(header);
          expect(result).toBeUndefined();
        });
      });
    });
  });
});

describe('when calculateRetryDelay is called', () => {
  describe('and retryAfter is provided', () => {
    const retryAfterCases = [
      { retryAfter: 5, expected: 5000 },
      { retryAfter: 60, expected: 60000 },
      { retryAfter: 120, expected: 120000 },
    ];

    retryAfterCases.forEach(({ retryAfter, expected }) => {
      describe(`and retryAfter is ${retryAfter} seconds`, () => {
        it(`should return ${expected}ms`, () => {
          expect(calculateRetryDelay(0, retryAfter)).toBe(expected);
        });
      });
    });
  });

  describe('and retryAfter is not provided', () => {
    const attemptCases = [
      { attempt: 0, baseDelay: 1000 },
      { attempt: 1, baseDelay: 2000 },
      { attempt: 2, baseDelay: 4000 },
      { attempt: 3, baseDelay: 8000 },
      { attempt: 4, baseDelay: 10000 },
      { attempt: 10, baseDelay: 10000 },
    ];

    attemptCases.forEach(({ attempt, baseDelay }) => {
      describe(`and attempt is ${attempt}`, () => {
        it('should return exponential backoff with jitter', () => {
          const result = calculateRetryDelay(attempt);
          const minDelay = baseDelay * 0.75;
          const maxDelay = baseDelay * 1.25;
          expect(result).toBeGreaterThanOrEqual(minDelay);
          expect(result).toBeLessThanOrEqual(maxDelay);
        });
      });
    });
  });

  describe('and testing jitter randomness', () => {
    it('should produce varying delays for same attempt', () => {
      const delays = Array.from({ length: 100 }, () => calculateRetryDelay(1));
      const uniqueDelays = new Set(delays);
      expect(uniqueDelays.size).toBeGreaterThan(1);
    });
  });
});
