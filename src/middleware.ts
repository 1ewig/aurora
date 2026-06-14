import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@insforge/sdk/ssr";

const protectedPaths = ["/profile", "/checkout"];

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

  const response = NextResponse.next({ request });

  await updateSession({
    requestCookies: request.cookies as any,
    responseCookies: response.cookies as any,
  });

  const existingToken = request.cookies.get("insforge_access_token")?.value;
  const refreshedToken = response.cookies.get("insforge_access_token")?.value;
  const accessToken = refreshedToken || existingToken;

  if (!accessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/profile/:path*", "/checkout"],
};
