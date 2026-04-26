import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleApiError } from "@/lib/auth";

const replyInclude = {
  user: true,
  replies: {
    include: {
      user: true,
      replies: { include: { user: true } },
    },
    orderBy: { createdAt: "asc" as const },
  },
};

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const comments = await prisma.comment.findMany({
      where: { postId: id, parentId: null },
      include: replyInclude,
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(comments);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await req.json();

    const comment = await prisma.comment.create({
      data: {
        content: body.content,
        postId: id,
        userId: user.id,
        parentId: body.parentId || null,
      },
      include: replyInclude,
    });

    return NextResponse.json(comment);
  } catch (error) {
    return handleApiError(error);
  }
}
