'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CleanOutput from '@/components/CleanOutput';
import { motion } from 'framer-motion';

export default function SmartConstructionOutputPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sections, setSections] = useState<any[]>([]);

  useEffect(() => {
    const data = searchParams.get('data');
    if (data) {
      try {
        const parsed = JSON.parse(decodeURIComponent(data));
        if (Array.isArray(parsed)) setSections(parsed);
      } catch (e) {
        console.error('Invalid JSON in query string');
      }
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0f172a] to-black text-white px-3 py-16 relative">
      {/* ✳️ Background grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,#38bdf820_1px,transparent_0)] [background-size:20px_20px] opacity-10 z-0" />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-purple-900/30 to-black z-0" />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* 🧩 Heading */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-cyan-400 mb-10 drop-shadow-[0_0_15px_#22d3ee] select-none">
          🧩 Smart Layout Output
        </h1>

        {sections.length === 0 ? (
          <p className="text-center text-gray-400 text-sm">No layout found. Please try again.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {sections.map((section, idx) => (
              <div
                key={idx}
                className="bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur shadow-[0_0_15px_#0ff3] transition hover:shadow-[0_0_25px_#22d3ee]"
              >
                <h2 className="text-lg sm:text-xl font-bold text-cyan-300 mb-2">{section.title}</h2>
                {section.note && <p className="mb-2 italic text-gray-300 text-sm">{section.note}</p>}
                <CleanOutput data={section.content} />
              </div>
            ))}
          </div>
        )}

        {/* 🔙 Back button */}
        <div className="text-center mt-12">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/dashboard/smart-construction-planner')}
            className="inline-block bg-gradient-to-r from-cyan-600 via-blue-700 to-indigo-700 px-6 py-3 rounded-full font-bold text-white text-sm sm:text-base shadow-[0_0_12px_#0a2e42]
              hover:shadow-[0_0_25px_#38bdf8aa] transition-all duration-300"
          >
            ← Back to Planner
          </motion.button>
        </div>
      </div>
    </div>
  );
}
