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

function getCleanConnectionString(url?: string): string | undefined {
  if (!url) return undefined;
  // Normalize sslmode parameter to prevent pg-connection-string libpq deprecation warnings
  return url.replace(/sslmode=(require|prefer|verify-ca)/gi, 'sslmode=verify-full');
}

function getSslConfig() {
  if (!connectionString) return undefined;

  if (process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== undefined) {
    return { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === 'true' };
  }

  const lower = connectionString.toLowerCase();
  if (lower.includes('sslmode=verify-full') || lower.includes('sslmode=verify-ca')) {
    return { rejectUnauthorized: true };
  }

  if (lower.includes('sslmode=require') || lower.includes('sslmode=no-verify') || lower.includes('sslmode=')) {
    return { rejectUnauthorized: false };
  }

  return undefined;
}

/*
 * SSL config: respects verify-full / verify-ca with strict certificate checks
 * while supporting cloud-hosted Postgres requiring unverified SSL mode.
 */
export const pool = new Pool({
  connectionString: getCleanConnectionString(connectionString),
  ssl: getSslConfig(),
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
