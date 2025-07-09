"use client";

import { useState, useEffect, useRef } from "react";
import { SendHorizontal } from "lucide-react";
import VoiceInput from "./VoiceInput";
import { motion } from "framer-motion";
import Lottie from "lottie-react";

export default function ChatWindow() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ text: string; type: "user" | "bot" }[]>([]);
  const [loading, setLoading] = useState(false);
  const [botAnimation, setBotAnimation] = useState(null);
  const [animatedText, setAnimatedText] = useState(""); // for bot animation
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/lotties/bot.json")
      .then((res) => res.json())
      .then((data) => setBotAnimation(data))
      .catch((err) => console.error("Failed to load bot animation:", err));
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      containerRef.current?.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input.trim(), type: "user" } as const;
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.text }),
      });

      const data = await res.json();
      const botReply = data?.response || "⚠️ No response received.";

      // Insert empty bot message to animate into
      setMessages((prev) => [...prev, { text: "", type: "bot" }]);
      setAnimatedText("");

      const words = botReply.split(" ");
      let current = "";

      words.forEach((word: string, i: number) => {
        setTimeout(() => {
          current += (i === 0 ? "" : " ") + word;
          setAnimatedText(current);

          if (i === words.length - 1) {
            setLoading(false);
            scrollToBottom();
          }
        }, i * 100); // adjust speed here
      });
    } catch (err) {
      setMessages((prev) => [...prev, { text: "❌ Server error occurred", type: "bot" }]);
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-black overflow-hidden px-2">
      {/* Cyberpunk animated grid background */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_1px_1px,_#ffffff11_1px,_transparent_0)] [background-size:16px_16px] opacity-10" />
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-black" />

      {/* Chat Window */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 font-sans w-full max-w-md mx-auto mt-24 bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 flex flex-col h-[80vh] animate-neon-flicker shadow-neon"
      >
        {/* Bot Animation */}
        <div className="flex justify-center mb-2">
          {botAnimation && (
            <div className="w-20 h-20">
              <Lottie animationData={botAnimation} loop autoplay />
            </div>
          )}
        </div>

        {/* Messages */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto space-y-2 px-1 py-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
        >
          {messages.map((msg, idx) => {
            const isLastBotMessage = msg.type === "bot" && idx === messages.length - 1;

            return (
              <div
                key={idx}
                className={`max-w-[80%] px-4 py-2 rounded-xl text-sm break-words ${
                  msg.type === "user"
                    ? "bg-blue-600 text-white self-end ml-auto"
                    : "bg-white/10 text-white backdrop-blur-sm border border-white/20 self-start shadow-[0_0_10px_#38bdf8,0_0_20px_#38bdf8] animate-fade-in"
                }`}
              >
                {isLastBotMessage && animatedText ? animatedText : msg.text}

                {/* Blinking cursor if user message is last and bot is typing */}
                {msg.type === "user" && idx === messages.length - 1 && loading && (
                  <span className="inline-block w-2 h-4 bg-accent ml-1 animate-blink" />
                )}
              </div>
            );
          })}

          {/* Typing indicator */}
          {loading && (
            <div className="bg-white/10 text-accent px-4 py-2 rounded-xl text-sm w-fit backdrop-blur-sm border border-white/20 flex items-center gap-1">
              typing
              <span className="w-1 h-1 rounded-full bg-accent animate-dot-pulse" />
              <span className="w-1 h-1 rounded-full bg-accent animate-dot-pulse delay-200" />
              <span className="w-1 h-1 rounded-full bg-accent animate-dot-pulse delay-400" />
            </div>
          )}
        </div>

        {/* Input field and buttons */}
        <div className="flex items-center gap-2 mt-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask something..."
            className="flex-1 p-2 rounded-lg bg-white/20 text-white placeholder-white/50 outline-none focus:ring focus:ring-accent transition duration-300 hover:shadow-[0_0_10px_#38bdf8]"
          />
          <VoiceInput onFinalResult={(text) => setInput(text)} />
          <button
            onClick={sendMessage}
            className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 hover:shadow-[0_0_15px_#38bdf8] transition duration-300"
          >
            <SendHorizontal size={20} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

