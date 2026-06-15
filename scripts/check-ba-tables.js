const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:454201376c783709e954b9395916246d@4eu5wk8i.us-east.database.insforge.app:5432/insforge?sslmode=verify-full';
const pool = new Pool({ connectionString: DATABASE_URL });

async function run() {
  try {
    const tables = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'better_auth'"
    );
    console.log('Tables:', JSON.stringify(tables.rows));

    const columns = await pool.query(
      "SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema = 'better_auth' ORDER BY table_name, ordinal_position"
    );
    console.log('Columns:', JSON.stringify(columns.rows, null, 2));
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await pool.end();
  }
}
run();
