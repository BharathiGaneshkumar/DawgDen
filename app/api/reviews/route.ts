import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireVerifiedStudent, handleApiError } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const landlordName = searchParams.get("landlordName");
    const listingId = searchParams.get("listingId");
    const search = searchParams.get("search");

    const where: any = {};
    if (landlordName) where.landlordName = landlordName;
    if (listingId) where.listingId = listingId;
    if (search) {
      where.OR = [
        { reviewText: { contains: search, mode: "insensitive" } },
        { landlordName: { contains: search, mode: "insensitive" } },
      ];
    }

    const reviews = await prisma.review.findMany({
      where,
      include: { user: true, comments: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireVerifiedStudent();
    const body = await req.json();

    const review = await prisma.review.create({
      data: {
        ...body,
        solanaHash: "placeholder_solana_hash_" + Date.now(), // Placeholder for future integration
        userId: user.id,
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    return handleApiError(error);
  }
}
