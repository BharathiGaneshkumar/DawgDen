import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleApiError } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const item = await prisma.marketplaceItem.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(item);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await req.json();

    const item = await prisma.marketplaceItem.findUnique({ where: { id } });
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (item.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const updatedItem = await prisma.marketplaceItem.update({
      where: { id },
      data: { isSold: body.isSold },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const item = await prisma.marketplaceItem.findUnique({ where: { id } });
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (item.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.marketplaceItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
