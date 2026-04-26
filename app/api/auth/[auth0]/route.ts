import { NextResponse } from "next/server";

// In Auth0 v4 + Next.js 16, authentication routes (/auth/login, /auth/callback, /auth/logout)
// are handled automatically by proxy.ts via auth0.middleware().
// Redirect any legacy /api/auth/* calls to the correct /auth/* paths.
export function GET(request: Request) {
  const url = new URL(request.url);
  // Strip /api prefix: /api/auth/login -> /auth/login
  const newPath = url.pathname.replace(/^\/api/, "");
  const redirectUrl = new URL(newPath + url.search, url.origin);
  return NextResponse.redirect(redirectUrl);
}

export const POST = GET;
