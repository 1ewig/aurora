/**
 * Aurora — src/lib/insforge.ts
 *
 * React hook that provides an authenticated InsForge browser client.
 * Automatically fetches and refreshes a JWT bridge token on auth state changes.
 */

'use client';

import { createClient, type InsForgeClient } from '@insforge/sdk';
import { authClient } from './auth-client';
import { useEffect, useMemo, useState } from 'react';

const REFRESH_INTERVAL_MS = 50 * 60 * 1000;

/** Sets the auth token on the InsForge client (handles SDK API variance). */
function setBridgeToken(client: InsForgeClient, token: string | null) {
  if (typeof (client as unknown as { setAccessToken?: unknown }).setAccessToken === 'function') {
    (client as unknown as { setAccessToken: (t: string | null) => void }).setAccessToken(token);
    return;
  }
  client.getHttpClient().setAuthToken(token);
  (client.realtime as unknown as { tokenManager: { setAccessToken: (t: string | null) => void } })
    .tokenManager.setAccessToken(token);
}

/** Provides an InsForge client with automatic JWT bridging for the current user session. */
export function useInsforgeClient(): { client: InsForgeClient; isReady: boolean } {
  const session = authClient.useSession();
  const [isReady, setIsReady] = useState(false);

  const client = useMemo(
    () =>
      createClient({
        baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
        anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
      }),
    [],
  );

  useEffect(() => {
    if (!session.data?.user) {
      setBridgeToken(client, null);
      setIsReady(false);
      return;
    }

    let cancelled = false;
    const refresh = async () => {
      try {
        const res = await fetch('/api/insforge-token', { credentials: 'same-origin' });
        if (!res.ok) throw new Error(`bridge ${res.status}`);
        const { token } = await res.json();
        if (cancelled) return;
        if (typeof token !== 'string' || !token) throw new Error('bridge: no token in response');
        setBridgeToken(client, token);
        setIsReady(true);
      } catch {
        if (cancelled) return;
        setBridgeToken(client, null);
        setIsReady(false);
      }
    };

    void refresh();
    const id = setInterval(() => void refresh(), REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [client, session.data?.user?.id]);

  return { client, isReady };
}
