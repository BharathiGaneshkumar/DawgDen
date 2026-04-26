import { NextResponse } from "next/server";

// In Auth0 v4, auth routes (/auth/login, /auth/callback, /auth/logout)
// are handled automatically by proxy.ts via auth0.middleware().
// This legacy /api/auth/* path is no longer used.
export function GET() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
