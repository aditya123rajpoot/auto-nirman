"use client";

import { useEffect, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// ✅ Fix TypeScript SpeechRecognition error
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }

  interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
  }
}

interface VoiceInputProps {
  onFinalResult: (text: string) => void;
}

export default function VoiceInput({ onFinalResult }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech Recognition API not supported in this browser.");
      return;
    }

    const recog = new SpeechRecognition();
    recog.continuous = false;
    recog.interimResults = false;
    recog.lang = "en-US";

    recog.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      onFinalResult(transcript);
      setIsRecording(false);
    };

    recog.onerror = (e: any) => {
      console.error("Speech recognition error:", e);
      setIsRecording(false);
    };

    recog.onend = () => {
      setIsRecording(false);
    };

    setRecognition(recog);
  }, [onFinalResult]);

  const toggleRecording = () => {
    if (!recognition) return;
    if (isRecording) {
      recognition.stop();
    } else {
      recognition.start();
    }
    setIsRecording(!isRecording);
  };

  return (
    <motion.button
      onClick={toggleRecording}
      whileTap={{ scale: 0.85 }}
      className={`p-2 rounded-full transition-all duration-300 border ${
        isRecording
          ? "bg-red-600 border-red-800 text-white animate-pulse"
          : "bg-white/20 border-white/30 text-white hover:bg-white/30"
      }`}
      title={isRecording ? "Stop Recording" : "Start Voice Input"}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isRecording ? (
          <motion.div
            key="mic-off"
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            <MicOff size={20} />
          </motion.div>
        ) : (
          <motion.div
            key="mic"
            initial={{ opacity: 0, rotate: 90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: -90 }}
            transition={{ duration: 0.2 }}
          >
            <Mic size={20} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
