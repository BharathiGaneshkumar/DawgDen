import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    const where: any = { role: "LANDLORD" };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const landlords = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(landlords);
  } catch (error) {
    return handleApiError(error);
  }
}
