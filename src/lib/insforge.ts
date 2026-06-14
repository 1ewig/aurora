'use client';

import { createClient, type InsForgeClient } from '@insforge/sdk';
import { authClient } from './auth-client';
import { useEffect, useMemo, useState } from 'react';

const REFRESH_INTERVAL_MS = 50 * 60 * 1000;

function setBridgeToken(client: InsForgeClient, token: string | null) {
  if (typeof (client as unknown as { setAccessToken?: unknown }).setAccessToken === 'function') {
    (client as unknown as { setAccessToken: (t: string | null) => void }).setAccessToken(token);
    return;
  }
  client.getHttpClient().setAuthToken(token);
  (client.realtime as unknown as { tokenManager: { setAccessToken: (t: string | null) => void } })
    .tokenManager.setAccessToken(token);
}

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
