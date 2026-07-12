import { pool } from '@/utils/db';

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
