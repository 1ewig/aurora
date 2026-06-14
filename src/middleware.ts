import { NextResponse, type NextRequest } from "next/server";

const protectedPaths = ["/profile"];

function isProtectedPath(pathname: string): boolean {
  return protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

function isJwtExpired(token: string, leewaySeconds = 60): boolean {
  const decoded = decodeJwtPayload(token);
  if (!decoded?.exp || typeof decoded.exp !== "number") return true;
  return decoded.exp * 1000 <= Date.now() + leewaySeconds * 1000;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("insforge_access_token")?.value;
  const refreshToken = request.cookies.get("insforge_refresh_token")?.value;

  if (accessToken && !isJwtExpired(accessToken)) {
    return NextResponse.next();
  }

  if (refreshToken) {
    const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
    const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

    if (baseUrl && anonKey) {
      try {
        const res = await fetch(
          `${baseUrl}/api/auth/refresh?client_type=mobile`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${anonKey}`,
            },
            body: JSON.stringify({ refresh_token: refreshToken }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          if (data?.accessToken) {
            const response = NextResponse.next();
            response.cookies.set("insforge_access_token", data.accessToken, {
              httpOnly: true,
              secure: true,
              sameSite: "lax",
              path: "/",
              maxAge: 60 * 60 * 24 * 7,
            });
            response.cookies.set(
              "insforge_refresh_token",
              data.refreshToken || refreshToken,
              {
                httpOnly: true,
                secure: true,
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 60 * 24 * 30,
              }
            );
            return response;
          }
        }
      } catch {
        // Refresh failed — fall through to redirect
      }
    }
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/profile/:path*"],
};
