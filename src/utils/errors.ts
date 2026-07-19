/**
 * Aurora — src/utils/errors.ts
 *
 * Shared error-handling utilities for route handlers and server functions.
 * Designed to work with Next.js internal error signalling for prerendering.
 */

/**
 * Re-throws errors that Next.js uses internally for prerendering/static-generation
 * bail-out signalling. These errors (DynamicServerError, or errors with specific
 * digest strings) must not be caught by application try/catch blocks — they need
 * to propagate up to Next.js so it can fall back to dynamic rendering.
 *
 * If you see "Error: Route X needs to be dynamic but it's statically cached"
 * at build time, this function being called in the wrong place is a likely cause.
 */
export function rethrowIfDynamicServerError(err: unknown): void {
  // Standard DynamicServerError from Next.js
  if (err instanceof Error && err.name === 'DynamicServerError') {
    throw err;
  }
  // Errors with specific digest codes that Next.js uses internally
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
