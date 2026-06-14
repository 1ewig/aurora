import { betterAuth } from 'better-auth';
import { Pool } from 'pg';

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

const pool = new Pool({ connectionString: requireEnv('DATABASE_URL') });
pool.on('connect', (client) => {
  client.query('SET search_path TO better_auth, public').catch(() => {});
});

export const auth = betterAuth({
  database: pool,
  emailAndPassword: { enabled: true },
  secret: requireEnv('BETTER_AUTH_SECRET'),
  baseURL: requireEnv('BETTER_AUTH_URL'),
});
