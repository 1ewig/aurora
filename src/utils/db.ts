/**
 * Aurora — src/utils/db.ts
 *
 * PostgreSQL connection pool (pg.Pool) shared across all API routes
 * and server-side code. Configures SSL conditionally based on the
 * connection string and uses a short idle timeout (1s) so the build
 * process can exit cleanly without hanging on open connections.
 *
 * Exports a withTransaction() helper that wraps BEGIN/COMMIT/ROLLBACK
 * and handles client release in the finally block.
 */

import { Pool, type PoolClient } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("Warning: DATABASE_URL environment variable is missing.");
}

/*
 * SSL config: only set rejectUnauthorized: false when the connection
 * string includes sslmode=require or sslmode=verify-full (common for
 * cloud-hosted Postgres like Neon, Supabase, etc.). Local dev without
 * SSL leaves the option undefined.
 */
export const pool = new Pool({
  connectionString,
  ssl: (connectionString?.includes('sslmode=require') || connectionString?.includes('sslmode=verify-full'))
    ? { rejectUnauthorized: false } 
    : undefined,
  // 1s idle timeout prevents build from hanging on open connections
  idleTimeoutMillis: 1000,
});

/**
 * Wraps a function in a database transaction.
 * Automatically calls BEGIN before the function, COMMIT on success,
 * ROLLBACK on error, and always releases the client in the finally block.
 */
export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
