/**
 * Aurora — src/utils/errors.ts
 *
 * Shared error-handling utilities for route handlers and server functions.
 */

/**
 * Re-throws errors that Next.js uses internally for prerendering/static-generation
 * bail-out signalling. This allows pre-rendered routes to correctly fall back to
 * dynamic rendering without being caught and logged as application errors.
 */
export function rethrowIfDynamicServerError(err: unknown): void {
  if (
    err instanceof Error &&
    (err.message.includes('prerendering') ||
      err.name === 'DynamicServerError' ||
      err.message.includes('DynamicServerError') ||
      err.message.includes('dynamic-server'))
  ) {
    throw err;
  }
  if (
    err &&
    typeof err === 'object' &&
    'digest' in err &&
    typeof (err as { digest: unknown }).digest === 'string' &&
    ['DYNAMIC_SERVER_USAGE', 'HANGING_PROMISE_REJECTION'].includes((err as { digest: string }).digest)
  ) {
    throw err;
  }
}
