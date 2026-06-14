import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/utils/auth";

const protectedPaths = ["/profile", "/admin"];

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

  let accessToken = request.cookies.get("insforge_access_token")?.value;
  const refreshToken = request.cookies.get("insforge_refresh_token")?.value;

  let isTokenValid = accessToken && !isJwtExpired(accessToken);
  let hasRefreshed = false;

  if (!isTokenValid && refreshToken) {
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
            accessToken = data.accessToken;
            isTokenValid = true;
            hasRefreshed = true;
          }
        }
      } catch {
        // Refresh failed — fall through to redirect
      }
    }
  }

  if (isTokenValid && accessToken) {
    // Check admin status for /admin paths
    const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");
    if (isAdminPath) {
      const decoded = decodeJwtPayload(accessToken);
      const email = decoded?.email as string | undefined;

      if (!email || !isAdmin(email)) {
        // Redirect to homepage if user is not authorized as admin
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    if (hasRefreshed && accessToken) {
      const response = NextResponse.next();
      response.cookies.set("insforge_access_token", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      response.cookies.set(
        "insforge_refresh_token",
        refreshToken || "",
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

    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/profile/:path*", "/admin", "/admin/:path*"],
};

