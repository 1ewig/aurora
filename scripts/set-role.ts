#!/usr/bin/env npx tsx
/**
 * Aurora — scripts/set-role.ts
 *
 * Interactive CLI to set a user's role in the database.
 *
 * Usage:
 *   npx tsx scripts/set-role.ts
 */

import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const VALID_ROLES = ['user', 'explorer', 'admin'] as const;
type Role = (typeof VALID_ROLES)[number];

// ── Credential loading (mirrors upload-and-seed.mts pattern) ──

const dotenvPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(dotenvPath)) {
  const envConfig = fs.readFileSync(dotenvPath, 'utf-8');
  for (const line of envConfig.split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      value = value.trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Error: DATABASE_URL not found in .env.local');
  process.exit(1);
}

/** Creates a readline interface and asks a question, returning the trimmed answer. */
function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  const client = new Client({ connectionString: DATABASE_URL });

  try {
    await client.connect();

    // 1. Get email
    const email = await askQuestion('Email: ');
    if (!email) {
      console.error('Error: email is required');
      process.exit(1);
    }

    // 2. Look up user
    const userResult = await client.query(
      'SELECT id, name, email, role FROM better_auth."user" WHERE email = $1',
      [email],
    );

    if (userResult.rows.length === 0) {
      console.error(`Error: no user found with email "${email}"`);
      await client.end();
      process.exit(1);
    }

    const user = userResult.rows[0];
    console.log(`\nName:  ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role:  ${user.role}\n`);

    // 3. Show role options
    console.log('Select new role:');
    for (let i = 0; i < VALID_ROLES.length; i++) {
      const indicator = VALID_ROLES[i] === user.role ? ' (current)' : '';
      console.log(`  ${i}) ${VALID_ROLES[i]}${indicator}`);
    }

    const roleInput = await askQuestion('\nEnter number (0-2): ');
    const roleIndex = parseInt(roleInput, 10);
    if (isNaN(roleIndex) || roleIndex < 0 || roleIndex >= VALID_ROLES.length) {
      console.error(`Error: invalid selection "${roleInput}". Enter 0, 1, or 2.`);
      await client.end();
      process.exit(1);
    }

    const newRole: Role = VALID_ROLES[roleIndex];

    if (newRole === user.role) {
      console.log(`Role is already "${newRole}" — no change needed.`);
      await client.end();
      return;
    }

    // 4. Confirm before applying
    const confirm = await askQuestion(`Set role to "${newRole}" for ${email}? (y/N): `);
    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
      console.log('Cancelled.');
      await client.end();
      return;
    }

    // 5. Apply the update
    const updateResult = await client.query(
      'UPDATE better_auth."user" SET role = $1, "updatedAt" = NOW() WHERE email = $2',
      [newRole, email],
    );

    if (updateResult.rowCount === 0) {
      console.error(`Error: no rows updated — user "${email}" may have been removed.`);
      await client.end();
      process.exit(1);
    }

    console.log(`Role updated to "${newRole}" for ${email}`);
  } catch (e) {
    console.error('Error:', e instanceof Error ? e.message : e);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();