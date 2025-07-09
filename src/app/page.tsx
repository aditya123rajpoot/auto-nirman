'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import RobotAssistant from '@/components/RobotAssistant'; // ✅ Default import

export default function Home() {
  const router = useRouter();

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-blue-900 text-white overflow-hidden px-4">
      
      {/* 🔳 Cyberpunk Grid & Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_#ffffff11_1px,_transparent_0)] [background-size:18px_18px] opacity-5" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/10 to-black" />
      </div>

      {/* 🔷 Content Container */}
      <div className="relative z-10 text-center max-w-2xl w-full space-y-6">
        
        {/* 🧠 Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <Image
            src="/logo.png"
            alt="Auto Nirman Logo"
            width={100}
            height={100}
            className="mx-auto mb-2 animate-pulse drop-shadow-xl"
          />
        </motion.div>

        {/* 🔥 Heading */}
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-cyan-400 via-sky-300 to-lime-400 bg-clip-text text-transparent"
        >
          Welcome to Auto Nirman
        </motion.h1>

        {/* ✨ Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          className="text-lg md:text-xl text-gray-300"
        >
          Your all-in-one smart construction assistant. Plan. Track. Build. Succeed.
        </motion.p>

        {/* 🚪 Get Started Button */}
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 20px #3b82f6' }}
          whileTap={{ scale: 0.95 }}
          animate={{ y: [0, -2, 0], transition: { repeat: Infinity, duration: 2 } }}
          onClick={() => router.push('/login')}
          className="mt-4 bg-blue-600 hover:bg-blue-700 transition-all px-6 py-3 rounded-xl text-lg font-semibold shadow-[0_0_20px_#3b82f6]"
        >
          Get Started
        </motion.button>
      </div>

      {/* 🤖 Floating Robot Assistant */}
      <RobotAssistant />
    </main>
  );
}
