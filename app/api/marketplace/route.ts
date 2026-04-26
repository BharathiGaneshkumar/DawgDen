import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireVerifiedStudent, handleApiError } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const search = searchParams.get("search");

    const where: any = {};
    if (category) where.category = category;
    if (minPrice) where.price = { ...where.price, gte: parseFloat(minPrice) };
    if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice) };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const items = await prisma.marketplaceItem.findMany({
      where,
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(items);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireVerifiedStudent();
    const body = await req.json();

    const item = await prisma.marketplaceItem.create({
      data: {
        ...body,
        userId: user.id,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    return handleApiError(error);
  }
}
