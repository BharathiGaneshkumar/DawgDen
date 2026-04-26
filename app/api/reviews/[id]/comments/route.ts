import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleApiError } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const comments = await prisma.reviewComment.findMany({
      where: { reviewId: id },
      include: { user: true },
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

    const comment = await prisma.reviewComment.create({
      data: {
        content: body.content,
        reviewId: id,
        userId: user.id,
      },
      include: { user: true },
    });

    return NextResponse.json(comment);
  } catch (error) {
    return handleApiError(error);
  }
}
