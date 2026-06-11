/**
 * remove-bio-from-profiles.mts
 * ============================
 *
 * Drops the `bio` column from `public.profiles` and updates trigger
 * functions to match. Requires DATABASE_URL in .env.local (postgres
 * superuser connection).
 *
 * ── Usage ──────────────────────────────────────────
 *
 *   npx tsx scripts/remove-bio-from-profiles.mts
 *
 * ── What it does ───────────────────────────────────
 *
 *   - ALTER TABLE public.profiles DROP COLUMN IF EXISTS bio
 *   - Recreates handle_new_user() without bio reference
 *   - Recreates handle_user_update() without bio reference
 */

import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const envPath = path.resolve(__dirname, '../.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('Missing .env.local — cannot read DATABASE_URL');
    process.exit(1);
  }

  const envRaw = fs.readFileSync(envPath, 'utf-8');
  const match = envRaw.match(/^DATABASE_URL="(.+)"$/m);
  if (!match) {
    console.error('DATABASE_URL not found in .env.local');
    process.exit(1);
  }
  const databaseUrl = match[1];

  const sqlPath = path.resolve(__dirname, 'remove-bio-from-profiles.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  console.log('Connected to database.');

  await client.query(sql);
  console.log('✓ bio column dropped and trigger functions updated.');

  await client.end();
  console.log('Done.');
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
