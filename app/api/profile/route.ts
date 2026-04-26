import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth0.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const auth0Id = session.user.sub as string;
  const user = await prisma.user.findUnique({
    where: { auth0Id },
    include: { savedListings: { orderBy: { createdAt: "desc" } } },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json(user);
}

export async function PATCH(req: Request) {
  const session = await auth0.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const auth0Id = session.user.sub as string;

  let body: {
    name?: string | null;
    bio?: string | null;
    program?: string | null;
    gradYear?: number | null;
    avatarUrl?: string | null;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { auth0Id },
    data: {
      name: body.name ?? undefined,
      bio: body.bio ?? undefined,
      program: body.program ?? undefined,
      gradYear: body.gradYear ?? undefined,
      avatarUrl: body.avatarUrl ?? undefined,
    },
  });

  return NextResponse.json(updated);
}
