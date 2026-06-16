/**
 * Aurora — src/utils/insforge/client.ts
 *
 * Browser-side InsForge SDK client for storage uploads and realtime subscriptions.
 */

import { createBrowserClient } from '@insforge/sdk/ssr'

/** Pre-configured InsForge browser client instance. */
export const insforge = createBrowserClient()
