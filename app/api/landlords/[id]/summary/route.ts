import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getGeminiModel } from "@/lib/gemini";
import { handleApiError } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Fetch landlord
    const landlord = await prisma.user.findUnique({
      where: { id },
    });

    if (!landlord || landlord.role !== "LANDLORD") return NextResponse.json({ error: "Landlord not found" }, { status: 404 });

    // Fetch reviews
    const reviews = await prisma.review.findMany({
      where: { landlordName: landlord.name ?? "" },
    });

    if (reviews.length === 0) {
      return NextResponse.json({ summary: "Not enough reviews to generate a summary." });
    }

    const reviewTexts = reviews.map((r: any) =>
      `Rating: ${r.rating}/5. Deposit Returned: ${r.depositReturned ? "Yes" : "No"}. Maintenance Rating: ${r.maintenanceRating}/5. Review: "${r.reviewText}"`
    ).join("\n\n");

    const prompt = `Analyze these tenant reviews and return a 2-3 sentence summary highlighting patterns in: deposit handling, maintenance responsiveness, and overall landlord behavior. Be objective and factual.\n\nReviews:\n${reviewTexts}`;

    let summary = "AI summary generation failed.";
    try {
      const model = getGeminiModel("gemma-3-27b-it");
      const result = await model.generateContent(prompt);
      summary = result.response.text();
    } catch (aiError) {
      console.error("Gemma AI Error:", aiError);
      // Fallback
      summary = `Based on ${reviews.length} reviews, this landlord has an average rating of ${(reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length).toFixed(1)}/5.`;
    }

    return NextResponse.json({ summary });
  } catch (error) {
    return handleApiError(error);
  }
}
