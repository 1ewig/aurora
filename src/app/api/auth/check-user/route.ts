import { NextResponse } from 'next/server';
import { pool } from '@/utils/db';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const result = await pool.query(
      'SELECT EXISTS(SELECT 1 FROM auth.users WHERE LOWER(email) = LOWER($1))',
      [email.toLowerCase().trim()]
    );

    const exists = result.rows[0]?.exists || false;
    return NextResponse.json({ exists });
  } catch (error) {
    console.error('Check user existence failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
