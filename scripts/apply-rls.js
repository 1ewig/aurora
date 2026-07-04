// scripts/apply-rls.js
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

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
  console.error("Error: DATABASE_URL not found in environment or .env.local");
  process.exit(1);
}

console.log("Connecting to database to apply Row Level Security...");
const pool = new Pool({ connectionString: DATABASE_URL });

async function main() {
  try {
    const sqlPath = path.resolve(process.cwd(), 'scripts', 'enable-rls.sql');
    const rlsSql = fs.readFileSync(sqlPath, 'utf-8');

    console.log("Applying SQL RLS statements...");
    await pool.query(rlsSql);
    console.log("Row Level Security enabled and policies applied successfully!");
  } catch (err) {
    console.error("Failed to apply RLS migrations:", err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
