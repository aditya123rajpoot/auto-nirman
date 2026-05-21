import { NextRequest, NextResponse } from "next/server";
import { postToBackend } from "@/lib/backend";
import { AUTO_NIRMAN_CHAT_SYSTEM_PROMPT, GROQ_CACHE_MODEL, getGroqCachedTokens } from "@/lib/groqPrompts";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    console.log("Incoming user message:", message);
    const backendResult = await postToBackend<{ response: string; cache?: unknown }>("/api/v1/chat", { message });

    if (backendResult) {
      return NextResponse.json(backendResult);
    }

    if (!process.env.GROQ_API_KEY) {
      console.error("Missing GROQ_API_KEY in environment");
      return NextResponse.json({ response: "Missing API Key" }, { status: 500 });
    }

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_CACHE_MODEL,
        messages: [
          {
            role: "system",
            content: AUTO_NIRMAN_CHAT_SYSTEM_PROMPT,
          },
          { role: "user", content: message },
        ],
        temperature: 0.45,
      }),
    });

    const rawText = await groqRes.text();
    const contentType = groqRes.headers.get("content-type") || "";
    const isJsonResponse = contentType.includes("application/json");
    const data = isJsonResponse ? JSON.parse(rawText) : null;

    if (data) {
      console.log("Groq cache usage:", getGroqCachedTokens(data));
    } else {
      console.log("Groq raw response:", rawText.slice(0, 300));
    }

    if (!groqRes.ok) {
      console.error("Groq error:", isJsonResponse ? data : rawText);
      return NextResponse.json(
        {
          response: isJsonResponse
            ? data?.error?.message || "Unknown Groq error"
            : "Groq returned a non-JSON error response.",
        },
        { status: 500 }
      );
    }

    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ response: "No reply from Groq model" }, { status: 200 });
    }

    return NextResponse.json({ response: content, cache: getGroqCachedTokens(data) });
  } catch (err: any) {
    console.error("Server crash error:", err?.message || err);
    return NextResponse.json({ response: "Server error" }, { status: 500 });
  }
}
