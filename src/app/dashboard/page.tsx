'use client';

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaRobot, FaMap, FaGavel, FaBuilding,
  FaHome, FaProjectDiagram, FaUser, FaBolt,
} from 'react-icons/fa';
import { useState, useEffect } from 'react';
import OnboardingWizard from '@/components/OnboardingWizard';

const features = [
  { icon: FaRobot,          title: 'AI Chatbot',                  route: '/chatbot',                             ready: true  },
  { icon: FaMap,            title: '2D Map Generator',            route: '/map2d',                               ready: false },
  { icon: FaProjectDiagram, title: '3D Map Generator',            route: '/map3d',                               ready: false },
  { icon: FaGavel,          title: 'Legal Verification',          route: '/legal',                               ready: false },
  { icon: FaHome,           title: 'Sale/Buy Property',           route: '/property',                            ready: false },
  { icon: FaBuilding,       title: 'Smart Construction Planner',  route: '/dashboard/smart-construction-planner', ready: false },
  { icon: FaBuilding,       title: 'BOQ Analysis',                route: '/dashboard/boq-upload',                ready: true  },
  { icon: FaUser,           title: 'User',                        route: '/user',                                ready: true  },
];

export default function Dashboard() {
  const router = useRouter();
  const [comingSoon, setComingSoon] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const onboarded = localStorage.getItem('autonirman_onboarded');
    if (!onboarded) {
      setShowOnboarding(true);
    }
  }, []);

  const handleNavigation = (feature: typeof features[0]) => {
    if (!feature.ready) {
      setComingSoon(feature.title);
      return;
    }
    router.push(feature.route);
  };

  return (
    <div className="relative min-h-screen pt-20 px-4 bg-black text-white font-sans overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_1px_1px,_#38bdf811_1px,_transparent_0)] [background-size:20px_20px] opacity-10 animate-pulse" />
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-black" />

      {/* Heading + Replay button */}
      <div className="relative z-10 flex items-center justify-center gap-4 mb-10">
        <h2 className="text-3xl font-bold text-center drop-shadow-[0_0_15px_#38bdf8] animate-fade-in">
          Dashboard Features
        </h2>
        <button
          onClick={() => setShowOnboarding(true)}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-cyan-400 border border-white/10 hover:border-cyan-400/30 rounded-full px-3 py-1.5 transition-all"
        >
          <FaBolt size={10} /> Tour
        </button>
      </div>

      {/* Feature Cards */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-8">
        {features.map((feature, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95, opacity: 0.8 }}
            onClick={() => handleNavigation(feature)}
            className="cursor-pointer bg-white/5 backdrop-blur-lg border border-white/10 hover:border-blue-400 hover:shadow-[0_0_15px_#38bdf8aa] transition-all rounded-xl p-4 sm:p-5 flex flex-col items-center text-center animate-fade-in"
          >
            <feature.icon className="text-4xl mb-3 text-blue-400 drop-shadow-md" />
            <h3 className="text-xl font-semibold">{feature.title}</h3>
            {!feature.ready && (
              <span className="mt-2 text-xs text-blue-300 border border-blue-400/30 rounded-full px-2 py-0.5">
                Coming soon
              </span>
            )}
          </motion.div>
        ))}
      </div>

      {/* Coming Soon Modal */}
      <AnimatePresence>
        {comingSoon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setComingSoon(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0f172a] border border-white/10 rounded-2xl p-8 max-w-sm w-full text-center shadow-[0_0_40px_#38bdf822]"
            >
              <div className="text-5xl mb-4">ðŸš§</div>
              <h2 className="text-xl font-semibold mb-2">{comingSoon}</h2>
              <p className="text-slate-400 text-sm mb-6">
                This feature is under development and will be available soon.
              </p>
              <button
                onClick={() => setComingSoon(null)}
                className="bg-blue-400 text-black font-semibold rounded-lg px-6 py-2.5 text-sm hover:bg-blue-300 transition-colors"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Onboarding Wizard */}
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingWizard onComplete={() => setShowOnboarding(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}