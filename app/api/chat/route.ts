import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY set nahi hai. Vercel Environment Variables mein API key add karein." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const messages: ChatMessage[] = body.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Pehle apna message likhein." }, { status: 400 });
    }

    const safeMessages = messages.filter((m) =>
      m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string"
    ).slice(-20);

    if (!safeMessages.length) {
      return NextResponse.json({ error: "Valid message nahi mila." }, { status: 400 });
    }

    const conversation = safeMessages
      .map((m) => (m.role === "user" ? "User: " : "JARVIS: ") + m.content.slice(0, 8000))
      .join("\n\n");

    const ai = new GoogleGenAI({ apiKey });
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: conversation,
      config: {
        systemInstruction: "You are JARVIS, a helpful personal AI assistant. Understand Roman Urdu, Urdu, Hindi, and English. If the user writes in Roman Urdu, reply in simple Roman Urdu. Be honest about your capabilities. You cannot control the user's device or access private accounts unless a secure tool is explicitly provided."
      }
    });

    const reply = result.text?.trim();
    if (!reply) return NextResponse.json({ error: "AI se empty response mila. Dobara try karein." }, { status: 502 });
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("JARVIS chat error:", error);
    return NextResponse.json({ error: "JARVIS abhi response nahi de saka. Thori dair baad dobara try karein." }, { status: 500 });
  }
}