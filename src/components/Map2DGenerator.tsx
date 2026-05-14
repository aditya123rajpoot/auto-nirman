'use client';

import { useState, type ChangeEvent, type MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Building2, Car, Compass, Home, ImagePlus, Layers3, MapPinned, MousePointer2, Ruler, Sparkles, Undo2, Wand2 } from 'lucide-react';
import { generateMap2DLayout } from '@/lib/map2d/generateLayout';
import type { Map2DHouseType, Map2DInput, Map2DPlanStyle, Map2DPlotMode, Map2DPoint, RoadSide } from '@/types/map2d';

export const MAP2D_STORAGE_KEY = 'auto_nirman_2d_map_layout';

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

const glowStyles = {
  cyan: {
    active: 'border-cyan-300/70 bg-cyan-300/12 text-cyan-50 shadow-[0_0_28px_rgba(34,211,238,0.22)]',
    idle: 'border-white/10 bg-white/[0.035] text-slate-400 hover:border-cyan-300/55 hover:bg-cyan-300/10 hover:text-cyan-50 hover:shadow-[0_0_26px_rgba(34,211,238,0.22)]',
  },
  amber: {
    active: 'border-amber-300/70 bg-amber-300/12 text-amber-50 shadow-[0_0_28px_rgba(251,191,36,0.20)]',
    idle: 'border-white/10 bg-white/[0.035] text-slate-400 hover:border-amber-300/55 hover:bg-amber-300/10 hover:text-amber-50 hover:shadow-[0_0_26px_rgba(251,191,36,0.18)]',
  },
  emerald: {
    active: 'border-emerald-300/70 bg-emerald-300/12 text-emerald-50 shadow-[0_0_28px_rgba(52,211,153,0.20)]',
    idle: 'border-white/10 bg-white/[0.035] text-slate-400 hover:border-emerald-300/55 hover:bg-emerald-300/10 hover:text-emerald-50 hover:shadow-[0_0_26px_rgba(52,211,153,0.18)]',
  },
  violet: {
    active: 'border-violet-300/70 bg-violet-300/12 text-violet-50 shadow-[0_0_28px_rgba(167,139,250,0.22)]',
    idle: 'border-white/10 bg-white/[0.035] text-slate-400 hover:border-violet-300/55 hover:bg-violet-300/10 hover:text-violet-50 hover:shadow-[0_0_26px_rgba(167,139,250,0.20)]',
  },
  rose: {
    active: 'border-rose-300/70 bg-rose-300/12 text-rose-50 shadow-[0_0_28px_rgba(251,113,133,0.20)]',
    idle: 'border-white/10 bg-white/[0.035] text-slate-400 hover:border-rose-300/55 hover:bg-rose-300/10 hover:text-rose-50 hover:shadow-[0_0_26px_rgba(251,113,133,0.18)]',
  },
} as const;

type GlowTone = keyof typeof glowStyles;

function glowClass(tone: GlowTone, active = false) {
  return classNames(
    'transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0',
    active ? glowStyles[tone].active : glowStyles[tone].idle
  );
}

function NumberField({ label, value, onChange, helper }: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  helper: string;
}) {
  return (
    <label className="living-surface rounded-lg border border-white/10 bg-slate-950/70 p-4 transition-all focus-within:-translate-y-0.5 focus-within:border-cyan-300/60">
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

function LivePlanningPreview({
  plotMode,
  plotLength,
  plotWidth,
  tracedArea,
  houseType,
  bathrooms,
  planStyle,
  vastu,
  parking,
  staircase,
}: {
  plotMode: Map2DPlotMode;
  plotLength: number;
  plotWidth: number;
  tracedArea: number;
  houseType: Map2DHouseType;
  bathrooms: number;
  planStyle: Map2DPlanStyle;
  vastu: boolean;
  parking: boolean;
  staircase: boolean;
}) {
  const plotArea = plotMode === 'trace' ? tracedArea : plotLength * plotWidth;
  const enabledSystems = [vastu, parking, staircase].filter(Boolean).length;
  const planningScore = Math.min(98, Math.round(62 + enabledSystems * 8 + (planStyle === 'premium' ? 10 : planStyle === 'family' ? 7 : 4) + bathrooms * 2));

  return (
    <section className="living-surface mb-6 overflow-hidden rounded-lg border border-cyan-300/15 bg-slate-950/75 p-4 shadow-2xl shadow-cyan-950/20">
      <div className="live-grid absolute inset-0 opacity-20" />
      <div className="relative z-10 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {[
              `${plotMode === 'trace' ? 'Traced' : 'Rectangle'} plot`,
              houseType.toUpperCase(),
              `${bathrooms} Bath`,
              planStyle,
            ].map(item => (
              <span key={item} className="rounded-full border border-cyan-300/15 bg-cyan-300/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-cyan-100">
                {item}
              </span>
            ))}
          </div>
          <h2 className="mt-4 text-2xl font-black text-white">Live planning cockpit</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Every input updates this readiness view before generation, so users feel the plan forming instead of filling a static form.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {[
              [Math.round(plotArea).toLocaleString('en-IN'), 'plot sq ft'],
              [`${planningScore}%`, 'planning readiness'],
              [`${enabledSystems}/3`, 'assist systems'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
                <p className="text-xl font-black text-white">{value}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-cyan-300/15 bg-black/20 p-3">
          <svg viewBox="0 0 120 86" className="h-40 w-full">
            <defs>
              <linearGradient id="previewFill" x1="0" x2="1" y1="0" y2="1">
                <stop stopColor="#22d3ee" stopOpacity="0.32" />
                <stop offset="1" stopColor="#f59e0b" stopOpacity="0.18" />
              </linearGradient>
            </defs>
            <rect width="120" height="86" rx="6" fill="rgba(2,6,23,0.72)" />
            <path d="M18 13 L84 8 L105 31 L96 72 L29 77 L13 49 Z" fill="url(#previewFill)" stroke="#67e8f9" strokeWidth="1.4" />
            <path d="M18 13 L84 8 L105 31 L96 72 L29 77 L13 49 Z" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="0.45" />
            <path d="M18 35 H104 M28 14 V76 M61 10 V74 M84 28 H101 M84 49 H99" stroke="rgba(255,255,255,0.38)" strokeWidth="0.8" />
            <circle cx="24" cy="23" r="4" fill={parking ? '#34d399' : '#334155'} />
            <circle cx="52" cy="23" r="4" fill={vastu ? '#fbbf24' : '#334155'} />
            <circle cx="90" cy="62" r="4" fill={staircase ? '#a78bfa' : '#334155'} />
          </svg>
        </div>
      </div>
    </section>
  );
}

export default function Map2DGenerator() {
  const router = useRouter();
  const [plotMode, setPlotMode] = useState<Map2DPlotMode>('rectangle');
  const [plotLength, setPlotLength] = useState(60);
  const [plotWidth, setPlotWidth] = useState(40);
  const [plotPolygon, setPlotPolygon] = useState<Map2DPoint[]>([
    { x: 3, y: 4 },
    { x: 38, y: 0 },
    { x: 40, y: 52 },
    { x: 30, y: 60 },
    { x: 0, y: 56 },
  ]);
  const [boundaryImage, setBoundaryImage] = useState<string | null>(null);
  const [detectingBoundary, setDetectingBoundary] = useState(false);
  const [roadSide, setRoadSide] = useState<RoadSide>('north');
  const [houseType, setHouseType] = useState<Map2DHouseType>('3bhk');
  const [bathrooms, setBathrooms] = useState(2);
  const [planStyle, setPlanStyle] = useState<Map2DPlanStyle>('family');
  const [aiBrief, setAiBrief] = useState('airy family home with private bedrooms, premium living room, clean circulation');
  const [vastu, setVastu] = useState(true);
  const [parking, setParking] = useState(true);
  const [staircase, setStaircase] = useState(true);
  const [city, setCity] = useState('Lucknow');
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const addTracePoint = (event: MouseEvent<SVGSVGElement>) => {
    if (plotMode !== 'trace') return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * plotWidth;
    const y = ((event.clientY - rect.top) / rect.height) * plotLength;
    setPlotPolygon(points => [...points, { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) }]);
  };

  const undoTracePoint = () => {
    setPlotPolygon(points => points.slice(0, -1));
  };

  const resetTrace = () => {
    setPlotPolygon([
      { x: plotWidth * 0.08, y: plotLength * 0.06 },
      { x: plotWidth * 0.95, y: 0 },
      { x: plotWidth, y: plotLength * 0.86 },
      { x: plotWidth * 0.72, y: plotLength },
      { x: 0, y: plotLength * 0.92 },
    ]);
  };

  const uploadBoundary = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setBoundaryImage(typeof reader.result === 'string' ? reader.result : null);
      setPlotMode('trace');
    };
    reader.readAsDataURL(file);
  };

  const autoDetectBoundary = () => {
    if (!boundaryImage) {
      setError('Upload a plot boundary image first.');
      return;
    }

    setDetectingBoundary(true);
    setError(null);

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const size = 360;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setDetectingBoundary(false);
        setError('Could not read uploaded image.');
        return;
      }

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      const ratio = Math.min(size / image.width, size / image.height);
      const drawWidth = image.width * ratio;
      const drawHeight = image.height * ratio;
      const drawX = (size - drawWidth) / 2;
      const drawY = (size - drawHeight) / 2;
      ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);

      const data = ctx.getImageData(0, 0, size, size).data;

      fetch('/api/map2d/detect-boundary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: Array.from(data),
          imageWidth: size,
          imageHeight: size,
          plotWidth,
          plotLength,
        }),
      })
        .then(async response => {
          const payload = await response.json();
          if (!response.ok || !payload.success) {
            throw new Error(payload.error || 'OpenCV could not detect the boundary.');
          }
          setPlotPolygon(payload.points as Map2DPoint[]);
        })
        .catch(err => {
          setError(err instanceof Error ? err.message : 'OpenCV boundary detection failed.');
        })
        .finally(() => setDetectingBoundary(false));
    };

    image.onerror = () => {
      setDetectingBoundary(false);
      setError('Could not load uploaded image.');
    };
    image.src = boundaryImage;
  };

  const generate = async () => {
    setError(null);
    setGenerating(true);
    const input: Map2DInput = {
      plotMode,
      plotLength,
      plotWidth,
      plotPolygon: plotMode === 'trace' ? plotPolygon : undefined,
      roadSide,
      houseType,
      bedrooms: houseType === '3bhk' ? 3 : 2,
      bathrooms,
      planStyle,
      aiBrief,
      vastu,
      parking,
      staircase,
      city,
    };

    try {
      let enhancedInput = input;
      try {
        const response = await fetch('/api/map2d/ai-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });
        const payload = await response.json();
        if (response.ok && payload.success && payload.aiPlan) {
          enhancedInput = { ...input, aiPlan: payload.aiPlan };
        }
      } catch {
        enhancedInput = input;
      }

      const layout = generateMap2DLayout(enhancedInput);
      sessionStorage.setItem(MAP2D_STORAGE_KEY, JSON.stringify(layout));
      window.setTimeout(() => {
        router.push('/dashboard/2d-map-generator/result');
      }, 1250);
    } catch (err) {
      setGenerating(false);
      setError(err instanceof Error ? err.message : 'Could not generate layout.');
    }
  };

  const svgPoints = plotPolygon
    .map(point => `${(point.x / Math.max(plotWidth, 1)) * 100},${(point.y / Math.max(plotLength, 1)) * 100}`)
    .join(' ');
  const tracedArea = Math.abs(
    plotPolygon.reduce((total, point, index) => {
      const next = plotPolygon[(index + 1) % plotPolygon.length];
      return total + point.x * next.y - next.x * point.y;
    }, 0) / 2
  );

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
              {['Analyzing boundary with AI', 'Choosing a unique planning strategy', 'Preparing futuristic JPEG renderer'].map(item => (
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

      <LivePlanningPreview
        plotMode={plotMode}
        plotLength={plotLength}
        plotWidth={plotWidth}
        tracedArea={tracedArea}
        houseType={houseType}
        bathrooms={bathrooms}
        planStyle={planStyle}
        vastu={vastu}
        parking={parking}
        staircase={staircase}
      />

      <div className="rounded-lg border border-white/10 bg-slate-950/70 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-2">
          <section className="lg:col-span-2">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200">
              <MapPinned size={17} className="text-cyan-200" /> Plot input mode
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                { value: 'rectangle' as const, title: 'Rectangle plot', desc: 'Fastest mode for regular plots.' },
                { value: 'trace' as const, title: 'Trace irregular plot', desc: 'Click boundary points for real-world plot shapes.' },
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPlotMode(option.value)}
                  className={classNames(
                    'living-surface rounded-lg border p-4 text-left transition-all',
                    glowClass('cyan', plotMode === option.value)
                  )}
                >
                  <span className="block text-sm font-bold">{option.title}</span>
                  <span className="mt-1 block text-xs leading-5">{option.desc}</span>
                </button>
              ))}
            </div>
          </section>

          <NumberField label="Plot length" value={plotLength} onChange={setPlotLength} helper="Depth of plot in feet." />
          <NumberField label="Plot width" value={plotWidth} onChange={setPlotWidth} helper="Frontage width in feet." />

          {plotMode === 'trace' && (
            <section className="lg:col-span-2 rounded-lg border border-cyan-300/15 bg-cyan-300/[0.035] p-4">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold text-cyan-50">
                    <ImagePlus size={17} className="text-cyan-200" /> Upload irregular boundary
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Upload a clear plot image. Auto Nirman detects the outer boundary, then you can refine it with clicks if needed.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-semibold text-cyan-50 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-200/70 hover:bg-cyan-300/15 hover:shadow-[0_0_24px_rgba(34,211,238,0.22)]">
                    <ImagePlus size={14} /> Upload
                    <input type="file" accept="image/*" onChange={uploadBoundary} className="hidden" />
                  </label>
                  <button
                    type="button"
                    onClick={autoDetectBoundary}
                    disabled={detectingBoundary}
                    className="inline-flex items-center gap-2 rounded-lg border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs font-semibold text-emerald-50 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200/70 hover:bg-emerald-300/15 hover:shadow-[0_0_24px_rgba(52,211,153,0.22)] disabled:opacity-60"
                  >
                    <Wand2 size={14} /> {detectingBoundary ? 'Detecting' : 'Auto detect'}
                  </button>
                  <button type="button" onClick={undoTracePoint} className="inline-flex items-center gap-2 rounded-lg border border-violet-300/15 bg-violet-300/5 px-3 py-2 text-xs font-semibold text-violet-100 transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-300/60 hover:bg-violet-300/12 hover:shadow-[0_0_22px_rgba(167,139,250,0.20)]">
                    <Undo2 size={14} /> Undo
                  </button>
                  <button type="button" onClick={resetTrace} className="rounded-lg border border-rose-300/15 bg-rose-300/5 px-3 py-2 text-xs font-semibold text-rose-100 transition-all duration-300 hover:-translate-y-0.5 hover:border-rose-300/60 hover:bg-rose-300/12 hover:shadow-[0_0_22px_rgba(251,113,133,0.18)]">
                    Reset
                  </button>
                </div>
              </div>

              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                onClick={addTracePoint}
                className="h-72 w-full cursor-crosshair rounded-lg border border-cyan-300/20 bg-slate-950/80"
              >
                <defs>
                  <pattern id="trace-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(125,211,252,0.14)" strokeWidth="0.35" />
                  </pattern>
                </defs>
                {boundaryImage && (
                  <image href={boundaryImage} x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid meet" opacity="0.38" />
                )}
                <rect width="100" height="100" fill="url(#trace-grid)" />
                {plotPolygon.length > 2 && (
                  <polygon points={svgPoints} fill="rgba(34,211,238,0.12)" stroke="#67e8f9" strokeWidth="1.1" vectorEffect="non-scaling-stroke" />
                )}
                {plotPolygon.map((point, index) => (
                  <g key={`${point.x}-${point.y}-${index}`}>
                    <circle cx={(point.x / plotWidth) * 100} cy={(point.y / plotLength) * 100} r="1.6" fill="#fbbf24" vectorEffect="non-scaling-stroke" />
                    <text x={(point.x / plotWidth) * 100 + 2} y={(point.y / plotLength) * 100 + 2} fill="#e0f2fe" fontSize="3" fontWeight="700">
                      {index + 1}
                    </text>
                  </g>
                ))}
              </svg>

              <div className="mt-3 grid gap-2 text-xs text-slate-400 sm:grid-cols-3">
                <div className="rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2">
                  Points: <span className="font-bold text-white">{plotPolygon.length}</span>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2">
                  Approx area: <span className="font-bold text-white">{Math.round(tracedArea).toLocaleString('en-IN')} sq ft</span>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2">
                  Road: <span className="font-bold uppercase text-white">{roadSide}</span>
                </div>
              </div>
              <p className="mt-3 flex items-center gap-2 text-xs leading-5 text-slate-500">
                <MousePointer2 size={14} className="text-cyan-200" /> If detection misses the edge, click around the visible boundary to add correction points.
              </p>
            </section>
          )}

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
                  'living-surface rounded-lg border p-3 text-left text-sm font-semibold uppercase tracking-[0.12em]',
                    glowClass(side === 'north' || side === 'east' ? 'cyan' : 'amber', roadSide === side)
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
                    'living-surface rounded-lg border p-4 text-left text-lg font-bold uppercase',
                    glowClass('emerald', houseType === type)
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </section>

          <section className="lg:col-span-2 grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
            <div>
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200">
                <Ruler size={17} className="text-cyan-200" /> Bathrooms
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map(count => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setBathrooms(count)}
                    className={classNames(
                      'living-surface rounded-lg border p-3 text-center text-lg font-bold',
                      glowClass('violet', bathrooms === count)
                    )}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200">
                <Sparkles size={17} className="text-cyan-200" /> Planning style
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                {[
                  { value: 'compact' as const, label: 'Compact', desc: 'More rooms in less area.' },
                  { value: 'family' as const, label: 'Family', desc: 'Balanced living and bedrooms.' },
                  { value: 'premium' as const, label: 'Premium', desc: 'Larger lounge and cleaner zoning.' },
                ].map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPlanStyle(option.value)}
                    className={classNames(
                      'living-surface rounded-lg border p-3 text-left transition-all',
                      glowClass(option.value === 'premium' ? 'violet' : option.value === 'compact' ? 'amber' : 'emerald', planStyle === option.value)
                    )}
                  >
                    <span className="block text-sm font-bold">{option.label}</span>
                    <span className="mt-1 block text-xs leading-5">{option.desc}</span>
                  </button>
                ))}
              </div>
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

          <label className="lg:col-span-2 rounded-lg border border-cyan-300/15 bg-cyan-300/[0.035] p-4">
            <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
              <Sparkles size={15} /> AI design brief
            </span>
            <textarea
              value={aiBrief}
              onChange={event => setAiBrief(event.target.value)}
              rows={3}
              className="w-full resize-none bg-transparent text-sm font-medium leading-6 text-white outline-none placeholder:text-slate-600"
              placeholder="Example: modern open kitchen, private master bedroom, puja near entry, more daylight, less corridor..."
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
                  'living-surface flex min-h-20 items-center gap-3 rounded-lg border p-4 text-left transition-all',
                  glowClass(label === 'Vastu assist' ? 'amber' : label === 'Parking bay' ? 'emerald' : 'violet', value)
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
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-400 px-5 py-3.5 text-sm font-bold text-slate-950 shadow-[0_0_34px_rgba(34,211,238,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:from-cyan-200 hover:via-sky-200 hover:to-blue-300 hover:shadow-[0_0_48px_rgba(56,189,248,0.42)] disabled:translate-y-0 disabled:opacity-60"
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
