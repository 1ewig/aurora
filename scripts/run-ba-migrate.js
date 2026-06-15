const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:454201376c783709e954b9395916246d@4eu5wk8i.us-east.database.insforge.app:5432/insforge?sslmode=verify-full';
const pool = new Pool({ connectionString: DATABASE_URL });

async function run() {
  try {
    // Drop old tables
    await pool.query('DROP TABLE IF EXISTS better_auth.verification CASCADE');
    await pool.query('DROP TABLE IF EXISTS better_auth.account CASCADE');
    await pool.query('DROP TABLE IF EXISTS better_auth.session CASCADE');
    await pool.query('DROP TABLE IF EXISTS better_auth.user CASCADE');
    console.log('Dropped old snake_case tables');

    // Recreate with camelCase columns (BA expects these)
    await pool.query(`CREATE TABLE better_auth.user (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT NOT NULL UNIQUE,
      "emailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
      image TEXT,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);

    await pool.query(`CREATE TABLE better_auth.session (
      id TEXT PRIMARY KEY,
      "expiresAt" TIMESTAMPTZ NOT NULL,
      token TEXT NOT NULL UNIQUE,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "ipAddress" TEXT,
      "userAgent" TEXT,
      "userId" TEXT NOT NULL REFERENCES better_auth.user(id) ON DELETE CASCADE
    )`);

    await pool.query(`CREATE TABLE better_auth.account (
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

    await pool.query(`CREATE TABLE better_auth.verification (
      id TEXT PRIMARY KEY,
      identifier TEXT NOT NULL,
      value TEXT NOT NULL,
      "expiresAt" TIMESTAMPTZ NOT NULL,
      "createdAt" TIMESTAMPTZ,
      "updatedAt" TIMESTAMPTZ
    )`);

    console.log('Created BA tables with camelCase columns');
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await pool.end();
  }
}
run();
