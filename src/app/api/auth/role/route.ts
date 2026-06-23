/**
 * Aurora — src/app/api/auth/role/route.ts
 *
 * GET /api/auth/role — returns the user's role and whether they are an admin.
 * Used by the auth store to gate UI elements.
 */

import { auth } from "@/lib/auth";
import { isAdmin } from "@/utils/auth";
import { pool } from "@/utils/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json(
        { isAdmin: false, role: 'user' },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    const userResult = await pool.query(
      `SELECT role FROM better_auth."user" WHERE id = $1`,
      [session.user.id]
    );
    const role = userResult.rows[0]?.role || 'user';

    return NextResponse.json(
      { isAdmin: isAdmin(session.user.email, role), role },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Failed to check user role:", error);
    return NextResponse.json(
      { error: "Failed to resolve role" },
      { status: 500 }
    );
  }
}
