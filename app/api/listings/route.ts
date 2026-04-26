import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleApiError } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const minRent = searchParams.get("minRent");
    const maxRent = searchParams.get("maxRent");
    const bedrooms = searchParams.get("bedrooms");
    const search = searchParams.get("search");

    const where: any = {};
    if (minRent) where.rent = { ...where.rent, gte: parseFloat(minRent) };
    if (maxRent) where.rent = { ...where.rent, lte: parseFloat(maxRent) };
    if (bedrooms) where.bedrooms = parseInt(bedrooms);
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
      ];
    }

    const listings = await prisma.listing.findMany({
      where,
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(listings);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const listing = await prisma.listing.create({
      data: {
        ...body,
        userId: user.id,
      },
    });

    return NextResponse.json(listing);
  } catch (error) {
    return handleApiError(error);
  }
}
