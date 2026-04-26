import { GoogleGenerativeAI } from "@google/generative-ai";

let _genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!_genAI) {
    if (!process.env.GOOGLE_AI_API_KEY) {
      throw new Error("Missing GOOGLE_AI_API_KEY environment variable");
    }
    _genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
  }
  return _genAI;
}

export function getGeminiModel(modelName = "gemma-3-27b-it") {
  return getGenAI().getGenerativeModel({ model: modelName });
}
