import { NextResponse } from 'next/server';
import { pool } from '@/utils/db';

const rateLimit = new Map<string, { count: number; timestamp: number }>();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 10;

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return '127.0.0.1';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);

  if (!entry || now - entry.timestamp > WINDOW_MS) {
    rateLimit.set(ip, { count: 1, timestamp: now });
    return false;
  }

  if (entry.count >= MAX_REQUESTS) {
    return true;
  }

  entry.count++;
  return false;
}

function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [ip, entry] of rateLimit.entries()) {
    if (now - entry.timestamp > WINDOW_MS) {
      rateLimit.delete(ip);
    }
  }
}

cleanupExpiredEntries();

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const result = await pool.query(
      `SELECT
        EXISTS(SELECT 1 FROM better_auth.user WHERE LOWER(email) = LOWER($1)) AS exists,
        COALESCE((SELECT email_verified FROM better_auth.user WHERE LOWER(email) = LOWER($1) LIMIT 1), false) AS verified`,
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
