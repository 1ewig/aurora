/**
 * Aurora — src/utils/db.ts
 *
 * PostgreSQL connection pool shared across API routes and server code.
 * Configures SSL conditionally and uses a short idle timeout for build compatibility.
 */

import { Pool, type PoolClient } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("Warning: DATABASE_URL environment variable is missing.");
}

export const pool = new Pool({
  connectionString,
  ssl: (connectionString?.includes('sslmode=require') || connectionString?.includes('sslmode=verify-full'))
    ? { rejectUnauthorized: false } 
    : undefined,
  idleTimeoutMillis: 1000, // Close idle connections after 1 second to allow Next.js build process to exit
});

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
