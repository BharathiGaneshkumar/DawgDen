import { NextResponse } from "next/server";

// In Auth0 v4, the callback is handled automatically by proxy.ts at /auth/callback.
// The DB upsert runs via the beforeSessionSaved hook in lib/auth0.ts.
export function GET() {
  return NextResponse.redirect(new URL("/", process.env.APP_BASE_URL ?? "http://localhost:3000"));
}
