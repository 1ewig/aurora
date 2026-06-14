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
  const betterAuthSessionCookie = request.cookies.get("better-auth.session_token")?.value;
  const isAuthenticated = !!betterAuthSessionCookie;

  if (!isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminPath) {
    if (!isAdmin(request.cookies.get("better-auth.user_email")?.value)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/admin", "/admin/:path*"],
};
