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
        model: "llama3-70b-8192",
        messages: [{ role: "user", content: message }],
        temperature: 0.7,
      }),
    });

    const data = await groqRes.json();
    console.log("📦 Groq raw response:", JSON.stringify(data));

    if (!groqRes.ok) {
      console.error("❌ Groq error:", data);
      return NextResponse.json({ response: data?.error?.message || "Unknown error" }, { status: 500 });
    }

    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ response: "⚠️ No reply from LLaMA 3" }, { status: 200 });
    }

    return NextResponse.json({ response: content });
  } catch (err: any) {
    console.error("🔥 Server crash error:", err?.message || err);
    return NextResponse.json({ response: "❌ Server error" }, { status: 500 });
  }
}
