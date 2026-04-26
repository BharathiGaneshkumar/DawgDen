import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth0 } from "./lib/auth0";

const PROTECTED_ROUTES = [
  "/listings/new",
  "/community/new",
  "/marketplace/new",
  "/lease",
  "/profile/settings",
];

export async function proxy(request: NextRequest) {
  const authResponse = await auth0.middleware(request);

  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED_ROUTES.some(
    (r) => path === r || path.startsWith(r + "/")
  );

  if (isProtected) {
    const session = await auth0.getSession(request);
    if (!session) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("returnTo", path);
      return NextResponse.redirect(loginUrl);
    }
  }

  return authResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
