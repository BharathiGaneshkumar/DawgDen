import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireVerifiedStudent, handleApiError } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "new";

    const where: any = {};
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    const posts = await prisma.post.findMany({
      where,
      include: { user: true, _count: { select: { comments: true } } },
      orderBy: sort === "top" ? { upvotes: "desc" } : { createdAt: "desc" },
    });

    return NextResponse.json(posts);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireVerifiedStudent();
    const body = await req.json();

    const post = await prisma.post.create({
      data: {
        ...body,
        userId: user.id,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    return handleApiError(error);
  }
}
