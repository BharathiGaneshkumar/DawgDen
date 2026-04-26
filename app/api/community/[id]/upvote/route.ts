import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleApiError } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    const { id } = await params;

    const post = await prisma.post.update({
      where: { id },
      data: {
        upvotes: { increment: 1 },
      },
    });

    return NextResponse.json({ upvotes: post.upvotes });
  } catch (error) {
    return handleApiError(error);
  }
}
