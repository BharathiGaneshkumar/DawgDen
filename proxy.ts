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

// Only verified students may access these routes; landlords are redirected out
const STUDENT_ONLY_ROUTES = ["/community/new", "/marketplace/new"];

export async function proxy(request: NextRequest) {
  const authResponse = await auth0.middleware(request);
  const path = request.nextUrl.pathname;

  const isProtected = PROTECTED_ROUTES.some(
    (r) => path === r || path.startsWith(r + "/")
  );

  if (isProtected) {
    const session = await auth0.getSession(request);
    if (!session) {
      const loginUrl = new URL("/api/auth/login", request.url);
      loginUrl.searchParams.set("returnTo", path);
      return NextResponse.redirect(loginUrl);
    }

    const isStudentOnly = STUDENT_ONLY_ROUTES.some(
      (r) => path === r || path.startsWith(r + "/")
    );
    if (isStudentOnly && session.user.role !== "STUDENT") {
      // Landlords get redirected to the parent route
      const parent = path.startsWith("/community") ? "/community" : "/marketplace";
      return NextResponse.redirect(new URL(parent, request.url));
    }
  }

  return authResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
