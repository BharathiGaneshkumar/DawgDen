import { NextResponse } from "next/server";
import { getAnthropicClient } from "@/lib/anthropic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const text = formData.get("text") as string | null;
    const file = formData.get("file") as File | null;

    let leaseText = text || "";

    if (file && file.size > 0) {
      if (file.type === "application/pdf") {
        const buffer = Buffer.from(await file.arrayBuffer());
        const pdfParse = (await import("pdf-parse")) as any;
        const parsed = await (pdfParse.default ?? pdfParse)(buffer);
        leaseText = parsed.text;
      } else {
        leaseText = await file.text();
      }
    }

    if (!leaseText.trim()) {
      return NextResponse.json({ error: "No lease text provided" }, { status: 400 });
    }

    const truncated = leaseText.slice(0, 12000);

    const client = getAnthropicClient();
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: `You are a tenant rights expert reviewing a residential lease for a college student in Washington State. Analyze the following lease text and identify issues, red flags, and things the student should know.

Return a JSON array (and ONLY a JSON array, no markdown) with objects of this shape:
{"issue": "Short title", "description": "Detailed explanation of why this is a problem and what the student can do", "severity": "High" | "Medium" | "Low"}

Focus on: illegal clauses under WA tenant law, unfair terms, missing protections, hidden fees, deposit issues, entry/notice violations, automatic renewals, early termination traps, and anything especially risky for a student. Include 3-8 items. If the text is too short or clearly not a lease, return [{"issue":"Unable to analyze","description":"The provided text does not appear to be a full lease agreement. Please paste more of your lease.","severity":"High"}].

Lease text:
${truncated}`,
        },
      ],
    });

    const raw = (message.content[0] as { type: string; text: string }).text.trim();
    // strip any accidental markdown fences
    const json = raw.replace(/^```json?\s*/i, "").replace(/```\s*$/, "");
    const issues = JSON.parse(json);

    return NextResponse.json({ issues });
  } catch (error: any) {
    console.error("Lease analysis error:", error);
    return NextResponse.json(
      { error: error.message || "Analysis failed" },
      { status: 500 }
    );
  }
}
