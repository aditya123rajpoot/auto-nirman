'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaRobot, FaChartLine, FaFileUpload, FaShieldAlt,
  FaBolt, FaCheckCircle, FaArrowRight, FaArrowLeft, FaTimes, FaCalculator, FaMap
} from 'react-icons/fa';

const steps = [
  {
    id: 1,
    icon: FaBolt,
    color: 'from-cyan-500 to-blue-500',
    glow: '#06b6d4',
    badge: 'Welcome',
    title: 'India\'s Most Advanced\nConstruction Intelligence',
    desc: 'Auto Nirman uses AI to detect cost leakage in your BOQ before construction begins. Even a 1% error on a ₹100Cr project costs ₹1 Crore — we eliminate that.',
    visual: (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <motion.div
          animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-8xl"
        >
          🏗️
        </motion.div>
        <div className="flex gap-3">
          {['₹50Cr', '₹100Cr', '₹500Cr'].map((v, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 + 0.5 }}
              className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-center"
            >
              <p className="text-cyan-400 font-bold text-sm">{v}</p>
              <p className="text-slate-400 text-xs">Projects</p>
            </motion.div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 2,
    icon: FaFileUpload,
    color: 'from-blue-500 to-indigo-500',
    glow: '#3b82f6',
    badge: 'Step 1',
    title: 'Upload Your BOQ\nin Seconds',
    desc: 'Simply drag and drop your Bill of Quantities — Excel or PDF. Auto Nirman parses every line item automatically, no matter how messy the format.',
    visual: (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <motion.div
          animate={{ y: [-8, 8, -8] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-48 h-32 border border-blue-400/30 rounded-2xl flex flex-col items-center justify-center bg-blue-500/5"
        >
          <FaFileUpload className="text-blue-400 text-3xl mb-2" />
          <p className="text-slate-300 text-xs font-semibold">BOQ file upload</p>
          <p className="text-slate-600 text-xs">shown inside dashboard</p>
        </motion.div>
        <div className="flex gap-2">
          {['Excel', 'PDF', 'CSV'].map((fmt, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.15 + 0.3 }}
              className="bg-blue-500/20 border border-blue-400/30 rounded-full px-3 py-1 text-blue-300 text-xs font-semibold"
            >
              {fmt}
            </motion.span>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 3,
    icon: FaRobot,
    color: 'from-purple-500 to-pink-500',
    glow: '#a855f7',
    badge: 'Step 2',
    title: 'AI Detects Every\nCost Anomaly',
    desc: 'Our engine compares each line item against CPWD DSR benchmarks, flags rate deviations above 25%, catches duplicate items, and identifies missing work — all in under 60 seconds.',
    visual: (
      <div className="flex flex-col items-center justify-center h-full gap-3 w-full max-w-xs">
        {[
          { item: 'Cement (OPC 53)', status: 'ok', msg: 'Rate within benchmark' },
          { item: 'Steel TMT 500D', status: 'flag', msg: '↑ 38% above benchmark' },
          { item: 'River Sand (Fine)', status: 'flag', msg: 'Duplicate line detected' },
          { item: 'Brickwork (Modular)', status: 'ok', msg: 'Rate within benchmark' },
        ].map((row, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.2 + 0.3 }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs ${
              row.status === 'flag'
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-green-500/10 border-green-500/20'
            }`}
          >
            <span className="text-slate-300 font-medium truncate max-w-[120px]">{row.item}</span>
            <span className={row.status === 'flag' ? 'text-red-400' : 'text-green-400'}>
              {row.msg}
            </span>
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    id: 4,
    icon: FaChartLine,
    color: 'from-emerald-500 to-cyan-500',
    glow: '#10b981',
    badge: 'Step 3',
    title: 'Get Your Leakage\nReport Instantly',
    desc: 'Download a branded PDF report showing exact leakage amounts, risk severity, and actionable recommendations. Your CFO can take this directly to the board.',
    visual: (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <motion.div
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="bg-white/5 border border-white/10 rounded-2xl p-4 w-48"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-semibold">Leakage Report</span>
            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">High Risk</span>
          </div>
          {[
            { label: 'Total BOQ Value', value: '₹4.2 Cr' },
            { label: 'Detected Leakage', value: '₹38.4L', highlight: true },
            { label: 'Items Flagged', value: '12' },
          ].map((row, i) => (
            <div key={i} className="flex justify-between py-1.5 border-b border-white/5 last:border-0">
              <span className="text-slate-500 text-xs">{row.label}</span>
              <span className={`text-xs font-bold ${row.highlight ? 'text-red-400' : 'text-white'}`}>
                {row.value}
              </span>
            </div>
          ))}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mt-3 w-full py-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg text-center text-xs font-bold text-white"
          >
            Download PDF
          </motion.div>
        </motion.div>
      </div>
    ),
  },
  {
    id: 5,
    icon: FaRobot,
    color: 'from-violet-500 to-cyan-500',
    glow: '#8b5cf6',
    badge: 'AI Assistant',
    title: 'Ask Your Construction\nQuestions Instantly',
    desc: 'Use the AI Chatbot to ask about BOQ risks, contractor rates, planning decisions, vendor comparison, cost leakage, and practical next steps without digging through documents manually.',
    visual: (
      <div className="flex flex-col items-center justify-center h-full gap-3 w-full max-w-xs">
        <motion.div
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="w-full rounded-2xl border border-violet-400/25 bg-violet-500/10 p-4"
        >
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-400/15 text-violet-200">
              <FaRobot />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Auto Nirman AI</p>
              <p className="text-[10px] text-violet-200/70">Construction advisor</p>
            </div>
          </div>
          {[
            { role: 'You', text: 'Why is steel rate high?' },
            { role: 'AI', text: 'Flagged: 18% above benchmark.' },
            { role: 'AI', text: 'Ask vendor for rate justification.' },
          ].map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.18 + 0.25 }}
              className={`mb-2 rounded-xl px-3 py-2 text-xs ${
                msg.role === 'You'
                  ? 'ml-8 bg-white/10 text-slate-200'
                  : 'mr-6 bg-cyan-400/10 text-cyan-100 border border-cyan-300/15'
              }`}
            >
              <span className="font-semibold">{msg.role}: </span>{msg.text}
            </motion.div>
          ))}
        </motion.div>
      </div>
    ),
  },
  {
    id: 6,
    icon: FaCalculator,
    color: 'from-emerald-500 to-cyan-500',
    glow: '#10b981',
    badge: 'Cost Estimator',
    title: 'Estimate Project Cost\nBefore Site Decisions',
    desc: 'Enter plot area, built-up area, city tier, quality level, floors, and add-ons. Auto Nirman creates a construction estimate with low-high range, cost per sq ft, timeline, and trade-wise cost split.',
    visual: (
      <div className="flex flex-col items-center justify-center h-full gap-3 w-full max-w-xs">
        <motion.div
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 2.4, repeat: Infinity }}
          className="w-full rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-4"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-semibold text-slate-300">Estimate</span>
            <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-bold text-emerald-200">Ready</span>
          </div>
          <p className="mt-4 text-3xl font-black text-white">Rs 28.4L</p>
          <p className="mt-1 text-xs text-slate-400">Rs 3,155 / sq ft</p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[
              { label: 'Low', value: '25.2L' },
              { label: 'Time', value: '6 mo' },
              { label: 'High', value: '31.6L' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 + 0.3 }}
                className="rounded-xl border border-white/10 bg-white/5 px-2 py-2"
              >
                <p className="text-xs font-bold text-white">{item.value}</p>
                <p className="mt-1 text-[10px] text-slate-500">{item.label}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '72%' }}
              transition={{ duration: 0.9, delay: 0.35 }}
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
            />
          </div>
        </motion.div>
      </div>
    ),
  },
  {
    id: 7,
    icon: FaMap,
    color: 'from-orange-500 to-cyan-500',
    glow: '#fb923c',
    badge: '2D Map Generator',
    title: 'Generate Clean\n2D Floor Maps',
    desc: 'Enter plot size, road side, rooms, bathrooms, planning style, and Vastu preference. Auto Nirman creates a futuristic JPEG-ready 2D map with room labels, dimensions, boundaries, and AI design checks.',
    visual: (
      <div className="flex flex-col items-center justify-center h-full gap-3 w-full max-w-xs">
        <motion.div
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 2.6, repeat: Infinity }}
          className="w-full rounded-2xl border border-orange-400/25 bg-orange-500/10 p-4"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-semibold text-slate-300">2D Map Output</span>
            <span className="rounded-full bg-cyan-400/15 px-2 py-0.5 text-[10px] font-bold text-cyan-200">JPEG</span>
          </div>
          <div className="mt-4 rounded-xl border-2 border-cyan-300/70 bg-cyan-300/5 p-2">
            <div className="grid grid-cols-3 gap-1">
              {[
                'Living',
                'Kitchen',
                'Bed 1',
                'Bed 2',
                'Bath',
                'Stair',
              ].map((room, i) => (
                <motion.div
                  key={room}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.08 + 0.25 }}
                  className={`min-h-12 rounded border px-1 py-2 text-center text-[10px] font-bold ${
                    i % 3 === 0
                      ? 'border-cyan-300/50 bg-cyan-300/10 text-cyan-100'
                      : i % 3 === 1
                        ? 'border-orange-300/50 bg-orange-300/10 text-orange-100'
                        : 'border-violet-300/50 bg-violet-300/10 text-violet-100'
                  }`}
                >
                  {room}
                </motion.div>
              ))}
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-[10px] text-slate-400">
            <span>Boundary checked</span>
            <span>AI score 91%</span>
          </div>
        </motion.div>
      </div>
    ),
  },
  {
    id: 8,
    icon: FaShieldAlt,
    color: 'from-amber-500 to-orange-500',
    glow: '#f59e0b',
    badge: 'You\'re ready',
    title: 'Your Dashboard\nAwaits',
    desc: 'Everything is set up. Head to your dashboard to upload your first BOQ, explore features, or watch a quick demo. Welcome to the future of construction intelligence.',
    visual: (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-400/30 flex items-center justify-center"
        >
          <FaCheckCircle className="text-amber-400 text-4xl" />
        </motion.div>
        <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
          {[
            'BOQ Analysis ready',
            'AI Chatbot active',
            'Cost Estimator live',
            '2D Map Generator live',
            'Reports enabled',
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 + 0.3 }}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300"
            >
              <FaCheckCircle className="mr-2 inline text-emerald-300" size={11} />
              {item}
            </motion.div>
          ))}
        </div>
      </div>
    ),
  },
];

export default function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const goNext = () => {
    if (isLast) {
      localStorage.setItem('autonirman_onboarded', 'true');
      onComplete();
      return;
    }
    setDirection(1);
    setCurrentStep(s => s + 1);
  };

  const goPrev = () => {
    setDirection(-1);
    setCurrentStep(s => s - 1);
  };

  const skip = () => {
    localStorage.setItem('autonirman_onboarded', 'true');
    onComplete();
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md px-4"
    >
      {/* Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full max-w-3xl bg-[#080f1f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
        style={{ boxShadow: `0 0 80px ${step.glow}22` }}
      >
        {/* Glow top bar */}
        <div className={`h-1 w-full bg-gradient-to-r ${step.color} transition-all duration-500`} />

        {/* Skip button */}
        <button
          onClick={skip}
          className="absolute top-4 right-4 text-slate-600 hover:text-slate-300 transition-colors z-10 p-2"
        >
          <FaTimes size={14} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[480px]">

          {/* Left — Visual */}
          <div className="relative flex items-center justify-center p-8 border-b md:border-b-0 md:border-r border-white/5 bg-white/2 min-h-[220px] md:min-h-0">
            {/* Background glow */}
            <div
              className="absolute inset-0 opacity-10 transition-all duration-500"
              style={{ background: `radial-gradient(ellipse at center, ${step.glow}, transparent 70%)` }}
            />
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="relative z-10 w-full h-full flex items-center justify-center"
              >
                {step.visual}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right — Content */}
          <div className="flex flex-col justify-between p-8">

            <div>
              {/* Badge */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`badge-${currentStep}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`inline-flex items-center gap-2 bg-gradient-to-r ${step.color} bg-clip-text mb-4`}
                >
                  <step.icon size={12} style={{ color: step.glow }} />
                  <span className="text-xs font-bold tracking-widest uppercase" style={{ color: step.glow }}>
                    {step.badge}
                  </span>
                </motion.div>
              </AnimatePresence>

              {/* Title */}
              <AnimatePresence mode="wait" custom={direction}>
                <motion.h2
                  key={`title-${currentStep}`}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35 }}
                  className="text-2xl font-black text-white leading-tight mb-4 whitespace-pre-line"
                >
                  {step.title}
                </motion.h2>
              </AnimatePresence>

              {/* Description */}
              <AnimatePresence mode="wait" custom={direction}>
                <motion.p
                  key={`desc-${currentStep}`}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, delay: 0.05 }}
                  className="text-slate-400 text-sm leading-relaxed"
                >
                  {step.desc}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="mt-8">
              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-slate-600">{currentStep + 1} of {steps.length}</span>
                  <span className="text-xs text-slate-600">{Math.round(progress)}% complete</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${step.color} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>

                {/* Step dots */}
                <div className="flex gap-2 mt-3">
                  {steps.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setDirection(i > currentStep ? 1 : -1); setCurrentStep(i); }}
                      className={`transition-all duration-300 rounded-full ${
                        i === currentStep ? 'w-6 h-2' : 'w-2 h-2'
                      }`}
                      style={{
                        background: i <= currentStep ? step.glow : 'rgba(255,255,255,0.1)',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                {currentStep > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={goPrev}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white text-sm font-semibold transition-all hover:border-white/20"
                  >
                    <FaArrowLeft size={12} /> Back
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={goNext}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all bg-gradient-to-r ${step.color} hover:opacity-90`}
                  style={{ boxShadow: `0 0 20px ${step.glow}44` }}
                >
                  {isLast ? (
                    <>Go to Dashboard <FaBolt size={12} /></>
                  ) : (
                    <>Next <FaArrowRight size={12} /></>
                  )}
                </motion.button>
              </div>

            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}



