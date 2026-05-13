'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import Map2DCanvas from '@/components/Map2DCanvas';
import { MAP2D_STORAGE_KEY } from '@/components/Map2DGenerator';
import type { Map2DLayout } from '@/types/map2d';

export default function Map2DResult() {
  const [layout, setLayout] = useState<Map2DLayout | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem(MAP2D_STORAGE_KEY);
    if (raw) {
      try {
        setLayout(JSON.parse(raw) as Map2DLayout);
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
            <Sparkles size={14} /> Futuristic generated map
          </div>
          <h1 className="max-w-4xl text-4xl font-bold tracking-normal text-white sm:text-6xl">
            Your JPEG-ready 2D map is ready.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Geometry is generated with deterministic coordinates, then rendered as a high-resolution futuristic canvas map.
          </p>
        </div>
        <Link href="/dashboard/2d-map-generator" className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white hover:bg-white/[0.07]">
          <ArrowLeft size={16} /> Edit inputs
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Map2DCanvas layout={layout} />

        <aside className="rounded-lg border border-white/10 bg-slate-950/75 p-5 shadow-2xl shadow-black/40">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">AI assistant checks</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Clean geometry, readable labels, and design checks separated from the JPEG so the map stays crisp.
          </p>
          <div className="mt-5 space-y-3">
            {Object.entries(layout.score).map(([key, value]) => (
              <div key={key} className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="capitalize text-slate-300">{key}</span>
                  <span className="font-bold text-white">{value}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-cyan-300" style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-3">
            {layout.aiNotes.map(note => (
              <div key={note} className="flex gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs leading-5 text-slate-400">
                <CheckCircle2 className="mt-0.5 shrink-0 text-cyan-300" size={14} />
                <span>{note}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
