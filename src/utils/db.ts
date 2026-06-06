import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("Warning: DATABASE_URL environment variable is missing.");
}

export const pool = new Pool({
  connectionString,
  ssl: connectionString?.includes('sslmode=require') 
    ? { rejectUnauthorized: false } 
    : undefined,
});
