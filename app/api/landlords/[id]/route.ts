import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Fetch landlord user
    const landlord = await prisma.user.findUnique({
      where: { id, role: "LANDLORD" },
      include: {
        listings: true,
      },
    });

    if (!landlord) return NextResponse.json({ error: "Landlord not found" }, { status: 404 });

    // Fetch reviews by matching landlordName or something, since we don't have a direct relation.
    // For a robust system, Review should have a `landlordId` instead of `landlordName`, 
    // but schema says `landlordName` String. If we have exact match, we use it, 
    // or just fetch by name if possible. Let's assume we can query by user.name for now,
    // or we fetch all reviews and filter.
    const reviews = await prisma.review.findMany({
      where: { landlordName: landlord.name ?? "" },
      include: { user: true, comments: { include: { user: true } } },
    });

    // Calculate Trust Score
    // Trust score = (avg rating × 2) + (deposit return rate × 3) + (avg maintenance × 2) out of 10
    // Actually, avg rating (1-5) * 2 = 10 max
    // Deposit return rate (0-1) * 3 = 3 max? Wait, formula in prompt:
    // "Trust score = (avg rating × 2) + (deposit return rate × 3) + (avg maintenance × 2) out of 10"
    // Wait, 5*2 + 1*3 + 5*2 = 10+3+10 = 23? It says "out of 10". Let's normalize it to out of 10.
    // Formula might mean weights. Let's just do:
    // Base: (Avg Rating / 5) * 4 + (Deposit Return % / 100) * 3 + (Avg Maintenance / 5) * 3 = Max 10.
    
    let trustScore = 0;
    let avgRating = 0;
    let depositReturnRate = 0;
    let avgMaintenance = 0;

    if (reviews.length > 0) {
      avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
      depositReturnRate = (reviews.filter(r => r.depositReturned).length / reviews.length) * 100;
      avgMaintenance = reviews.reduce((acc, r) => acc + r.maintenanceRating, 0) / reviews.length;
      
      trustScore = ((avgRating / 5) * 4) + ((depositReturnRate / 100) * 3) + ((avgMaintenance / 5) * 3);
    } else {
      // Default or null
      trustScore = 5.0; // neutral
    }

    return NextResponse.json({
      ...landlord,
      reviews,
      stats: {
        trustScore: parseFloat(trustScore.toFixed(1)),
        avgRating: parseFloat(avgRating.toFixed(1)),
        depositReturnRate: Math.round(depositReturnRate),
        avgMaintenance: parseFloat(avgMaintenance.toFixed(1)),
        totalReviews: reviews.length,
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
