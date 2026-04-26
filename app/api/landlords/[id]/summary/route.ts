import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getGeminiModel } from "@/lib/gemini";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const reviews = await prisma.review.findMany({
    where: { userId: id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  if (reviews.length === 0) {
    return NextResponse.json({ summary: null });
  }

  const reviewText = reviews
    .map(
      (r, i) =>
        `Review ${i + 1} (${r.rating}/5, deposit returned: ${r.depositReturned}, maintenance: ${r.maintenanceRating}/5): ${r.reviewText}`
    )
    .join("\n");

  const prompt = `Analyze these tenant reviews and return a 2-3 sentence summary highlighting patterns in: deposit handling, maintenance responsiveness, and overall landlord behavior. Be objective and factual.\n\n${reviewText}`;

  try {
    const model = getGeminiModel("gemma-3-27b-it");
    const result = await model.generateContent(prompt);
    const summary = result.response.text().trim();
    return NextResponse.json({ summary });
  } catch (err) {
    console.error("Gemini summary error:", err);
    return NextResponse.json({ summary: null });
  }
}
