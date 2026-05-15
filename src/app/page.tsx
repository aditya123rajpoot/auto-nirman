'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FaArrowRight,
  FaBolt,
  FaBuilding,
  FaCalculator,
  FaCheckCircle,
  FaFileInvoiceDollar,
  FaMap,
  FaRobot,
} from 'react-icons/fa';
import RobotAssistant from '@/components/RobotAssistant';
import OnboardingWizard from '@/components/OnboardingWizard';

const proof = [
  { value: '15-20%', label: 'cost clarity' },
  { value: '95%', label: 'BOQ accuracy' },
  { value: '10x', label: 'faster review' },
];

const tools = [
  { icon: FaBuilding, title: 'BOQ leakage', text: 'Understand where project cost can quietly increase.', tone: 'from-cyan-300 to-blue-500' },
  { icon: FaCalculator, title: 'Budget clarity', text: 'Estimate the cost envelope before contractor discussions.', tone: 'from-emerald-300 to-teal-400' },
  { icon: FaMap, title: 'Planning output', text: 'Turn plot information into a client-ready visual direction.', tone: 'from-orange-300 to-cyan-400' },
  { icon: FaRobot, title: 'AI guidance', text: 'Get simple answers when construction decisions feel unclear.', tone: 'from-violet-300 to-fuchsia-400' },
];

const steps = [
  { icon: FaFileInvoiceDollar, title: 'Enter project details', text: 'Upload BOQ, add area, or give plot inputs.' },
  { icon: FaBolt, title: 'Get an intelligent check', text: 'Auto Nirman finds cost gaps, budget risk, and planning issues.' },
  { icon: FaCheckCircle, title: 'Use the output', text: 'Download a report, estimate, or map for the next meeting.' },
];

const liveModules = [
  { key: 'BOQ', title: 'Cost leakage scan', value: 'Rs 1.8Cr', note: '3 items need review', tone: 'text-cyan-100', bar: 'w-[78%]' },
  { key: 'Cost', title: 'Budget confidence', value: '94%', note: 'Tier-2 pricing matched', tone: 'text-emerald-100', bar: 'w-[94%]' },
  { key: 'Map', title: 'Plan readiness', value: 'JPEG ready', note: 'Rooms clipped to boundary', tone: 'text-orange-100', bar: 'w-[88%]' },
  { key: 'AI', title: 'Assistant status', value: 'Online', note: 'Construction context loaded', tone: 'text-violet-100', bar: 'w-[82%]' },
];

export default function Home() {
  const router = useRouter();
  const [showTour, setShowTour] = useState(false);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#04070d] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#04070d,#071525_48%,#020304)]" />
        <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(rgba(125,211,252,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.7)_1px,transparent_1px)] [background-size:46px_46px]" />
        <div className="absolute left-[-220px] top-[-140px] h-[560px] w-[560px] rounded-full border border-cyan-200/10" />
        <div className="absolute right-[-220px] top-24 h-[640px] w-[640px] rounded-full border border-orange-200/10" />
      </div>

      <DesktopHome push={router.push} openTour={() => setShowTour(true)} />
      <MobileHome push={router.push} openTour={() => setShowTour(true)} />

      <div className="hidden md:block">
        <RobotAssistant />
      </div>

      <AnimatePresence>
        {showTour && <OnboardingWizard onComplete={() => setShowTour(false)} />}
      </AnimatePresence>
    </main>
  );
}

function DesktopHome({ push, openTour }: { push: (href: string) => void; openTour: () => void }) {
  return (
    <div className="relative z-10 hidden md:block">
      <section className="mx-auto grid min-h-screen max-w-7xl grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)] items-center gap-8 px-6 pb-16 pt-24 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="command-header-card living-surface rounded-lg p-7"
        >
          <div className="relative z-10">
          <div className="inline-flex items-center gap-3 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-cyan-100">
            <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.75)]" />
            Built for Indian construction teams
          </div>

          <h1 className="mt-7 max-w-4xl text-6xl font-black leading-[0.96] tracking-normal text-white lg:text-7xl">
            Build smarter. Spend cleaner.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            Auto Nirman turns BOQs, project details, and plot inputs into clear construction decisions: cost reports, budget estimates, AI answers, and client-ready 2D plans.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={openTour}
              className="group inline-flex items-center gap-3 rounded-lg bg-cyan-300 px-6 py-4 text-sm font-black uppercase tracking-[0.11em] text-slate-950 shadow-[0_0_34px_rgba(34,211,238,0.28)] transition hover:-translate-y-1 hover:bg-cyan-200"
            >
              What Auto Nirman does <FaArrowRight className="transition group-hover:translate-x-1" />
            </button>
            <button
              type="button"
              onClick={() => push('/login')}
              className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-5 py-4 text-sm font-bold text-cyan-100 transition hover:-translate-y-1 hover:border-cyan-300/45 hover:bg-cyan-300/15"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => push('/signup')}
              className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 px-5 py-4 text-sm font-bold text-emerald-100 transition hover:-translate-y-1 hover:border-emerald-300/45 hover:bg-emerald-300/15"
            >
              Sign up
            </button>
            <button
              type="button"
              onClick={() => push('/dashboard')}
              className="rounded-lg border border-white/15 bg-white/[0.04] px-6 py-4 text-sm font-bold text-white transition hover:-translate-y-1 hover:border-orange-300/45 hover:bg-orange-300/10"
            >
              Preview workspace
            </button>
          </div>

          <div className="mt-9 grid max-w-2xl grid-cols-3 gap-3">
            {proof.map(item => (
              <div key={item.label} className="rounded-lg border border-white/10 bg-slate-950/80 px-4 py-4 transition-all hover:-translate-y-1 hover:border-cyan-300/30">
                <p className="text-3xl font-black text-white">{item.value}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{item.label}</p>
              </div>
            ))}
          </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 26 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.75, delay: 0.08 }}>
          <ProductVisual />
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="mb-7 max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">What Auto Nirman does</p>
          <h2 className="mt-2 text-4xl font-black tracking-normal text-white">It prepares you before money starts moving.</h2>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {tools.map(tool => (
            <div
              key={tool.title}
              className="living-surface signal-sweep group rounded-lg border border-white/10 bg-slate-950 p-5 text-left shadow-[0_18px_60px_rgba(0,0,0,0.28)] transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/35 hover:bg-[#071120]"
            >
              <div className={`h-1.5 w-16 rounded-full bg-gradient-to-r ${tool.tone}`} />
              <tool.icon className="mt-6 text-cyan-100 transition-transform duration-300 group-hover:scale-110" size={24} />
              <h2 className="mt-6 text-xl font-black text-white">{tool.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">{tool.text}</p>
              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className={`h-full rounded-full bg-gradient-to-r ${tool.tone} transition-all duration-500 group-hover:w-full ${tool.title === 'BOQ leakage' ? 'w-[74%]' : tool.title === 'Budget clarity' ? 'w-[92%]' : tool.title === 'Planning output' ? 'w-[86%]' : 'w-[80%]'}`} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Workflow</p>
          <h2 className="mt-2 text-5xl font-black tracking-normal text-white">Simple enough for daily use.</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {steps.map((step, index) => (
            <div key={step.title} className="rounded-lg border border-white/10 bg-white/[0.035] p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-cyan-200/20 bg-cyan-300/10 text-cyan-100">
                  <step.icon />
                </div>
                <span className="text-xs font-black text-cyan-100">0{index + 1}</span>
              </div>
              <h3 className="mt-6 text-xl font-black text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10 px-8 py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-sm text-slate-500">
          <span>Auto Nirman</span>
          <span>BOQ. Cost. Map. AI.</span>
        </div>
      </footer>
    </div>
  );
}

function MobileHome({ push, openTour }: { push: (href: string) => void; openTour: () => void }) {
  return (
    <div className="relative z-10 mx-auto max-w-md px-4 pb-10 pt-20 md:hidden">
      <section className="rounded-lg border border-white/10 bg-slate-950 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-100">
            Live workspace
          </div>
          <Image src="/logo.png" alt="Auto Nirman" width={38} height={38} className="rounded-lg" priority />
        </div>

        <h1 className="mt-6 text-4xl font-black leading-[1.02] tracking-normal text-white">
          Build smarter. Spend cleaner.
        </h1>
        <p className="mt-4 text-sm leading-6 text-slate-400">
          BOQ checks, cost estimates, floor maps, and AI help in one place.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => push('/login')} className="rounded-lg bg-cyan-300 px-4 py-3 text-sm font-black text-slate-950">
            Login
          </button>
          <button type="button" onClick={() => push('/signup')} className="rounded-lg border border-emerald-300/25 bg-emerald-300/10 px-4 py-3 text-sm font-bold text-emerald-100">
            Sign up
          </button>
          <button type="button" onClick={() => push('/dashboard')} className="col-span-2 rounded-lg border border-white/15 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white">
            Preview
          </button>
        </div>

        <button
          type="button"
          onClick={openTour}
          className="mt-3 w-full rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-xs font-black text-cyan-100"
        >
          What Auto Nirman does
        </button>
      </section>

      <section className="mt-3 grid grid-cols-3 gap-2">
        {proof.map(item => (
          <div key={item.label} className="rounded-lg border border-white/10 bg-slate-950 p-3 text-center">
            <p className="text-xl font-black text-white">{item.value}</p>
            <p className="mt-1 text-[10px] leading-4 text-slate-500">{item.label}</p>
          </div>
        ))}
      </section>

      <section className="mt-4 grid grid-cols-2 gap-2">
        {tools.map(tool => (
          <div key={tool.title} className="min-h-28 rounded-lg border border-white/10 bg-slate-950 p-3 text-left">
            <div className={`mb-3 h-1 w-12 rounded-full bg-gradient-to-r ${tool.tone}`} />
            <tool.icon className="text-cyan-100" size={17} />
            <p className="mt-2 text-xs font-black leading-4 text-white">{tool.title}</p>
            <p className="mt-1 text-[10px] leading-4 text-slate-500">{tool.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

function ProductVisual() {
  const [activeModule, setActiveModule] = useState(liveModules[0]);

  return (
    <div className="living-surface relative overflow-hidden rounded-lg border border-white/10 bg-slate-950 p-5 shadow-[0_34px_130px_rgba(0,0,0,0.66)]">
      <div className="absolute inset-0 live-grid opacity-40" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.12),transparent_34%,rgba(251,146,60,0.08))]" />
      <div className="relative z-10">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Auto Nirman" width={40} height={40} className="rounded-lg" priority />
            <div>
              <p className="text-sm font-black uppercase tracking-[0.16em] text-white">Before construction</p>
              <p className="text-xs text-slate-500">Onboarding intelligence preview</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-xs font-bold text-emerald-100">
            <span className="pulse-dot h-2 w-2 rounded-full bg-emerald-300" /> Live
          </span>
        </div>

        <div className="mt-5 grid grid-cols-[1.1fr_0.9fr] gap-4">
          <motion.div layout className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{activeModule.title}</p>
            <p className={`mt-4 text-5xl font-black ${activeModule.tone}`}>{activeModule.value}</p>
            <p className="mt-2 text-sm font-semibold text-slate-400">{activeModule.note}</p>
            <div className="mt-5 h-2 rounded-full bg-white/10">
              <motion.div layout className={`h-full rounded-full bg-cyan-300 ${activeModule.bar}`} />
            </div>
            <div className="mt-6 space-y-3">
              {['Steel rate above benchmark', 'Duplicate finishing item', 'Missing waterproofing scope'].map((item, index) => (
                <div key={item} className="group flex items-center justify-between rounded-lg border border-white/10 bg-slate-950 px-4 py-3 transition-all hover:border-cyan-300/30 hover:bg-cyan-300/10">
                  <span className="text-sm text-slate-300">{item}</span>
                  <span className={`${index === 0 ? 'text-orange-200' : index === 1 ? 'text-cyan-200' : 'text-emerald-200'} transition-transform group-hover:translate-x-1`}>Check</span>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="space-y-4">
            <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
              <p className="text-xs text-slate-500">Budget confidence</p>
              <p className="mt-2 text-3xl font-black text-white">94%</p>
              <div className="mt-4 h-2 rounded-full bg-white/10">
                <div className="h-full w-[94%] rounded-full bg-cyan-300" />
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
              <p className="text-xs text-slate-500">Plan output</p>
              <p className="mt-2 text-xl font-black text-white">JPEG map ready</p>
              <div className="mt-4 grid grid-cols-3 gap-1">
                {[1, 2, 3, 4, 5, 6].map(item => (
                  <div key={item} className="h-9 rounded border border-cyan-200/20 bg-cyan-300/10" />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-3">
          {liveModules.map(item => (
            <button
              key={item.key}
              type="button"
              onMouseEnter={() => setActiveModule(item)}
              onFocus={() => setActiveModule(item)}
              className={`rounded-lg border p-3 text-center text-xs font-bold transition-all ${activeModule.key === item.key ? 'border-cyan-300/50 bg-cyan-300/12 text-cyan-50 shadow-[0_0_22px_rgba(34,211,238,0.16)]' : 'border-white/10 bg-slate-950 text-slate-300 hover:border-cyan-300/30 hover:text-white'}`}
            >
              {item.key}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
