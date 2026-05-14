'use client';

import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FaArrowRight,
  FaBolt,
  FaBuilding,
  FaCalculator,
  FaCheckCircle,
  FaClock,
  FaFileInvoiceDollar,
  FaGavel,
  FaHome,
  FaLock,
  FaMap,
  FaProjectDiagram,
  FaRobot,
  FaRoute,
  FaUser,
} from 'react-icons/fa';
import { useEffect, useState } from 'react';
import OnboardingWizard from '@/components/OnboardingWizard';

type DashboardFeature = {
  icon: typeof FaRobot;
  title: string;
  route: string;
  ready: boolean;
  description: string;
  simpleUse: string;
  signal: string;
  accent: string;
  glow: string;
  iconTone: string;
  action: string;
  category: 'start' | 'plan' | 'support' | 'later';
};

const features: DashboardFeature[] = [
  {
    icon: FaBuilding,
    title: 'BOQ Analysis',
    route: '/dashboard/boq-upload',
    ready: true,
    description: 'Upload your BOQ and find hidden cost leakage before work starts.',
    simpleUse: 'Use first when you already have a BOQ file.',
    signal: 'Ready now',
    accent: 'from-cyan-300 via-blue-400 to-indigo-500',
    glow: 'hover:border-cyan-300/55 hover:shadow-[0_0_46px_rgba(34,211,238,0.22)]',
    iconTone: 'text-cyan-100 bg-cyan-300/10 border-cyan-200/20',
    action: 'Check BOQ',
    category: 'start',
  },
  {
    icon: FaCalculator,
    title: 'Cost Estimator',
    route: '/dashboard/cost-estimator',
    ready: true,
    description: 'Enter area, floors, city, and quality to get a clean budget range.',
    simpleUse: 'Use this before talking to contractors.',
    signal: 'Ready now',
    accent: 'from-emerald-300 via-teal-300 to-cyan-400',
    glow: 'hover:border-emerald-300/55 hover:shadow-[0_0_46px_rgba(52,211,153,0.2)]',
    iconTone: 'text-emerald-100 bg-emerald-300/10 border-emerald-200/20',
    action: 'Estimate cost',
    category: 'start',
  },
  {
    icon: FaMap,
    title: '2D Map Generator',
    route: '/dashboard/2d-map-generator',
    ready: true,
    description: 'Create a futuristic JPEG floor plan from plot details or boundary upload.',
    simpleUse: 'Use this when you want a visual plan.',
    signal: 'Ready now',
    accent: 'from-orange-300 via-amber-300 to-cyan-400',
    glow: 'hover:border-orange-300/55 hover:shadow-[0_0_46px_rgba(251,146,60,0.2)]',
    iconTone: 'text-orange-100 bg-orange-300/10 border-orange-200/20',
    action: 'Make map',
    category: 'plan',
  },
  {
    icon: FaRobot,
    title: 'AI Assistant',
    route: '/chatbot',
    ready: true,
    description: 'Ask doubts about BOQ, cost, materials, planning, and next steps.',
    simpleUse: 'Use anytime you feel stuck.',
    signal: 'Ready now',
    accent: 'from-violet-300 via-fuchsia-300 to-cyan-400',
    glow: 'hover:border-violet-300/55 hover:shadow-[0_0_42px_rgba(167,139,250,0.22)]',
    iconTone: 'text-violet-100 bg-violet-300/10 border-violet-200/20',
    action: 'Ask AI',
    category: 'support',
  },
  {
    icon: FaUser,
    title: 'Profile',
    route: '/user',
    ready: true,
    description: 'Manage your account, saved work, and project access.',
    simpleUse: 'Use this for account details.',
    signal: 'Ready now',
    accent: 'from-slate-200 via-cyan-200 to-slate-500',
    glow: 'hover:border-slate-300/50 hover:shadow-[0_0_34px_rgba(203,213,225,0.13)]',
    iconTone: 'text-slate-100 bg-slate-300/10 border-slate-200/20',
    action: 'Open profile',
    category: 'support',
  },
  {
    icon: FaBuilding,
    title: 'Work Planner',
    route: '/dashboard/smart-construction-planner',
    ready: false,
    description: 'Plan phases, timelines, and site work priorities.',
    simpleUse: 'Coming for site execution planning.',
    signal: 'Coming soon',
    accent: 'from-amber-300 via-orange-400 to-red-400',
    glow: 'hover:border-amber-300/50 hover:shadow-[0_0_36px_rgba(251,191,36,0.16)]',
    iconTone: 'text-amber-100 bg-amber-300/10 border-amber-200/20',
    action: 'Preview',
    category: 'later',
  },
  {
    icon: FaProjectDiagram,
    title: 'Future Home Walkthrough',
    route: '/dashboard/future-home-walkthrough',
    ready: true,
    description: 'Step inside a walkable 3D home generated from your floor plan.',
    simpleUse: 'Generate a 2D map first, then walk through the house.',
    signal: 'Ready now',
    accent: 'from-amber-200 via-cyan-300 to-emerald-300',
    glow: 'hover:border-cyan-300/55 hover:shadow-[0_0_46px_rgba(125,211,252,0.2)]',
    iconTone: 'text-indigo-100 bg-indigo-300/10 border-indigo-200/20',
    action: 'Walk inside',
    category: 'plan',
  },
  {
    icon: FaGavel,
    title: 'Legal Check',
    route: '/legal',
    ready: false,
    description: 'Review property papers, approvals, and ownership risk.',
    simpleUse: 'Coming for property safety checks.',
    signal: 'Coming soon',
    accent: 'from-rose-300 via-red-400 to-orange-400',
    glow: 'hover:border-rose-300/50 hover:shadow-[0_0_36px_rgba(251,113,133,0.15)]',
    iconTone: 'text-rose-100 bg-rose-300/10 border-rose-200/20',
    action: 'Preview',
    category: 'later',
  },
  {
    icon: FaHome,
    title: 'Property Deal',
    route: '/property',
    ready: false,
    description: 'Compare property options with cost and risk clarity.',
    simpleUse: 'Coming for buy/sell decisions.',
    signal: 'Coming soon',
    accent: 'from-lime-300 via-emerald-300 to-teal-400',
    glow: 'hover:border-lime-300/50 hover:shadow-[0_0_36px_rgba(190,242,100,0.14)]',
    iconTone: 'text-lime-100 bg-lime-300/10 border-lime-200/20',
    action: 'Preview',
    category: 'later',
  },
];

const workChain = [
  {
    title: 'Start with what you have',
    text: 'Upload a BOQ, enter project size, or add plot details.',
    icon: FaFileInvoiceDollar,
    color: 'text-cyan-100 border-cyan-200/20 bg-cyan-300/10',
  },
  {
    title: 'Let Auto Nirman check it',
    text: 'Find cost gaps, plan the budget, or generate a clean map.',
    icon: FaBolt,
    color: 'text-amber-100 border-amber-200/20 bg-amber-300/10',
  },
  {
    title: 'Download and decide',
    text: 'Use the report, estimate, or JPEG map for the next meeting.',
    icon: FaCheckCircle,
    color: 'text-emerald-100 border-emerald-200/20 bg-emerald-300/10',
  },
];

const quickStarts = [
  { label: 'I have a BOQ', route: '/dashboard/boq-upload', icon: FaBuilding, tone: 'from-cyan-300 to-blue-500' },
  { label: 'I need a cost idea', route: '/dashboard/cost-estimator', icon: FaCalculator, tone: 'from-emerald-300 to-teal-400' },
  { label: 'I want a floor map', route: '/dashboard/2d-map-generator', icon: FaMap, tone: 'from-orange-300 to-cyan-400' },
  { label: 'I need help', route: '/chatbot', icon: FaRobot, tone: 'from-violet-300 to-fuchsia-400' },
];

const startTools = features.filter(feature => feature.category === 'start' || feature.category === 'plan');
const supportTools = features.filter(feature => feature.category === 'support');
const laterTools = features.filter(feature => feature.category === 'later');

export default function Dashboard() {
  const router = useRouter();
  const [comingSoon, setComingSoon] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeFeature, setActiveFeature] = useState<DashboardFeature>(startTools[0]);

  useEffect(() => {
    const onboarded = localStorage.getItem('autonirman_onboarded');
    if (!onboarded) setShowOnboarding(true);
  }, []);

  const openFeature = (feature: DashboardFeature) => {
    if (!feature.ready) {
      setComingSoon(feature.title);
      return;
    }
    router.push(feature.route);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05070b] px-3 pb-10 pt-20 text-white sm:px-6 lg:px-8 lg:pb-16 lg:pt-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_12%,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_84%_20%,rgba(251,146,60,0.14),transparent_28%),linear-gradient(135deg,#05070b,#07111f_45%,#020305)]" />
        <div className="absolute inset-0 opacity-[0.075] bg-[linear-gradient(rgba(125,211,252,0.75)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.75)_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="absolute left-[-140px] top-32 h-[420px] w-[420px] rounded-full border border-cyan-200/10" />
        <div className="absolute right-[-160px] top-28 h-[560px] w-[560px] rounded-full border border-orange-200/10" />
      </div>

      <MobileDashboard
        onOpen={openFeature}
        onQuickStart={route => router.push(route)}
        onShowTour={() => setShowOnboarding(true)}
      />

      <div className="relative z-10 mx-auto hidden max-w-7xl lg:block">
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_390px]">
          <div className="overflow-hidden rounded-lg border border-white/10 bg-slate-950 shadow-[0_24px_90px_rgba(0,0,0,0.55)]">
            <div className="h-1.5 bg-gradient-to-r from-cyan-300 via-blue-500 to-orange-300" />
            <div className="p-5 sm:p-7 lg:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-cyan-100">
                  <FaRoute size={12} /> Start here
                </div>
                <button
                  type="button"
                  onClick={() => setShowOnboarding(true)}
                  className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-300 transition-all hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:text-cyan-100"
                >
                  <FaBolt size={11} /> Show tour
                </button>
              </div>

              <div className="mt-8 max-w-4xl">
                <h1 className="text-4xl font-black leading-[1.02] tracking-normal text-white sm:text-6xl lg:text-7xl">
                  What do you want to build today?
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">
                  Pick a simple path. Auto Nirman will guide you from raw project details to a report, estimate, or map you can actually use.
                </p>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {quickStarts.map(item => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => router.push(item.route)}
                    className="living-surface group rounded-lg border border-white/10 bg-white/[0.045] p-4 text-left transition-all hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.07] hover:shadow-[0_0_32px_rgba(34,211,238,0.12)]"
                  >
                    <div className={`mb-4 h-1.5 w-16 rounded-full bg-gradient-to-r ${item.tone}`} />
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-bold text-white">{item.label}</span>
                      <item.icon className="text-cyan-100 transition-transform group-hover:scale-110" size={18} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <LiveWorkspacePanel feature={activeFeature} onOpen={openFeature} />
            <div className="rounded-lg border border-white/10 bg-slate-950 p-5 shadow-[0_24px_90px_rgba(0,0,0,0.5)]">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Recommended order</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Do this first</h2>
              <div className="mt-5 space-y-3">
                {workChain.map((step, index) => (
                  <div key={step.title} className="living-surface relative rounded-lg border border-white/10 bg-white/[0.035] p-4">
                    <div className="flex gap-4">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${step.color}`}>
                        <step.icon size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-cyan-100">0{index + 1}</span>
                          <h3 className="text-sm font-bold text-white">{step.title}</h3>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-slate-400">{step.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-6">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Main work</p>
              <h2 className="text-3xl font-black text-white">Choose your next step</h2>
            </div>
            <p className="max-w-md text-sm text-slate-500">Plain tools, clear output. No guessing where to click.</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {startTools.map((feature, index) => (
              <FeatureCard key={feature.title} feature={feature} index={index} onOpen={openFeature} onPreview={setActiveFeature} active={activeFeature.title === feature.title} large />
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
          <div>
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Help and account</p>
              <h2 className="text-2xl font-black text-white">Support tools</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {supportTools.map((feature, index) => (
                <FeatureCard key={feature.title} feature={feature} index={index} onOpen={openFeature} onPreview={setActiveFeature} active={activeFeature.title === feature.title} />
              ))}
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Next releases</p>
                <h2 className="text-2xl font-black text-white">Coming next</h2>
              </div>
              <span className="hidden items-center gap-2 text-xs font-semibold text-slate-500 sm:inline-flex">
                <FaClock /> Roadmap
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {laterTools.map((feature, index) => (
                <FeatureCard key={feature.title} feature={feature} index={index} onOpen={openFeature} onPreview={setActiveFeature} active={activeFeature.title === feature.title} muted />
              ))}
            </div>
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={event => event.stopPropagation()}
              className="w-full max-w-sm rounded-lg border border-white/10 bg-slate-950 p-7 text-center shadow-[0_0_60px_rgba(34,211,238,0.14)]"
            >
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-lg border border-amber-300/20 bg-amber-300/10 text-amber-100">
                <FaLock size={22} />
              </div>
              <h2 className="text-xl font-bold text-white">{comingSoon}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                This is not live yet. The ready tools above can be used right now.
              </p>
              <button
                type="button"
                onClick={() => setComingSoon(null)}
                className="mt-6 rounded-lg bg-cyan-300 px-6 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-cyan-200"
              >
                Okay
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showOnboarding && <OnboardingWizard onComplete={() => setShowOnboarding(false)} />}
      </AnimatePresence>
    </main>
  );
}

function FeatureCard({
  feature,
  index,
  onOpen,
  onPreview,
  active = false,
  large = false,
  muted = false,
}: {
  feature: DashboardFeature;
  index: number;
  onOpen: (feature: DashboardFeature) => void;
  onPreview?: (feature: DashboardFeature) => void;
  active?: boolean;
  large?: boolean;
  muted?: boolean;
}) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.055, duration: 0.38 }}
      whileHover={{ y: feature.ready ? -5 : -2 }}
      whileTap={{ scale: 0.985 }}
      onClick={() => onOpen(feature)}
      onMouseEnter={() => onPreview?.(feature)}
      onFocus={() => onPreview?.(feature)}
      className={`living-surface group relative overflow-hidden rounded-lg border bg-slate-950 p-5 text-left shadow-[0_18px_60px_rgba(0,0,0,0.34)] transition-all hover:bg-[#071120] ${active ? 'border-cyan-300/45 shadow-[0_0_44px_rgba(34,211,238,0.16)]' : 'border-white/10'} ${feature.glow} ${muted ? 'opacity-80 hover:opacity-100' : ''}`}
    >
      <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${feature.accent}`} />
      <div className="absolute right-[-56px] top-[-56px] h-36 w-36 rounded-full border border-white/10" />

      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className={`flex ${large ? 'h-14 w-14' : 'h-12 w-12'} items-center justify-center rounded-lg border ${feature.iconTone}`}>
            <feature.icon size={large ? 24 : 20} />
          </div>
          <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${feature.ready ? 'border-emerald-300/25 bg-emerald-300/10 text-emerald-100' : 'border-slate-500/25 bg-slate-400/10 text-slate-400'}`}>
            {feature.signal}
          </span>
        </div>

        <h3 className={`${large ? 'text-2xl' : 'text-lg'} font-black text-white`}>{feature.title}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-400">{feature.description}</p>
        <p className="mt-3 text-xs leading-5 text-slate-500">{feature.simpleUse}</p>

        <div className="mt-6 flex items-center justify-between gap-4">
          <span className={`inline-flex items-center gap-2 text-sm font-bold ${feature.ready ? 'text-cyan-100' : 'text-slate-500'}`}>
            {feature.action}
            {feature.ready ? <FaArrowRight className="transition-transform group-hover:translate-x-1" size={13} /> : <FaLock size={12} />}
          </span>
          {feature.ready && <FaCheckCircle className="text-emerald-300" size={15} />}
        </div>
      </div>
    </motion.button>
  );
}

function LiveWorkspacePanel({ feature, onOpen }: { feature: DashboardFeature; onOpen: (feature: DashboardFeature) => void }) {
  const Icon = feature.icon;
  const readiness = feature.ready ? 92 : 42;

  return (
    <motion.div
      key={feature.title}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="living-surface overflow-hidden rounded-lg border border-cyan-300/20 bg-slate-950 p-5 shadow-[0_24px_90px_rgba(0,0,0,0.5)]"
    >
      <div className="live-grid absolute inset-0 opacity-20" />
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-100">Live focus</p>
            <h2 className="mt-2 text-2xl font-black text-white">{feature.title}</h2>
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-lg border ${feature.iconTone}`}>
            <Icon size={20} />
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-400">{feature.description}</p>
        <div className="mt-5 rounded-lg border border-white/10 bg-black/20 p-4">
          <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
            <span>Readiness</span>
            <span className={feature.ready ? 'text-emerald-200' : 'text-amber-200'}>{feature.signal}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${feature.accent}`}
              initial={{ width: 0 }}
              animate={{ width: `${readiness}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => onOpen(feature)}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 py-3 text-sm font-black text-slate-950 transition-all hover:-translate-y-0.5 hover:bg-cyan-200"
        >
          {feature.action} {feature.ready ? <FaArrowRight size={13} /> : <FaLock size={12} />}
        </button>
      </div>
    </motion.div>
  );
}

function MobileDashboard({
  onOpen,
  onQuickStart,
  onShowTour,
}: {
  onOpen: (feature: DashboardFeature) => void;
  onQuickStart: (route: string) => void;
  onShowTour: () => void;
}) {
  const readyTools = features.filter(feature => feature.ready);
  const previewTools = laterTools.slice(0, 4);

  return (
    <div className="relative z-10 mx-auto max-w-md lg:hidden">
      <section className="rounded-lg border border-white/10 bg-slate-950 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100">Dashboard</p>
            <h1 className="mt-1 text-2xl font-black leading-tight text-white">Start your work</h1>
          </div>
          <button
            type="button"
            onClick={onShowTour}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-cyan-100"
            aria-label="Show tour"
          >
            <FaBolt size={15} />
          </button>
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-400">
          Pick what you have. Get a report, budget, map, or help.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {quickStarts.map(item => (
            <button
              key={item.label}
              type="button"
              onClick={() => onQuickStart(item.route)}
              className="min-h-24 rounded-lg border border-white/10 bg-white/[0.04] p-3 text-left transition active:scale-[0.98]"
            >
              <div className={`mb-3 h-1 w-12 rounded-full bg-gradient-to-r ${item.tone}`} />
              <item.icon className="mb-2 text-cyan-100" size={18} />
              <span className="block text-xs font-bold leading-4 text-white">{item.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-3 rounded-lg border border-white/10 bg-slate-950 p-3">
        <div className="grid grid-cols-3 gap-2">
          {workChain.map((step, index) => (
            <div key={step.title} className="rounded-lg border border-white/10 bg-white/[0.035] p-2 text-center">
              <div className={`mx-auto flex h-8 w-8 items-center justify-center rounded-lg border ${step.color}`}>
                <step.icon size={13} />
              </div>
              <p className="mt-2 text-[10px] font-black text-cyan-100">0{index + 1}</p>
              <p className="mt-1 text-[10px] font-semibold leading-3 text-slate-300">{step.title}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-base font-black text-white">Ready tools</h2>
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-200">Live</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {readyTools.map(feature => (
            <MobileToolTile key={feature.title} feature={feature} onOpen={onOpen} />
          ))}
        </div>
      </section>

      <section className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-base font-black text-white">Coming next</h2>
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Preview</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {previewTools.map(feature => (
            <MobileToolTile key={feature.title} feature={feature} onOpen={onOpen} muted />
          ))}
        </div>
      </section>
    </div>
  );
}

function MobileToolTile({
  feature,
  onOpen,
  muted = false,
}: {
  feature: DashboardFeature;
  onOpen: (feature: DashboardFeature) => void;
  muted?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(feature)}
      className={`relative min-h-28 overflow-hidden rounded-lg border border-white/10 bg-slate-950 p-3 text-left shadow-[0_12px_35px_rgba(0,0,0,0.28)] transition active:scale-[0.98] ${muted ? 'opacity-75' : ''}`}
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${feature.accent}`} />
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg border ${feature.iconTone}`}>
        <feature.icon size={16} />
      </div>
      <h3 className="text-xs font-black leading-4 text-white">{feature.title}</h3>
      <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-500">{feature.action}</p>
      <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-cyan-100">
        {feature.ready ? 'Open' : 'Soon'}
        {feature.ready ? <FaArrowRight size={10} /> : <FaLock size={9} />}
      </div>
    </button>
  );
}
