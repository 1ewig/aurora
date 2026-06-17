/**
 * Aurora — src/middleware.ts
 *
 * Next.js middleware for route protection.
 * - Redirects unauthenticated users to /login
 * - Blocks non-admin users from /admin routes
 * - Uses Better Auth session cookie for auth checks
 */

import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/utils/auth";

const protectedPaths = ["/profile", "/admin"];

function isProtectedPath(pathname: string): boolean {
  return protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");

  const baseUrl = process.env.BETTER_AUTH_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`;
  const sessionRes = await fetch(`${baseUrl}/api/auth/get-session`, {
    headers: { cookie: request.headers.get('cookie') || '' },
  });
  const session = sessionRes.ok ? await sessionRes.json() : null;
  const isAuthenticated = !!session?.user;

  if (!isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminPath && !isAdmin(session?.user?.email)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/admin", "/admin/:path*"],
};
