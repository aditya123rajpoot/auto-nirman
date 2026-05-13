"use client";

import { useState, useEffect, useRef } from "react";
import { SendHorizontal, Mic, Zap, Shield, TrendingUp } from "lucide-react";
import VoiceInput from "./VoiceInput";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";

const SUGGESTED = [
  { icon: TrendingUp, label: "Analyse my BOQ for cost leakage" },
  { icon: Shield, label: "Check vendor rates against benchmarks" },
  { icon: Zap, label: "Generate a risk report for my project" },
];

type RichTextPart =
  | { kind: "heading"; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] };

const cleanBotText = (text: string) =>
  text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\s*(\d+)\.\s+/g, "\n$1. ")
    .replace(/\s*[-•]\s+/g, "\n- ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const parseRichText = (text: string): RichTextPart[] => {
  const lines = cleanBotText(text).split("\n").map((line) => line.trim()).filter(Boolean);
  const parts: RichTextPart[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length) {
      parts.push({ kind: "list", items: listItems });
      listItems = [];
    }
  };

  for (const line of lines) {
    const listMatch = line.match(/^(?:\d+\.|-)\s+(.*)$/);
    if (listMatch) {
      listItems.push(listMatch[1].trim());
      continue;
    }

    flushList();
    parts.push(line.length <= 70 && /:$/.test(line) ? { kind: "heading", text: line.replace(/:$/, "") } : { kind: "paragraph", text: line });
  }

  flushList();
  return parts.length ? parts : [{ kind: "paragraph", text }];
};

function BotResponse({ text }: { text: string }) {
  const parts = parseRichText(text);

  return (
    <div className="space-y-3">
      {parts.map((part, index) => {
        if (part.kind === "heading") {
          return <h4 key={index} className="text-[13px] font-semibold text-cyan-200 tracking-wide">{part.text}</h4>;
        }

        if (part.kind === "list") {
          return (
            <ol key={index} className="space-y-2.5">
              {part.items.map((item, itemIndex) => (
                <li key={itemIndex} className="grid grid-cols-[22px_1fr] gap-2 text-[14px] leading-6 text-slate-200/95">
                  <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10 text-[10px] font-bold text-cyan-200">{itemIndex + 1}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          );
        }

        return <p key={index} className="text-[14px] leading-7 text-slate-200/95">{part.text}</p>;
      })}
    </div>
  );
}

export default function ChatWindow() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ text: string; type: "user" | "bot" }[]>([]);
  const [loading, setLoading] = useState(false);
  const [botAnimation, setBotAnimation] = useState(null);
  const [animatedText, setAnimatedText] = useState("");
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/lotties/bot.json")
      .then((res) => res.json())
      .then((data) => setBotAnimation(data))
      .catch(() => {});
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      containerRef.current?.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  };

  const sendMessage = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text) return;

    const userMessage = { text, type: "user" } as const;
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    scrollToBottom();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const rawText = await res.text();
      let botReply = "No response received.";
      try {
        const data = JSON.parse(rawText);
        botReply = data?.response || botReply;
      } catch {
        botReply = res.ok ? rawText || botReply : "Chat service returned an invalid response";
      }

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
        }, i * 18);
      });
    } catch {
      setMessages((prev) => [...prev, { text: "Server error occurred", type: "bot" }]);
      setLoading(false);
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="relative w-full min-h-[100dvh] bg-[#050810] overflow-hidden flex flex-col items-center justify-center">

      {/* Deep space background */}
      <div className="absolute inset-0 z-0">
        {/* Architectural grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(#38bdf8 1px, transparent 1px),
              linear-gradient(90deg, #38bdf8 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
        {/* Perspective grid floor */}
        <div
          className="absolute bottom-0 left-0 right-0 h-64 opacity-[0.06]"
          style={{
            backgroundImage: `linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
            transform: "perspective(400px) rotateX(60deg)",
            transformOrigin: "bottom center",
          }}
        />
        {/* Ambient glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-cyan-500/6 rounded-full blur-[80px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px]" />
        {/* Scan line overlay */}
        <div
          className="absolute inset-0 opacity-[0.015] pointer-events-none"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 3px)",
            backgroundSize: "100% 3px",
          }}
        />
      </div>

      {/* Header bar */}
      <div className="absolute top-0 left-0 right-0 z-20 hidden items-center justify-between px-6 py-4 border-b border-white/5 sm:flex">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
          <span className="text-xs font-mono tracking-[0.2em] text-cyan-400/70 uppercase">Auto Nirman AI</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-white/20">
          <span>v2.1.0</span>
          <span className="flex items-center gap-1.5 text-green-400/70"><span className="h-1.5 w-1.5 rounded-full bg-green-400" /> ONLINE</span>
        </div>
      </div>

      {/* Main chat container */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mx-auto flex h-[100dvh] w-full max-w-2xl flex-col px-3 pb-4 pt-24 sm:px-4 sm:pb-6 sm:pt-[72px]"
      >

        {/* Empty state */}
        <AnimatePresence>
          {isEmpty && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex-1 flex flex-col items-center justify-center text-center"
            >
              {/* Bot avatar */}
              <div className="relative mb-5 sm:mb-8">
                <div className="absolute inset-0 rounded-full bg-cyan-400/10 blur-2xl scale-150 animate-pulse" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-cyan-400/20 bg-gradient-to-br from-blue-900/40 to-cyan-900/20 shadow-[0_0_40px_#0ea5e920,inset_0_1px_0_#ffffff15] backdrop-blur-xl sm:h-28 sm:w-28">
                  {botAnimation ? (
                    <Lottie animationData={botAnimation} loop autoplay className="h-16 w-16 sm:h-20 sm:w-20" />
                  ) : (
                    <Zap className="text-cyan-400" size={40} />
                  )}
                </div>
                {/* Rotating ring */}
                <div
                  className="absolute inset-[-8px] rounded-full border border-dashed border-cyan-400/20 animate-spin"
                  style={{ animationDuration: "12s" }}
                />
              </div>

              <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
                Construction AI Buddy
              </h1>
              <p className="text-sm text-white/40 mb-6 max-w-xs leading-relaxed font-light sm:mb-10">
                Ask me anything about BOQ analysis, cost benchmarks, vendor rates, or project planning.
              </p>

              {/* Suggested prompts */}
              <div className="w-full space-y-2">
                {SUGGESTED.map((s, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    onClick={() => sendMessage(s.label)}
                    className="w-full flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-3 text-left transition-all duration-200 hover:border-cyan-400/30 hover:bg-cyan-400/[0.04] group sm:px-4"
                  >
                    <s.icon size={15} className="text-cyan-400/60 group-hover:text-cyan-400 transition-colors shrink-0" />
                    <span className="text-sm text-white/50 group-hover:text-white/80 transition-colors">{s.label}</span>
                    <span className="ml-auto hidden text-xs text-white/20 transition-colors group-hover:text-cyan-400/60 sm:inline">Enter</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        {!isEmpty && (
          <div
            ref={containerRef}
            className="flex-1 overflow-y-auto space-y-4 pb-4 pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
          >
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => {
                const isLastBot = msg.type === "bot" && idx === messages.length - 1;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"} items-end gap-2`}
                  >
                    {/* Bot avatar bubble */}
                    {msg.type === "bot" && (
                      <div className="w-7 h-7 rounded-full border border-cyan-400/20 bg-cyan-900/20 flex items-center justify-center shrink-0 mb-1">
                        {botAnimation ? (
                          <Lottie animationData={botAnimation} loop autoplay className="w-5 h-5" />
                        ) : (
                          <Zap size={12} className="text-cyan-400" />
                        )}
                      </div>
                    )}

                    <div
                      className={`break-words ${
                        msg.type === "user"
                          ? "max-w-[72%] px-4 py-3 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl rounded-br-md shadow-[0_4px_20px_#2563eb40]"
                          : "max-w-[82%] px-5 py-4 bg-[#0d1424]/90 text-white rounded-2xl rounded-bl-md border border-cyan-400/10 shadow-[0_12px_40px_#02061766] backdrop-blur-sm"
                      }`}
                    >
                      {msg.type === "bot" ? (
                        <BotResponse text={isLastBot && animatedText ? animatedText : msg.text} />
                      ) : (
                        <span className="text-sm font-medium leading-6">{msg.text}</span>
                      )}
                      {isLastBot && loading && (
                        <span className="inline-block w-[2px] h-3.5 bg-cyan-400 ml-1 animate-pulse align-middle" />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Typing indicator */}
            <AnimatePresence>
              {loading && messages[messages.length - 1]?.type !== "bot" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-end gap-2"
                >
                  <div className="w-7 h-7 rounded-full border border-cyan-400/20 bg-cyan-900/20 flex items-center justify-center shrink-0">
                    <Zap size={12} className="text-cyan-400" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-white/[0.05] border border-white/[0.08] flex items-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Input bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className={`relative mt-3 rounded-2xl transition-all duration-300 sm:mt-4 ${
            focused
              ? "shadow-[0_0_0_1px_#22d3ee30,0_8px_40px_#0ea5e915]"
              : "shadow-[0_0_0_1px_#ffffff10,0_4px_20px_#00000040]"
          }`}
        >
          <div className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 backdrop-blur-xl sm:px-4 sm:py-3">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Ask me about your project..."
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none caret-cyan-400 placeholder-white/25"
            />

            <div className="flex items-center gap-1.5">
              <VoiceInput onFinalResult={(text) => setInput(text)} />

              <button
                onClick={() => sendMessage()}
                disabled={!input.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white transition-all duration-200 hover:scale-105 hover:shadow-[0_0_20px_#38bdf860] active:scale-95 disabled:opacity-30 disabled:hover:scale-100 disabled:hover:shadow-none"
              >
                <SendHorizontal size={16} />
              </button>
            </div>
          </div>

          {/* Animated focus border */}
          {focused && (
            <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden">
              <div className="absolute inset-0 rounded-2xl border border-cyan-400/20" />
              <motion.div
                className="absolute top-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent"
                initial={{ width: "0%", left: "50%" }}
                animate={{ width: "100%", left: "0%" }}
                transition={{ duration: 0.4 }}
              />
            </div>
          )}
        </motion.div>

        {/* Footer hint */}
        <p className="text-center text-[10px] text-white/15 mt-3 font-mono tracking-wider">
          POWERED BY AUTO NIRMAN AI - BUILT FOR INDIA
        </p>
      </motion.div>
    </div>
  );
}
