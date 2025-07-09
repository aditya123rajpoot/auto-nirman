'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FaRobot,
  FaMap,
  FaGavel,
  FaBuilding,
  FaHome,
  FaProjectDiagram,
  FaUser,
} from 'react-icons/fa';

const features = [
  { icon: FaRobot, title: 'AI Chatbot', route: '/chatbot' },
  { icon: FaMap, title: '2D Map Generator', route: '/map2d' },
  { icon: FaProjectDiagram, title: '3D Map Generator', route: '/map3d' },
  { icon: FaGavel, title: 'Legal Verification', route: '/legal' },
  { icon: FaHome, title: 'Sale/Buy Property', route: '/property' },
  { icon: FaBuilding, title: 'Smart Construction Planner', route: '/planner' },
  { icon: FaUser, title: 'User', route: '/user' }, // 👈 New User Feature
];

export default function Dashboard() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen pt-20 px-4 bg-black text-white font-sans overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_1px_1px,_#38bdf811_1px,_transparent_0)] [background-size:20px_20px] opacity-10 animate-pulse" />
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-black" />

      {/* Heading */}
      <h2 className="relative z-10 text-3xl font-bold mb-10 text-center drop-shadow-[0_0_15px_#38bdf8] animate-fade-in">
        Dashboard Features
      </h2>

      {/* Cards */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-8">
        {features.map((feature, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.05 }}
            onClick={() => router.push(feature.route)}
            className="cursor-pointer bg-white/5 backdrop-blur-lg border border-white/10 hover:border-blue-400 hover:shadow-[0_0_15px_#38bdf8aa] transition-all rounded-xl p-4 sm:p-5 flex flex-col items-center text-center animate-fade-in"
          >
            <feature.icon className="text-4xl mb-3 text-blue-400 drop-shadow-md" />
            <h3 className="text-xl font-semibold">{feature.title}</h3>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
