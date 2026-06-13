import { NextResponse } from 'next/server';
import { pool } from '@/utils/db';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const result = await pool.query(
      `SELECT 
        EXISTS(SELECT 1 FROM auth.users WHERE LOWER(email) = LOWER($1)) AS exists,
        COALESCE((SELECT email_verified FROM auth.users WHERE LOWER(email) = LOWER($1) LIMIT 1), false) AS verified`,
      [email.toLowerCase().trim()]
    );

    const exists = result.rows[0]?.exists || false;
    const verified = result.rows[0]?.verified || false;
    
    return NextResponse.json({ exists, verified });
  } catch (error) {
    console.error('Check user existence failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
