/**
 * create-materials-table.mts
 * ===========================
 *
 * One-off script to create the materials table and RLS policies.
 * Run once after deploy or on a fresh database:
 *   npx tsx scripts/create-materials-table.mts
 */

import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const dotenvPath = path.resolve(process.cwd(), '.env.local');
if (!fs.existsSync(dotenvPath)) {
  console.error("Error: .env.local not found.");
  process.exit(1);
}

const env = fs.readFileSync(dotenvPath, 'utf-8');
const match = env.match(/^DATABASE_URL=(.+)$/m);
if (!match) {
  console.error("Error: DATABASE_URL not found in .env.local");
  process.exit(1);
}
const DATABASE_URL = match[1].replace(/^"(.*)"$/, '$1');

const sql = `
CREATE TABLE IF NOT EXISTS public.materials (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  source VARCHAR(255) NOT NULL,
  original_image TEXT NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT NOT NULL,
  properties TEXT[] DEFAULT '{}'
);

ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON public.materials;
CREATE POLICY "Allow public read access" ON public.materials FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin write access" ON public.materials;
CREATE POLICY "Allow admin write access" ON public.materials FOR ALL TO authenticated USING (
  public.requesting_user_id() IN (
    SELECT id FROM better_auth."user" WHERE role = 'admin'
  )
);
`;

async function main() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  console.log("Creating materials table...");
  await client.query(sql);
  console.log("materials table created with RLS policies.");
  await client.end();
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
