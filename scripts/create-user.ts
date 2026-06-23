#!/usr/bin/env npx tsx
/**
 * Aurora — scripts/create-user.ts
 *
 * CLI to create a verified user in the database with a specified role and password.
 *
 * Usage:
 *   npx tsx scripts/create-user.ts
 */

import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { hashPassword } from 'better-auth/crypto';
import * as crypto from 'crypto';

const VALID_ROLES = ['user', 'explorer', 'admin'] as const;
type Role = (typeof VALID_ROLES)[number];

// ── Credential loading (mirrors set-role.ts) ──

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

// Simple email regex validation
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function main() {
  const client = new Client({ connectionString: DATABASE_URL });

  try {
    // 1. Inputs
    const email = await askQuestion('Email (required): ');
    if (!email) {
      console.error('Error: Email is required');
      process.exit(1);
    }
    if (!isValidEmail(email)) {
      console.error('Error: Invalid email format');
      process.exit(1);
    }

    const defaultName = email.split('@')[0];
    const nameInput = await askQuestion(`Name (optional, defaults to "${defaultName}"): `);
    const name = nameInput || defaultName;

    const password = await askQuestion('Password (required, min 8 characters): ');
    if (!password || password.length < 8) {
      console.error('Error: Password must be at least 8 characters long');
      process.exit(1);
    }

    console.log('\nAvailable Roles:');
    for (let i = 0; i < VALID_ROLES.length; i++) {
      console.log(`  ${i}) ${VALID_ROLES[i]}`);
    }
    const roleInput = await askQuestion('\nSelect role index (0-2, default 0): ');
    let roleIndex = parseInt(roleInput, 10);
    if (isNaN(roleIndex) || roleIndex < 0 || roleIndex >= VALID_ROLES.length) {
      roleIndex = 0;
    }
    const role: Role = VALID_ROLES[roleIndex];

    console.log(`\nEmail:    ${email}`);
    console.log(`Name:     ${name}`);
    console.log(`Role:     ${role}`);
    console.log(`Password: ********\n`);

    const confirm = await askQuestion('Create this user? (y/N): ');
    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
      console.log('Cancelled.');
      process.exit(0);
    }

    await client.connect();

    // 2. Duplicate Check
    const existing = await client.query(
      'SELECT id FROM better_auth."user" WHERE email = $1',
      [email]
    );
    if (existing.rows.length > 0) {
      console.error(`Error: User with email "${email}" already exists.`);
      await client.end();
      process.exit(1);
    }

    console.log('Hashing password...');
    const hashedPassword = await hashPassword(password);

    console.log('Creating database records...');
    await client.query('BEGIN');

    const userId = crypto.randomUUID();
    const accountId = crypto.randomUUID();

    // Insert user row
    await client.query(
      `INSERT INTO better_auth."user" (id, name, email, "emailVerified", role, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, true, $4, NOW(), NOW())`,
      [userId, name, email, role]
    );

    // Insert account row
    await client.query(
      `INSERT INTO better_auth.account (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
       VALUES ($1, $2, 'credential', $3, $4, NOW(), NOW())`,
      [accountId, userId, userId, hashedPassword]
    );

    await client.query('COMMIT');
    console.log(`\nSuccess: User "${email}" successfully created and verified (ID: ${userId}).`);
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Error during execution:', e instanceof Error ? e.message : e);
    process.exit(1);
  } finally {
    await client.end().catch(() => {});
  }
}

main();
