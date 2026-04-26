import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getGeminiModel } from "@/lib/gemini";
import { handleApiError } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Fetch listing
    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

    // Fetch reviews for this exact listing
    const reviews = await prisma.review.findMany({
      where: { listingId: id },
    });

    if (reviews.length === 0) {
      return NextResponse.json({ summary: "Not enough reviews to generate a summary." });
    }

    const reviewTexts = reviews.map(r => 
      `Rating: ${r.rating}/5. Deposit Returned: ${r.depositReturned ? "Yes" : "No"}. Maintenance Rating: ${r.maintenanceRating}/5. Review: "${r.reviewText}"`
    ).join("\n\n");

    const prompt = `Analyze these tenant reviews for a specific housing property and return a 2-3 sentence summary highlighting patterns in: the condition of the house, any major pros/cons mentioned by tenants, and overall living experience. Be objective and factual.\n\nReviews:\n${reviewTexts}`;

    let summary = "AI summary generation failed.";
    try {
      // Use the gemini-2.5-flash model since we know it works with the current API key
      const model = getGeminiModel("gemini-2.5-flash");
      const result = await model.generateContent(prompt);
      summary = result.response.text();
    } catch (aiError) {
      console.error("Gemini AI Error:", aiError);
      // Fallback
      summary = `Based on ${reviews.length} reviews, this property has an average rating of ${(reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length).toFixed(1)}/5.`;
    }

    return NextResponse.json({ summary });
  } catch (error) {
    return handleApiError(error);
  }
}
