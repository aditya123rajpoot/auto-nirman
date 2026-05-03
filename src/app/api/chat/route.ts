import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    console.log("ðŸŸ¢ Incoming user message:", message);

    if (!process.env.GROQ_API_KEY) {
      console.error("âŒ Missing GROQ_API_KEY in environment");
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
        messages: [
          {
            role: "system",
            content: "You are Auto Nirman AI, a premium construction intelligence assistant for India. Answer with polished, concise structure. Use short paragraphs, numbered lists when useful, and clear section labels. Focus on BOQ analysis, rates, construction planning, vendor risk, cost leakage, and practical next steps. Avoid generic encyclopedia-style answers. If the user input is unclear, ask one sharp clarification and suggest likely construction-related interpretations.",
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

    console.log("ðŸ“¦ Groq raw response:", isJsonResponse ? JSON.stringify(data) : rawText.slice(0, 300));

    if (!groqRes.ok) {
      console.error("âŒ Groq error:", isJsonResponse ? data : rawText);
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
      return NextResponse.json({ response: "âš ï¸ No reply from Groq model" }, { status: 200 });
    }

    return NextResponse.json({ response: content });
  } catch (err: any) {
    console.error("ðŸ”¥ Server crash error:", err?.message || err);
    return NextResponse.json({ response: "âŒ Server error" }, { status: 500 });
  }
}
