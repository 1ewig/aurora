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
  if (err instanceof Error && err.name === 'DynamicServerError') {
    throw err;
  }
  if (
    typeof err === 'object' &&
    err !== null &&
    'digest' in err &&
    typeof (err as { digest: unknown }).digest === 'string' &&
    ['DYNAMIC_SERVER_USAGE', 'HANGING_PROMISE_REJECTION', 'NEXT_PRERENDER_INTERRUPTED'].includes(
      (err as { digest: string }).digest
    )
  ) {
    throw err;
  }
}
