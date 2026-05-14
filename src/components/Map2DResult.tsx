'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Compass,
  DoorOpen,
  Home,
  MapPinned,
  Maximize2,
  Ruler,
  Sparkles,
  SunMedium,
} from 'lucide-react';
import Map2DCanvas from '@/components/Map2DCanvas';
import { MAP2D_STORAGE_KEY } from '@/components/Map2DGenerator';
import { generateMap2DLayout } from '@/lib/map2d/generateLayout';
import type { Map2DLayout } from '@/types/map2d';

function titleCase(value?: string) {
  if (!value) return 'Family';
  return value
    .replaceAll('_', ' ')
    .split(' ')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatArea(value: number) {
  return `${Math.round(value).toLocaleString('en-IN')} sq ft`;
}

function scoreTone(value: number) {
  if (value >= 86) return 'text-emerald-200';
  if (value >= 74) return 'text-cyan-200';
  return 'text-amber-200';
}

export default function Map2DResult() {
  const [layout, setLayout] = useState<Map2DLayout | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [briefOpen, setBriefOpen] = useState(false);

  const resultSummary = useMemo(() => {
    if (!layout) return null;

    const plotArea = layout.plot.areaSqft || layout.plot.width * layout.plot.length;
    const plannedArea = layout.rooms.reduce((total, room) => total + (room.areaSqft ?? room.width * room.height), 0);
    const topScore = Math.max(...Object.values(layout.score));
    const averageScore = Math.round(Object.values(layout.score).reduce((sum, value) => sum + value, 0) / 4);
    const privateRooms = layout.rooms.filter(room => room.type === 'bedroom' || room.type === 'bath').length;
    const supportRooms = layout.rooms.filter(room => ['utility', 'store', 'stair', 'parking'].includes(room.type)).length;

    return {
      averageScore,
      plannedArea,
      plotArea,
      privateRooms,
      supportRooms,
      topScore,
    };
  }, [layout]);

  useEffect(() => {
    const raw = sessionStorage.getItem(MAP2D_STORAGE_KEY);
    if (raw) {
      try {
        const stored = JSON.parse(raw) as Map2DLayout;
        const refreshed = generateMap2DLayout(stored.input);
        sessionStorage.setItem(MAP2D_STORAGE_KEY, JSON.stringify(refreshed));
        setLayout(refreshed);
      } catch {
        setLayout(null);
      }
    }
    setLoaded(true);
    const timer = window.setTimeout(() => setCanvasReady(true), 900);
    return () => window.clearTimeout(timer);
  }, []);

  if (!loaded || !canvasReady) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-2xl border border-cyan-300/20 bg-slate-950/80 p-7 text-center shadow-[0_0_70px_rgba(34,211,238,0.14)]">
          <div className="mx-auto mb-5 h-16 w-16 rounded-full border border-cyan-300/25 bg-cyan-300/10 p-2">
            <div className="h-full w-full animate-spin rounded-full border-2 border-cyan-300/20 border-t-cyan-200" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">Rendering result</p>
          <h1 className="mt-3 text-2xl font-bold text-white">Preparing your clean JPEG map</h1>
          <div className="mt-5 grid gap-2 text-left">
            {['Optimizing labels', 'Drawing room boundaries', 'Loading AI assistant checks'].map(item => (
              <div key={item} className="rounded-lg border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-slate-300">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!layout) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-lg border border-white/10 bg-slate-950/75 p-8 text-center">
          <h1 className="text-3xl font-bold text-white">No map found</h1>
          <p className="mt-3 text-sm text-slate-400">Generate a 2D map first, then the JPEG result will appear here.</p>
          <Link href="/dashboard/2d-map-generator" className="mt-6 inline-flex rounded-lg bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950">
            Go to generator
          </Link>
        </div>
      </div>
    );
  }

  const conceptTitle = layout.aiPlan?.conceptTitle ?? `${titleCase(layout.input.planStyle)} ${layout.input.houseType.toUpperCase()} Plan`;
  const plannedPercent = resultSummary ? Math.min(100, Math.round((resultSummary.plannedArea / Math.max(resultSummary.plotArea, 1)) * 100)) : 0;
  const scoreCards = [
    { key: 'efficiency', label: 'Efficiency', value: layout.score.efficiency, Icon: Maximize2 },
    { key: 'vastu', label: 'Vastu', value: layout.score.vastu, Icon: Compass },
    { key: 'circulation', label: 'Flow', value: layout.score.circulation, Icon: MapPinned },
    { key: 'daylight', label: 'Daylight', value: layout.score.daylight, Icon: SunMedium },
  ];

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-7 grid gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
        <div className="relative overflow-hidden rounded-lg border border-cyan-300/15 bg-white/[0.035] p-5 shadow-2xl shadow-cyan-950/20 sm:p-7">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/70 to-transparent" />
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
            <Sparkles size={14} /> Futuristic generated map
          </div>
          <h1 className="max-w-5xl text-4xl font-bold tracking-normal text-white sm:text-6xl">
            {conceptTitle}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            JPEG-ready floor plan with validated geometry, room scheduling, and AI design checks for client review.
          </p>
          {resultSummary && (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { value: `${resultSummary.averageScore}%`, label: 'Readiness', Icon: ClipboardCheck },
                { value: formatArea(resultSummary.plotArea), label: 'Plot area', Icon: Ruler },
                { value: `${plannedPercent}%`, label: 'Planned coverage', Icon: Maximize2 },
                { value: layout.input.plotMode === 'trace' ? 'Traced plot' : `${layout.plot.width}' x ${layout.plot.length}'`, label: 'Boundary', Icon: MapPinned },
              ].map(({ value, label, Icon }) => (
                <div key={label} className="rounded-lg border border-white/10 bg-slate-950/60 p-3">
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-md border border-cyan-300/15 bg-cyan-300/10 text-cyan-100">
                    <Icon size={16} />
                  </div>
                  <p className="text-lg font-bold text-white">{value}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-white/10 bg-slate-950/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Client handoff</p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            {[
              [layout.input.houseType.toUpperCase(), 'Configuration'],
              [`${layout.input.bathrooms ?? 2} Bath`, 'Bathrooms'],
              [titleCase(layout.input.planStyle), 'Style'],
              [layout.input.vastu ? 'Vastu aligned' : 'Flexible', 'Preference'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-lg border border-cyan-300/10 bg-cyan-300/[0.045] p-3">
                <p className="font-bold text-white">{value}</p>
                <p className="mt-1 uppercase tracking-[0.12em] text-slate-500">{label}</p>
              </div>
            ))}
          </div>
          <Link href="/dashboard/2d-map-generator" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/[0.07]">
            <ArrowLeft size={16} /> Edit inputs
          </Link>
          <Link href="/dashboard/future-home-walkthrough" className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-200 via-cyan-200 to-emerald-200 px-5 py-3 text-sm font-black text-slate-950 shadow-[0_0_34px_rgba(125,211,252,0.24)] transition-all hover:-translate-y-0.5 hover:shadow-[0_0_48px_rgba(251,191,36,0.22)]">
            <DoorOpen size={16} /> Walk through this home
          </Link>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Map2DCanvas layout={layout} />

        <aside className="space-y-4">
          <div className="rounded-lg border border-cyan-300/15 bg-slate-950/75 p-4 shadow-2xl shadow-cyan-950/10">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">Design checks</p>
                <h2 className="mt-2 text-xl font-bold leading-tight text-white">AI reviewed planning score</h2>
              </div>
              <div className={`text-3xl font-black ${scoreTone(resultSummary?.topScore ?? 0)}`}>
                {resultSummary?.topScore ?? 0}%
              </div>
            </div>
            <div className="mt-4 grid gap-3">
              {scoreCards.map(({ key, label, value, Icon }) => (
                <div key={key} className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="inline-flex items-center gap-2 font-semibold text-slate-200">
                      <Icon size={15} className="text-cyan-200" /> {label}
                    </span>
                    <span className="font-bold text-white">{value}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-300 to-emerald-300" style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-slate-950/75 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Room schedule</p>
                <h2 className="mt-2 text-lg font-bold text-white">{layout.rooms.length} planned zones</h2>
              </div>
              <Home className="text-cyan-200" size={20} />
            </div>
            {resultSummary && (
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                {[
                  [layout.rooms.length, 'Total'],
                  [resultSummary.privateRooms, 'Private'],
                  [resultSummary.supportRooms, 'Support'],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
                    <p className="text-lg font-bold text-white">{value}</p>
                    <p className="mt-1 uppercase tracking-[0.12em] text-slate-500">{label}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 max-h-[290px] space-y-2 overflow-auto pr-1">
              {layout.rooms.map(room => (
                <div key={room.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs">
                  <span className="flex min-w-0 items-center gap-2 font-semibold text-slate-200">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: room.color }} />
                    <span className="truncate">{room.label}</span>
                  </span>
                  <span className="shrink-0 text-slate-500">{formatArea(room.areaSqft ?? room.width * room.height)}</span>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setBriefOpen(value => !value)}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm font-bold text-cyan-50 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-200/70 hover:bg-cyan-300/15 hover:shadow-[0_0_28px_rgba(34,211,238,0.22)]"
            >
              {briefOpen ? 'Hide AI notes' : 'Show AI notes'} {briefOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {briefOpen && (
            <div className="mt-4 overflow-hidden rounded-lg border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_34%),rgba(2,6,23,0.92)] p-4 shadow-[0_0_60px_rgba(8,145,178,0.12)]">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                <Sparkles size={14} className="text-cyan-200" /> Design intelligence
              </div>
              <div className="mt-4 space-y-2">
                {layout.aiNotes.map(note => (
                  <div key={note} className="flex gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs leading-5 text-slate-400">
                    <CheckCircle2 className="mt-0.5 shrink-0 text-cyan-300" size={14} />
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
