/**
 * Aurora — src/utils/rateLimit.ts
 *
 * Database-backed IP rate limiter using a minute-granularity sliding window.
 * Returns false when the caller exceeds the configured max requests per minute.
 */

import { type NextRequest } from 'next/server';
import { pool } from '@/utils/db';

/**
 * Extracts the real client IP address from request headers.
 * Prefers x-forwarded-for (first entry), falling back to x-real-ip or req.ip.
 */
export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const clientIp = forwardedFor.split(',')[0].trim();
    if (clientIp) return clientIp;
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp && realIp.trim()) {
    return realIp.trim();
  }

  return (req as any).ip || '127.0.0.1';
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
