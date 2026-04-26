import { auth0 } from "./auth0";
import { prisma } from "./prisma";
import { redirect } from "next/navigation";

export async function getUser() {
  const session = await auth0.getSession();
  if (!session) return null;

  const auth0Id = session.user.sub as string;
  return prisma.user.findUnique({ where: { auth0Id } });
}

export async function requireAuth() {
  const user = await getUser();
  if (!user) redirect("/auth/login");
  return user;
}

export async function requireVerifiedStudent() {
  const user = await requireAuth();
  if (user.role !== "STUDENT" || !user.isVerified) {
    throw new Error("Verified UW student account required");
  }
  return user;
}
