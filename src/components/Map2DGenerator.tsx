'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Building2, Car, Compass, Home, Layers3, MapPinned, Ruler, Sparkles } from 'lucide-react';
import { generateMap2DLayout } from '@/lib/map2d/generateLayout';
import type { Map2DHouseType, Map2DInput, RoadSide } from '@/types/map2d';

export const MAP2D_STORAGE_KEY = 'auto_nirman_2d_map_layout';

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function NumberField({ label, value, onChange, helper }: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  helper: string;
}) {
  return (
    <label className="rounded-lg border border-white/10 bg-slate-950/70 p-4 focus-within:border-cyan-300/60">
      <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        <Ruler size={15} className="text-cyan-200" /> {label}
      </span>
      <input
        type="number"
        value={value}
        min={18}
        onChange={event => onChange(Number(event.target.value))}
        className="mt-3 w-full bg-transparent text-3xl font-bold text-white outline-none"
      />
      <span className="mt-2 block text-xs text-slate-500">{helper}</span>
    </label>
  );
}

export default function Map2DGenerator() {
  const router = useRouter();
  const [plotLength, setPlotLength] = useState(60);
  const [plotWidth, setPlotWidth] = useState(40);
  const [roadSide, setRoadSide] = useState<RoadSide>('north');
  const [houseType, setHouseType] = useState<Map2DHouseType>('3bhk');
  const [vastu, setVastu] = useState(true);
  const [parking, setParking] = useState(true);
  const [staircase, setStaircase] = useState(true);
  const [city, setCity] = useState('Lucknow');
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const generate = () => {
    setError(null);
    setGenerating(true);
    const input: Map2DInput = {
      plotLength,
      plotWidth,
      roadSide,
      houseType,
      vastu,
      parking,
      staircase,
      city,
    };

    try {
      const layout = generateMap2DLayout(input);
      sessionStorage.setItem(MAP2D_STORAGE_KEY, JSON.stringify(layout));
      window.setTimeout(() => {
        router.push('/dashboard/2d-map-generator/result');
      }, 1250);
    } catch (err) {
      setGenerating(false);
      setError(err instanceof Error ? err.message : 'Could not generate layout.');
    }
  };

  return (
    <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {generating && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 px-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-cyan-300/20 bg-slate-950/90 p-7 text-center shadow-[0_0_70px_rgba(34,211,238,0.18)]">
            <div className="mx-auto mb-5 h-16 w-16 rounded-full border border-cyan-300/25 bg-cyan-300/10 p-2">
              <div className="h-full w-full animate-spin rounded-full border-2 border-cyan-300/20 border-t-cyan-200" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">Generating map</p>
            <h2 className="mt-3 text-2xl font-bold text-white">Building clean geometry</h2>
            <div className="mt-5 space-y-2 text-left">
              {['Validating plot dimensions', 'Placing rooms with deterministic coordinates', 'Preparing futuristic JPEG renderer'].map(item => (
                <div key={item} className="rounded-lg border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-slate-300">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="mb-8 max-w-4xl">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
          <Sparkles size={14} /> AI assisted map generator
        </div>
        <h1 className="text-4xl font-bold tracking-normal text-white sm:text-6xl">
          Generate a futuristic 2D floor map as JPEG.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
          Enter plot basics. Auto Nirman creates deterministic geometry, then renders a clean futuristic JPEG map with AI assistant checks.
        </p>
      </div>

      <div className="rounded-lg border border-white/10 bg-slate-950/70 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-2">
          <NumberField label="Plot length" value={plotLength} onChange={setPlotLength} helper="Depth of plot in feet." />
          <NumberField label="Plot width" value={plotWidth} onChange={setPlotWidth} helper="Frontage width in feet." />

          <section>
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200">
              <MapPinned size={17} className="text-cyan-200" /> Road side
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(['north', 'east', 'south', 'west'] as RoadSide[]).map(side => (
                <button
                  key={side}
                  type="button"
                  onClick={() => setRoadSide(side)}
                  className={classNames(
                    'rounded-lg border p-3 text-left text-sm font-semibold uppercase tracking-[0.12em]',
                    roadSide === side ? 'border-cyan-300/60 bg-cyan-300/10 text-cyan-100' : 'border-white/10 bg-white/[0.035] text-slate-400'
                  )}
                >
                  {side}
                </button>
              ))}
            </div>
          </section>

          <section>
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200">
              <Home size={17} className="text-cyan-200" /> House type
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(['2bhk', '3bhk'] as Map2DHouseType[]).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setHouseType(type)}
                  className={classNames(
                    'rounded-lg border p-4 text-left text-lg font-bold uppercase',
                    houseType === type ? 'border-emerald-300/60 bg-emerald-300/10 text-emerald-100' : 'border-white/10 bg-white/[0.035] text-slate-300'
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </section>

          <label className="lg:col-span-2 rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">City / context</span>
            <input
              value={city}
              onChange={event => setCity(event.target.value)}
              className="w-full bg-transparent text-lg font-semibold text-white outline-none placeholder:text-slate-600"
              placeholder="Lucknow, Pune, Mumbai..."
            />
          </label>

          <section className="lg:col-span-2 grid gap-2 sm:grid-cols-3">
            {[
              { label: 'Vastu assist', value: vastu, set: setVastu, Icon: Compass },
              { label: 'Parking bay', value: parking, set: setParking, Icon: Car },
              { label: 'Staircase', value: staircase, set: setStaircase, Icon: Layers3 },
            ].map(({ label, value, set, Icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => set(!value)}
                className={classNames(
                  'flex min-h-20 items-center gap-3 rounded-lg border p-4 text-left transition-all',
                  value ? 'border-amber-300/50 bg-amber-300/10 text-amber-50' : 'border-white/10 bg-white/[0.035] text-slate-400'
                )}
              >
                <Icon size={20} />
                <span className="font-semibold">{label}</span>
              </button>
            ))}
          </section>
        </div>

        {error && (
          <div className="mx-5 mb-5 rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100 sm:mx-6">
            {error}
          </div>
        )}

        <div className="border-t border-white/10 bg-black/20 p-5 sm:p-6">
          <button
            type="button"
            onClick={generate}
            disabled={generating}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-300 px-5 py-3.5 text-sm font-bold text-slate-950 transition-colors hover:bg-cyan-200"
          >
            {generating ? 'Generating clean JPEG map...' : 'Generate futuristic JPEG map'} <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {[
          ['Geometry first', 'Exact room coordinates are generated before rendering.'],
          ['AI assistant', 'Scores and notes improve layout clarity, beauty, and planning decisions.'],
          ['JPEG output', 'The final visible map is exported from canvas as a high-quality JPEG.'],
        ].map(([title, desc]) => (
          <div key={title} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <Building2 className="text-cyan-200" size={18} />
            <p className="mt-3 text-sm font-semibold text-white">{title}</p>
            <p className="mt-2 text-xs leading-5 text-slate-500">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
