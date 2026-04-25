import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true, message: "Community API" }, { status: 200 });
}

export async function POST() {
  return NextResponse.json({ ok: true, message: "Community API" }, { status: 200 });
}
