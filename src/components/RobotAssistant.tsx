'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Typewriter } from 'react-simple-typewriter';
import Lottie from 'lottie-react';
import botAnimation from '@/lotties/bot.json'; // ✅ fixed import path

export default function RobotAssistant() {
  const router = useRouter();

  const handleClick = () => {
    router.push('/chatbot'); // ✅ Navigate to chatbot
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: 'easeOut' }}
      className="fixed bottom-6 right-6 z-50 flex flex-col items-center space-y-2 cursor-pointer"
      onClick={handleClick}
    >
      {/* 🤖 Lottie Bot */}
      <div className="w-20 h-20 animate-float rounded-full overflow-hidden shadow-neon transition-transform hover:scale-105 active:scale-95">
        <Lottie animationData={botAnimation} loop autoplay />
      </div>

      {/* 💬 Greeting Bubble */}
      <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md text-white text-xs border border-white/20 shadow-glass max-w-[240px] text-center">
        <Typewriter
          words={[
            'Tap me to start chatting 🧠',
            'Hi! I’m your AI Construction Buddy 🤖',
          ]}
          loop
          cursor
          cursorStyle="_"
          typeSpeed={50}
          deleteSpeed={30}
          delaySpeed={2500}
        />
      </div>
    </motion.div>
  );
}
