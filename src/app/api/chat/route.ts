import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    console.log("🟢 Incoming user message:", message);

    if (!process.env.GROQ_API_KEY) {
      console.error("❌ Missing GROQ_API_KEY in environment");
      return NextResponse.json({ response: "Missing API Key" }, { status: 500 });
    }

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: message }],
        temperature: 0.7,
      }),
    });

    const rawText = await groqRes.text();
    const contentType = groqRes.headers.get("content-type") || "";
    const isJsonResponse = contentType.includes("application/json");
    const data = isJsonResponse ? JSON.parse(rawText) : null;

    console.log("📦 Groq raw response:", isJsonResponse ? JSON.stringify(data) : rawText.slice(0, 300));

    if (!groqRes.ok) {
      console.error("❌ Groq error:", isJsonResponse ? data : rawText);
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
      return NextResponse.json({ response: "⚠️ No reply from Groq model" }, { status: 200 });
    }

    return NextResponse.json({ response: content });
  } catch (err: any) {
    console.error("🔥 Server crash error:", err?.message || err);
    return NextResponse.json({ response: "❌ Server error" }, { status: 500 });
  }
}
