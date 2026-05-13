'use client';

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaRobot,
  FaMap,
  FaGavel,
  FaBuilding,
  FaHome,
  FaProjectDiagram,
  FaUser,
  FaBolt,
  FaCalculator,
  FaArrowRight,
  FaChartLine,
  FaCheckCircle,
  FaLock,
} from 'react-icons/fa';
import { useState, useEffect } from 'react';
import OnboardingWizard from '@/components/OnboardingWizard';

type DashboardFeature = {
  icon: typeof FaRobot;
  title: string;
  route: string;
  ready: boolean;
  description: string;
  signal: string;
  accent: string;
  hoverBorder: string;
  hoverShadow: string;
  iconTone: string;
  iconGlow: string;
  actionTone: string;
  featured?: boolean;
};

const features: DashboardFeature[] = [
  {
    icon: FaBuilding,
    title: 'BOQ Analysis',
    route: '/dashboard/boq-upload',
    ready: true,
    description: 'Audit uploaded BOQs, expose rate padding, and generate leakage reports.',
    signal: 'Live',
    accent: 'from-cyan-300 to-blue-500',
    hoverBorder: 'hover:border-cyan-300/50',
    hoverShadow: 'hover:shadow-[0_0_42px_rgba(34,211,238,0.18)]',
    iconTone: 'text-cyan-100',
    iconGlow: 'shadow-[0_0_24px_rgba(34,211,238,0.16)]',
    actionTone: 'text-cyan-100',
    featured: true,
  },
  {
    icon: FaCalculator,
    title: 'Cost Estimator',
    route: '/dashboard/cost-estimator',
    ready: true,
    description: 'Create city-aware construction estimates with cost bands and trade splits.',
    signal: 'Live',
    accent: 'from-emerald-300 to-cyan-400',
    hoverBorder: 'hover:border-emerald-300/50',
    hoverShadow: 'hover:shadow-[0_0_42px_rgba(52,211,153,0.16)]',
    iconTone: 'text-emerald-100',
    iconGlow: 'shadow-[0_0_24px_rgba(52,211,153,0.15)]',
    actionTone: 'text-emerald-100',
    featured: true,
  },
  {
    icon: FaRobot,
    title: 'AI Chatbot',
    route: '/chatbot',
    ready: true,
    description: 'Ask construction, BOQ, pricing, planning, and vendor-risk questions.',
    signal: 'Live',
    accent: 'from-violet-300 to-cyan-400',
    hoverBorder: 'hover:border-violet-300/50',
    hoverShadow: 'hover:shadow-[0_0_36px_rgba(167,139,250,0.16)]',
    iconTone: 'text-violet-100',
    iconGlow: 'shadow-[0_0_20px_rgba(167,139,250,0.13)]',
    actionTone: 'text-violet-100',
  },
  {
    icon: FaUser,
    title: 'User',
    route: '/user',
    ready: true,
    description: 'Manage account details, plan access, and project workspace settings.',
    signal: 'Live',
    accent: 'from-slate-200 to-slate-500',
    hoverBorder: 'hover:border-slate-300/45',
    hoverShadow: 'hover:shadow-[0_0_34px_rgba(203,213,225,0.11)]',
    iconTone: 'text-slate-100',
    iconGlow: 'shadow-[0_0_20px_rgba(203,213,225,0.10)]',
    actionTone: 'text-slate-100',
  },
  {
    icon: FaBuilding,
    title: 'Smart Construction Planner',
    route: '/dashboard/smart-construction-planner',
    ready: false,
    description: 'Plan phases, dependencies, timeline risk, and site execution priorities.',
    signal: 'Queued',
    accent: 'from-amber-300 to-orange-500',
    hoverBorder: 'hover:border-amber-300/55',
    hoverShadow: 'hover:shadow-[0_0_38px_rgba(251,191,36,0.16)]',
    iconTone: 'text-amber-100',
    iconGlow: 'shadow-[0_0_20px_rgba(251,191,36,0.13)]',
    actionTone: 'text-amber-100',
  },
  {
    icon: FaMap,
    title: '2D Map Generator',
    route: '/dashboard/2d-map-generator',
    ready: true,
    description: 'Generate futuristic JPEG floor maps with deterministic room geometry and AI checks.',
    signal: 'Live',
    accent: 'from-teal-300 to-emerald-500',
    hoverBorder: 'hover:border-teal-300/50',
    hoverShadow: 'hover:shadow-[0_0_36px_rgba(45,212,191,0.15)]',
    iconTone: 'text-teal-100',
    iconGlow: 'shadow-[0_0_20px_rgba(45,212,191,0.13)]',
    actionTone: 'text-teal-100',
  },
  {
    icon: FaProjectDiagram,
    title: '3D Map Generator',
    route: '/map3d',
    ready: false,
    description: 'Preview massing and spatial options from approved layout geometry.',
    signal: 'Concept',
    accent: 'from-blue-300 to-indigo-500',
    hoverBorder: 'hover:border-indigo-300/50',
    hoverShadow: 'hover:shadow-[0_0_36px_rgba(129,140,248,0.15)]',
    iconTone: 'text-indigo-100',
    iconGlow: 'shadow-[0_0_20px_rgba(129,140,248,0.13)]',
    actionTone: 'text-indigo-100',
  },
  {
    icon: FaGavel,
    title: 'Legal Verification',
    route: '/legal',
    ready: false,
    description: 'Review title, ownership, approvals, and transaction risk signals.',
    signal: 'Concept',
    accent: 'from-rose-300 to-red-500',
    hoverBorder: 'hover:border-rose-300/50',
    hoverShadow: 'hover:shadow-[0_0_36px_rgba(251,113,133,0.14)]',
    iconTone: 'text-rose-100',
    iconGlow: 'shadow-[0_0_20px_rgba(251,113,133,0.12)]',
    actionTone: 'text-rose-100',
  },
  {
    icon: FaHome,
    title: 'Sale/Buy Property',
    route: '/property',
    ready: false,
    description: 'Evaluate property opportunities with location, cost, and risk context.',
    signal: 'Concept',
    accent: 'from-lime-300 to-emerald-500',
    hoverBorder: 'hover:border-lime-300/50',
    hoverShadow: 'hover:shadow-[0_0_36px_rgba(190,242,100,0.13)]',
    iconTone: 'text-lime-100',
    iconGlow: 'shadow-[0_0_20px_rgba(190,242,100,0.11)]',
    actionTone: 'text-lime-100',
  },
];

const systemStats = [
  { label: 'Active engines', value: '04', detail: 'BOQ, Estimate, Chat, Account' },
  { label: 'Audit accuracy', value: '95%', detail: 'Benchmark comparison layer' },
  { label: 'Cost visibility', value: '10x', detail: 'Faster than manual review' },
];

const operatingSignals = [
  { label: 'Pricing database', status: 'Online', color: 'text-emerald-200' },
  { label: 'BOQ intelligence', status: 'Ready', color: 'text-cyan-200' },
  { label: 'Planner engine', status: 'Queued', color: 'text-amber-200' },
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

  const handleNavigation = (feature: DashboardFeature) => {
    if (!feature.ready) {
      setComingSoon(feature.title);
      return;
    }
    router.push(feature.route);
  };

  const featuredTools = features.filter(feature => feature.featured);
  const toolGrid = features.filter(feature => !feature.featured);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#04070d] px-4 pt-24 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(8,47,73,0.32),rgba(2,6,23,0.84)_42%,rgba(0,0,0,1))]" />
        <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(rgba(125,211,252,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.7)_1px,transparent_1px)] [background-size:42px_42px]" />
        <div className="absolute right-[-110px] top-24 h-[520px] w-[520px] rounded-full border border-cyan-200/10" />
        <div className="absolute right-20 top-48 h-56 w-[420px] rotate-[-8deg] border border-cyan-200/10 bg-cyan-200/[0.02]">
          <div className="absolute left-10 top-8 h-24 w-36 border border-cyan-200/10" />
          <div className="absolute bottom-10 right-12 h-16 w-44 border border-cyan-200/10" />
          <div className="absolute left-0 top-1/2 h-px w-full bg-cyan-200/10" />
          <div className="absolute left-1/2 top-0 h-full w-px bg-cyan-200/10" />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl pb-14">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-stretch">
          <div className="rounded-lg border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/40 backdrop-blur sm:p-8">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
                <FaBolt size={12} /> Command Center
              </div>
              <button
                onClick={() => setShowOnboarding(true)}
                className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-300 transition-colors hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:text-cyan-100"
              >
                <FaBolt size={11} /> Replay tour
              </button>
            </div>

            <div className="max-w-4xl">
              <h1 className="text-4xl font-bold leading-tight tracking-normal text-white sm:text-6xl">
                Your construction intelligence workspace.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                Run BOQ audits, prepare cost estimates, and launch planning tools from one high-signal control room built for Indian real estate projects.
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {systemStats.map(stat => (
                <div key={stat.label} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
                  <p className="text-3xl font-bold tracking-normal text-white">{stat.value}</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{stat.label}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-400">{stat.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-lg border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-black/40 backdrop-blur">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">System Pulse</p>
                <h2 className="mt-1 text-xl font-semibold text-white">Live workspace</h2>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-200/20 bg-emerald-200/10 text-emerald-100">
                <FaChartLine />
              </div>
            </div>

            <div className="space-y-3">
              {operatingSignals.map(signal => (
                <div key={signal.label} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.035] px-4 py-3">
                  <span className="text-sm text-slate-300">{signal.label}</span>
                  <span className={`text-xs font-semibold uppercase tracking-[0.14em] ${signal.color}`}>{signal.status}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-lg border border-amber-300/20 bg-amber-300/10 p-4">
              <p className="text-sm font-semibold text-amber-50">Recommended next action</p>
              <p className="mt-2 text-xs leading-5 text-amber-100/75">
                Start with BOQ Analysis for leakage detection, then use Cost Estimator to validate the project budget envelope.
              </p>
            </div>
          </aside>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          {featuredTools.map((feature, idx) => (
            <motion.button
              key={feature.title}
              type="button"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.45 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleNavigation(feature)}
              className={`group overflow-hidden rounded-lg border border-white/10 bg-slate-950/75 text-left shadow-2xl shadow-black/30 backdrop-blur transition-all hover:bg-slate-950 ${feature.hoverBorder} ${feature.hoverShadow}`}
            >
              <div className={`h-1.5 bg-gradient-to-r ${feature.accent}`} />
              <div className="p-6">
                <div className="mb-8 flex items-start justify-between gap-5">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] ${feature.iconTone} ${feature.iconGlow}`}>
                    <feature.icon size={26} />
                  </div>
                  <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100">
                    {feature.signal}
                  </span>
                </div>
                <h2 className="text-2xl font-semibold text-white">{feature.title}</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">{feature.description}</p>
                <div className={`mt-6 inline-flex items-center gap-2 text-sm font-semibold ${feature.actionTone}`}>
                  Launch tool <FaArrowRight className="transition-transform group-hover:translate-x-1" size={13} />
                </div>
              </div>
            </motion.button>
          ))}
        </section>

        <section className="mt-6">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Tool Library</p>
              <h2 className="mt-1 text-2xl font-semibold text-white">All modules</h2>
            </div>
            <span className="hidden text-xs text-slate-500 sm:inline">Live and queued product surfaces</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {toolGrid.map((feature, idx) => (
              <motion.button
                key={feature.title}
                type="button"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.14 + idx * 0.04, duration: 0.42 }}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleNavigation(feature)}
                className={`group rounded-lg border border-white/10 bg-white/[0.035] p-4 text-left backdrop-blur transition-all hover:bg-white/[0.06] ${feature.hoverBorder} ${feature.hoverShadow}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-slate-950/70 ${feature.iconTone} ${feature.iconGlow}`}>
                    <feature.icon size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-semibold text-white">{feature.title}</h3>
                      {feature.ready ? (
                        <FaCheckCircle className="mt-0.5 shrink-0 text-emerald-300" size={14} />
                      ) : (
                        <FaLock className="mt-0.5 shrink-0 text-slate-600" size={13} />
                      )}
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-500">{feature.description}</p>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className={`h-1.5 w-16 rounded-full bg-gradient-to-r ${feature.accent}`} />
                      <span className={feature.ready ? 'text-xs font-semibold text-emerald-200' : 'text-xs font-semibold text-slate-500'}>
                        {feature.signal}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </section>
      </div>

      <AnimatePresence>
        {comingSoon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setComingSoon(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={event => event.stopPropagation()}
              className="w-full max-w-sm rounded-lg border border-white/10 bg-slate-950 p-7 text-center shadow-[0_0_50px_rgba(56,189,248,0.12)]"
            >
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-lg border border-amber-300/20 bg-amber-300/10 text-amber-100">
                <FaBolt size={24} />
              </div>
              <h2 className="text-xl font-semibold text-white">{comingSoon}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                This module is queued in the Auto Nirman roadmap and will be enabled soon.
              </p>
              <button
                onClick={() => setComingSoon(null)}
                className="mt-6 rounded-lg bg-cyan-300 px-6 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-cyan-200"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showOnboarding && (
          <OnboardingWizard onComplete={() => setShowOnboarding(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
