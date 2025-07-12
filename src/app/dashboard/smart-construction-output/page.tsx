'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CleanOutput from '@/components/CleanOutput'; // <-- Import changed component
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
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0f172a] to-black text-white px-4 py-20 relative">
      {/* ✳️ Background grid effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,#38bdf820_1px,transparent_0)] [background-size:20px_20px] opacity-10 z-0" />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-black z-0" />

      <div className="relative z-10 max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center text-cyan-400 mb-8 drop-shadow-[0_0_15px_#22d3ee]">
          🧩 Smart Layout Output
        </h1>

        {sections.length === 0 ? (
          <p className="text-center text-gray-400">No layout found. Please try again.</p>
        ) : (
          sections.map((section, idx) => (
            <div key={idx} className="mb-8">
              <h2 className="text-xl font-semibold text-cyan-400 mb-2">{section.title}</h2>
              {section.note && <p className="mb-2 italic text-gray-300">{section.note}</p>}
              <CleanOutput data={section.content} />
            </div>
          ))
        )}

        {/* 🔙 Back to Planner Button */}
        <div className="text-center mt-12">
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/dashboard/smart-construction-planner')}
            className="inline-block bg-gradient-to-r from-cyan-600 via-blue-700 to-indigo-700 px-6 py-3 rounded-full font-bold text-white text-lg shadow-[0_0_20px_#0a2e42]
              hover:shadow-[0_0_30px_#38bdf8aa] transition-all duration-300"
          >
            ← Back to Planner
          </motion.button>
        </div>
      </div>
    </div>
  );
}
