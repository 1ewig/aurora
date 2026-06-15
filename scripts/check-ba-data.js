const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:454201376c783709e954b9395916246d@4eu5wk8i.us-east.database.insforge.app:5432/insforge?sslmode=verify-full';
const pool = new Pool({ connectionString: DATABASE_URL });

async function run() {
  try {
    console.log('=== Users ===');
    const users = await pool.query('SELECT id, email, "emailVerified", name, image, "createdAt" FROM better_auth.user');
    console.log(JSON.stringify(users.rows, null, 2));

    console.log('\n=== Sessions ===');
    const sessions = await pool.query('SELECT id, token, "userId", "expiresAt", "createdAt" FROM better_auth.session');
    console.log(JSON.stringify(sessions.rows, null, 2));

    console.log('\n=== Accounts ===');
    const accounts = await pool.query('SELECT id, "providerId", "accountId", "userId" FROM better_auth.account');
    console.log(JSON.stringify(accounts.rows, null, 2));
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await pool.end();
  }
}
run();
