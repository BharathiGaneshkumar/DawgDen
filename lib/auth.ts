import { auth0 } from "./auth0";
import { prisma } from "./prisma";
import { NextResponse } from "next/server";

export async function getUser() {
  const session = await auth0.getSession();
  if (!session?.user?.sub) return null;

  const dbUser = await prisma.user.findUnique({
    where: { auth0Id: session.user.sub },
  });

  return dbUser;
}

export async function requireAuth() {
  const user = await getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireVerifiedStudent() {
  const user = await requireAuth();
  if (user.role !== "STUDENT" || !user.isVerified) {
    throw new Error("Forbidden: Verified Student Only");
  }
  return user;
}

export function handleApiError(error: unknown) {
  if (error instanceof Error) {
    if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (error.message === "Forbidden: Verified Student Only") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  console.error(error);
  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}
