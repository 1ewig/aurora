/**
 * Aurora — src/app/api/auth/[...all]/route.ts
 *
 * Catch-all Better Auth handler — delegates all auth API calls
 * (login, register, verify, reset, session) to the Better Auth server.
 */

import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

export const { POST, GET } = toNextJsHandler(auth);
