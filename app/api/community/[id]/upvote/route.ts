import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleApiError } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const existing = await prisma.postVote.findUnique({
      where: { userId_postId: { userId: user.id, postId: id } },
    });

    let upvotes: number;
    let voted: boolean;

    if (existing) {
      const [, updated] = await prisma.$transaction([
        prisma.postVote.delete({ where: { userId_postId: { userId: user.id, postId: id } } }),
        prisma.post.update({ where: { id }, data: { upvotes: { decrement: 1 } } }),
      ]);
      upvotes = updated.upvotes;
      voted = false;
    } else {
      const [, updated] = await prisma.$transaction([
        prisma.postVote.create({ data: { userId: user.id, postId: id } }),
        prisma.post.update({ where: { id }, data: { upvotes: { increment: 1 } } }),
      ]);
      upvotes = updated.upvotes;
      voted = true;
    }

    return NextResponse.json({ upvotes, voted });
  } catch (error) {
    return handleApiError(error);
  }
}
