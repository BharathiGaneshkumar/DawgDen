import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Allow long execution times since Gemini might take a few seconds
export const maxDuration = 60; 

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured in .env.local" },
        { status: 500 }
      );
    }

    const data = await req.formData();
    const file = data.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Uploaded file must be a PDF" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract text from the PDF
    const pdfParse = (await import("pdf-parse")) as any;
    const pdfData = await (pdfParse.default ?? pdfParse)(buffer);
    const text = pdfData.text;

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Could not extract any text from the PDF. It may be an image-only PDF." },
        { status: 400 }
      );
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert real estate lawyer. Analyze this lease agreement text and identify any red flags, hidden fees, or unfair clauses. 
      Return the output STRICTLY as a JSON array where each object has:
      - "id": a unique integer ID
      - "issue": a short string title of the issue
      - "description": a detailed string explanation of why it's a red flag
      - "severity": a string, exactly one of "High", "Medium", or "Low"
      
      Do not include markdown formatting or backticks around the JSON. Just the raw JSON array.
      If no issues are found, return an empty array [].
      
      Lease Text:
      ${text}
    `;

    const result = await model.generateContent(prompt);
    let jsonText = result.response.text();
    
    // Clean up potential markdown blocks if the model ignored instructions
    jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();

    const analysisResults = JSON.parse(jsonText);

    return NextResponse.json({ results: analysisResults });
  } catch (error: any) {
    console.error("Lease Analysis Error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred during analysis" },
      { status: 500 }
    );
  }
}
