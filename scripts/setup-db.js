const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Set DATABASE_URL environment variable');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });

async function run() {
  try {
    // 1. Create better_auth schema and BA tables
    console.log('Creating BA schema...');
    await pool.query('CREATE SCHEMA IF NOT EXISTS better_auth');

    console.log('Creating BA tables...');
    await pool.query(`CREATE TABLE IF NOT EXISTS better_auth.user (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT NOT NULL UNIQUE,
      "emailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
      image TEXT,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
    await pool.query(`CREATE TABLE IF NOT EXISTS better_auth.session (
      id TEXT PRIMARY KEY,
      "expiresAt" TIMESTAMPTZ NOT NULL,
      token TEXT NOT NULL UNIQUE,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "ipAddress" TEXT,
      "userAgent" TEXT,
      "userId" TEXT NOT NULL REFERENCES better_auth.user(id) ON DELETE CASCADE
    )`);
    await pool.query(`CREATE TABLE IF NOT EXISTS better_auth.account (
      id TEXT PRIMARY KEY,
      "accountId" TEXT NOT NULL,
      "providerId" TEXT NOT NULL,
      "userId" TEXT NOT NULL REFERENCES better_auth.user(id) ON DELETE CASCADE,
      "accessToken" TEXT,
      "refreshToken" TEXT,
      "idToken" TEXT,
      "accessTokenExpiresAt" TIMESTAMPTZ,
      "refreshTokenExpiresAt" TIMESTAMPTZ,
      scope TEXT,
      password TEXT,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
    await pool.query(`CREATE TABLE IF NOT EXISTS better_auth.verification (
      id TEXT PRIMARY KEY,
      identifier TEXT NOT NULL,
      value TEXT NOT NULL,
      "expiresAt" TIMESTAMPTZ NOT NULL,
      "createdAt" TIMESTAMPTZ,
      "updatedAt" TIMESTAMPTZ
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS better_auth."rateLimit" (
      id TEXT PRIMARY KEY,
      key TEXT NOT NULL,
      count INTEGER NOT NULL,
      "lastRequest" BIGINT NOT NULL
    )`);

    // 2. Run app schema migration (products, profiles, orders, RLS, etc.)
    const migrationPath = path.join(__dirname, '..', 'migrations', '20260614145429_better-auth-setup.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    await pool.query(migrationSql);
    console.log('App schema migration applied');

    console.log('Database setup complete.');
  } catch (e) {
    console.error('Setup failed:', e.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
