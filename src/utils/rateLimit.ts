/**
 * Aurora — src/utils/rateLimit.ts
 *
 * Database-backed IP rate limiter using a minute-granularity sliding window.
 * Returns false when the caller exceeds the configured max requests per minute.
 */

import { type NextRequest } from 'next/server';
import { pool } from '@/utils/db';

/**
 * Extracts the real client IP address from request headers safely.
 * Prefers trusted single-source edge headers (x-real-ip, cf-connecting-ip,
 * x-vercel-forwarded-for) before falling back to x-forwarded-for or req.ip.
 */
export function getClientIp(req: NextRequest): string {
  // 1. Direct reverse-proxy headers (cannot be prepended by client spoofing)
  const realIp =
    req.headers.get('x-real-ip') ||
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-vercel-forwarded-for');

  if (realIp && realIp.trim()) {
    return realIp.trim();
  }

  // 2. Next.js server / edge request IP if present
  const nextIp = (req as any).ip;
  if (nextIp && typeof nextIp === 'string' && nextIp.trim()) {
    return nextIp.trim();
  }

  // 3. Forwarded header fallback
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const parts = forwardedFor
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length > 0) {
      return parts[0];
    }
  }

  return '127.0.0.1';
}

export async function rateLimit(ip: string, route: string, maxRequests: number): Promise<boolean> {
  const result = await pool.query(
    `INSERT INTO rate_limits (ip, route, window_start, request_count)
     VALUES ($1, $2, date_trunc('minute', now()), 1)
     ON CONFLICT (ip, route, window_start)
     DO UPDATE SET request_count = rate_limits.request_count + 1
     RETURNING request_count`,
    [ip, route]
  );
  return result.rows[0].request_count <= maxRequests;
}
