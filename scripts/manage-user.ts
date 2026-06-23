#!/usr/bin/env npx tsx
/**
 * Aurora — scripts/manage-user.ts
 *
 * Interactive CLI to manage database users — create, update roles, or delete users.
 *
 * Usage:
 *   npx tsx scripts/manage-user.ts
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

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function handleCreateUser(client: Client) {
  const email = await askQuestion('Email (required): ');
  if (!email) {
    console.error('Error: Email is required');
    return;
  }
  if (!isValidEmail(email)) {
    console.error('Error: Invalid email format');
    return;
  }

  const defaultName = email.split('@')[0];
  const nameInput = await askQuestion(`Name (optional, defaults to "${defaultName}"): `);
  const name = nameInput || defaultName;

  const password = await askQuestion('Password (required, min 8 characters): ');
  if (!password || password.length < 8) {
    console.error('Error: Password must be at least 8 characters long');
    return;
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
    return;
  }

  // Duplicate Check
  const existing = await client.query(
    'SELECT id FROM better_auth."user" WHERE email = $1',
    [email]
  );
  if (existing.rows.length > 0) {
    console.error(`Error: User with email "${email}" already exists.`);
    return;
  }

  console.log('Hashing password...');
  const hashedPassword = await hashPassword(password);

  console.log('Creating database records...');
  await client.query('BEGIN');
  try {
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
    throw e;
  }
}

async function handleModifyRole(client: Client) {
  const email = await askQuestion('Email of the user to modify: ');
  if (!email) {
    console.error('Error: email is required');
    return;
  }

  // Look up user
  const userResult = await client.query(
    'SELECT id, name, email, role FROM better_auth."user" WHERE email = $1',
    [email]
  );

  if (userResult.rows.length === 0) {
    console.error(`Error: no user found with email "${email}"`);
    return;
  }

  const user = userResult.rows[0];
  console.log(`\nName:  ${user.name}`);
  console.log(`Email: ${user.email}`);
  console.log(`Role:  ${user.role}\n`);

  // Show role options
  console.log('Select new role:');
  for (let i = 0; i < VALID_ROLES.length; i++) {
    const indicator = VALID_ROLES[i] === user.role ? ' (current)' : '';
    console.log(`  ${i}) ${VALID_ROLES[i]}${indicator}`);
  }

  const roleInput = await askQuestion('\nEnter number (0-2): ');
  const roleIndex = parseInt(roleInput, 10);
  if (isNaN(roleIndex) || roleIndex < 0 || roleIndex >= VALID_ROLES.length) {
    console.error(`Error: invalid selection "${roleInput}".`);
    return;
  }

  const newRole = VALID_ROLES[roleIndex];
  if (newRole === user.role) {
    console.log('Selected role is already assigned to this user. No changes made.');
    return;
  }

  const confirm = await askQuestion(`Change role of "${user.email}" from "${user.role}" to "${newRole}"? (y/N): `);
  if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
    console.log('Cancelled.');
    return;
  }

  console.log('Updating user role...');
  const result = await client.query(
    'UPDATE better_auth."user" SET role = $1, "updatedAt" = NOW() WHERE id = $2',
    [newRole, user.id]
  );

  if (result.rowCount && result.rowCount > 0) {
    console.log(`Success: Role successfully updated to "${newRole}".`);
  } else {
    console.error('Error: failed to update user role.');
  }
}

async function handleDeleteUser(client: Client) {
  const email = await askQuestion('Email of the user to delete: ');
  if (!email) {
    console.error('Error: email is required');
    return;
  }

  // Look up user
  const userResult = await client.query(
    'SELECT id, name, email, role FROM better_auth."user" WHERE email = $1',
    [email]
  );

  if (userResult.rows.length === 0) {
    console.error(`Error: no user found with email "${email}"`);
    return;
  }

  const user = userResult.rows[0];
  console.log(`\nName:  ${user.name}`);
  console.log(`Email: ${user.email}`);
  console.log(`Role:  ${user.role}\n`);

  const confirm = await askQuestion(`Are you sure you want to permanently DELETE "${user.email}"? (y/N): `);
  if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
    console.log('Cancelled.');
    return;
  }

  console.log('Deleting database records...');
  await client.query('BEGIN');
  try {
    // Delete account records
    await client.query('DELETE FROM better_auth.account WHERE "userId" = $1', [user.id]);
    // Delete sessions records
    await client.query('DELETE FROM better_auth.session WHERE "userId" = $1', [user.id]);
    // Delete user record
    await client.query('DELETE FROM better_auth."user" WHERE id = $1', [user.id]);

    await client.query('COMMIT');
    console.log(`\nSuccess: User "${user.email}" and all associated sessions/accounts permanently deleted.`);
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    throw e;
  }
}

async function main() {
  const client = new Client({ connectionString: DATABASE_URL });

  try {
    await client.connect();

    console.log('Aurora User Administration Tool');
    console.log('==============================');
    console.log('Select action:');
    console.log('  0) Create new user');
    console.log('  1) Modify user role');
    console.log('  2) Delete user');

    const actionInput = await askQuestion('\nEnter number (0-2): ');
    const actionIndex = parseInt(actionInput, 10);

    if (actionIndex === 0) {
      await handleCreateUser(client);
    } else if (actionIndex === 1) {
      await handleModifyRole(client);
    } else if (actionIndex === 2) {
      await handleDeleteUser(client);
    } else {
      console.error(`Error: invalid action selection "${actionInput}".`);
    }
  } catch (e) {
    console.error('Error during execution:', e instanceof Error ? e.message : e);
  } finally {
    await client.end().catch(() => {});
  }
}

main();
