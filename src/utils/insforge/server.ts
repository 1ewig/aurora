/**
 * Aurora — src/utils/insforge/server.ts
 *
 * Server-side InsForge SDK factory for API routes and server components.
 * Reads cookies for auth context automatically.
 */

import { cookies } from 'next/headers'
import { createServerClient } from '@insforge/sdk/ssr'

/** Creates an InsForge server client with the current request's cookie context. */
export async function createServerInsforge() {
  return createServerClient({ cookies: await cookies() })
}
