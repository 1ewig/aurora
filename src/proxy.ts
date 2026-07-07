/**
 * Aurora — src/middleware.ts
 *
 * Next.js middleware for route protection.
 * - Redirects unauthenticated users to /login
 * - Redirects non-admin users away from /admin routes
 * - Uses Better Auth session cookie for auth checks
 */

import { NextResponse, type NextRequest } from "next/server";

interface SessionResponse {
  user: { id: string; email: string; role?: string } | null;
}

const protectedPaths = ["/profile", "/admin"];

function isProtectedPath(pathname: string): boolean {
  return protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );
}

function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const baseUrl = process.env.BETTER_AUTH_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`;
  const sessionRes = await fetch(`${baseUrl}/api/auth/get-session`, {
    headers: { cookie: request.headers.get('cookie') || '' },
  });
  const session: SessionResponse | null = sessionRes.ok ? await sessionRes.json() : null;

  if (!session?.user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminPath(pathname) && session.user.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/admin", "/admin/:path*"],
};
