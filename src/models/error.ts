export interface IApiError {
  code: number;
  message: string;
  retryAfter?: number;
  rateLimit?: IRateLimitInfo;
}

export interface IRateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  percentUsed: number;
}

export function isRateLimitError(error: unknown): error is IApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as IApiError).code === 429
  );
}

export function hasRateLimitInfo(
  response: unknown,
): response is { rateLimit: IRateLimitInfo } {
  return (
    typeof response === 'object' &&
    response !== null &&
    'rateLimit' in response &&
    typeof (response as { rateLimit: unknown }).rateLimit === 'object' &&
    (response as { rateLimit: unknown }).rateLimit !== null
  );
}
