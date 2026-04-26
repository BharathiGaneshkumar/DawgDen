import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { prisma } from "./prisma";

export const auth0 = new Auth0Client({
  async beforeSessionSaved(session) {
    const { sub: auth0Id, email, name, picture } = session.user as {
      sub: string;
      email?: string;
      name?: string;
      picture?: string;
    };

    if (!auth0Id || !email) return session;

    const isUWEmail = email.toLowerCase().endsWith("@uw.edu");

    const dbUser = await prisma.user.upsert({
      where: { auth0Id },
      update: { email, name: name ?? null, avatarUrl: picture ?? null },
      create: {
        auth0Id,
        email,
        name: name ?? null,
        avatarUrl: picture ?? null,
        role: isUWEmail ? "STUDENT" : "LANDLORD",
        isVerified: isUWEmail,
      },
    });

    return {
      ...session,
      user: {
        ...session.user,
        role: dbUser.role,
        isVerified: dbUser.isVerified,
        dbId: dbUser.id,
      },
    };
  },
});
