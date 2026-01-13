import { IRateLimitInfo } from '@/models/error';

export function parseRateLimitHeaders(
  response: Response,
): IRateLimitInfo | undefined {
  const limit = response.headers.get('X-RateLimit-Limit');
  const remaining = response.headers.get('X-RateLimit-Remaining');
  const reset = response.headers.get('X-RateLimit-Reset');

  if (!limit || !remaining || !reset) return undefined;

  const limitNum = parseInt(limit, 10);
  const remainingNum = parseInt(remaining, 10);
  const resetNum = parseInt(reset, 10);

  return {
    limit: limitNum,
    remaining: remainingNum,
    reset: resetNum,
    percentUsed: ((limitNum - remainingNum) / limitNum) * 100,
  };
}

export function parseRetryAfter(header: string | null): number | undefined {
  if (!header) return undefined;

  const seconds = parseInt(header, 10);
  if (!isNaN(seconds) && seconds >= 0) return seconds;

  const date = new Date(header);
  if (!isNaN(date.getTime())) {
    const secondsUntil = Math.ceil((date.getTime() - Date.now()) / 1000);
    if (secondsUntil >= 0) return secondsUntil;
  }

  return undefined;
}

export function calculateRetryDelay(
  attempt: number,
  retryAfter?: number,
): number {
  if (retryAfter) return retryAfter * 1000;

  const baseDelay = Math.min(1000 * Math.pow(2, attempt), 10000);
  const jitter = baseDelay * 0.25 * (Math.random() * 2 - 1);
  return baseDelay + jitter;
}
