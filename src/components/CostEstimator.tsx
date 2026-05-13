'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart3,
  Building2,
  Car,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  Gauge,
  Home,
  IndianRupee,
  Layers3,
  MapPin,
  Ruler,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sun,
  TrendingUp,
} from 'lucide-react'
import { useEstimator } from '../lib/useEstimator'
import { formatINR } from '../lib/estimator'
import type { CityTier, EstimateInput, EstimateResult, Floors, HouseType, Quality } from '../types/estimator'

export const ESTIMATE_STORAGE_KEY = 'auto_nirman_cost_estimate'

type StoredEstimate = {
  input: EstimateInput
  result: EstimateResult
  createdAt: string
}

const tierOptions: { value: CityTier; label: string; note: string; accent: string }[] = [
  { value: 'metro', label: 'Metro', note: 'Mumbai, Delhi, Bengaluru', accent: 'from-cyan-300 to-blue-400' },
  { value: 'tier1', label: 'Tier 1', note: 'Pune, Hyderabad, Chennai', accent: 'from-emerald-300 to-cyan-300' },
  { value: 'tier2', label: 'Tier 2', note: 'Lucknow, Jaipur, Indore', accent: 'from-amber-300 to-orange-400' },
  { value: 'tier3', label: 'Tier 3', note: 'Smaller cities and rural', accent: 'from-slate-300 to-slate-500' },
]

const qualityOptions: { value: Quality; label: string; note: string; marker: string }[] = [
  { value: 'basic', label: 'Basic', note: 'Lean shell, practical finishes', marker: 'Value' },
  { value: 'standard', label: 'Standard', note: 'Balanced branded materials', marker: 'Popular' },
  { value: 'premium', label: 'Premium', note: 'High-end fixtures and finishes', marker: 'Luxury' },
]

const houseTypeOptions: { value: HouseType; label: string; note: string }[] = [
  { value: 'independent', label: 'Independent', note: 'Typical residential build' },
  { value: 'villa', label: 'Villa', note: 'Higher facade and finish load' },
  { value: 'row', label: 'Row house', note: 'Efficient shared-edge planning' },
]

const floorOptions: { value: Floors; label: string; note: string }[] = [
  { value: 1, label: 'Ground', note: 'Single level' },
  { value: 2, label: 'G + 1', note: 'Two levels' },
  { value: 3, label: 'G + 2', note: 'Three levels' },
  { value: 4, label: 'G + 3', note: 'Four levels' },
]

type AddonKey = 'basement' | 'parking' | 'lift' | 'vastu' | 'solarReady'

const addonOptions: { key: AddonKey; label: string; note: string; Icon: typeof Car }[] = [
  { key: 'basement', label: 'Basement', note: 'Excavation and retaining work', Icon: Layers3 },
  { key: 'parking', label: 'Covered parking', note: 'Roofed bay and paving', Icon: Car },
  { key: 'lift', label: 'Lift core', note: 'Shaft and equipment allowance', Icon: Building2 },
  { key: 'vastu', label: 'Vastu review', note: 'Layout compliance allowance', Icon: ShieldCheck },
  { key: 'solarReady', label: 'Solar ready', note: 'Conduit and roof provision', Icon: Sun },
]

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function NumberField({ label, value, onChange, error, suffix, helper, Icon }: {
  label: string
  value: number
  onChange: (value: number) => void
  error?: boolean
  suffix: string
  helper: string
  Icon: typeof Ruler
}) {
  return (
    <label className="block rounded-lg border border-white/10 bg-slate-950/70 p-4 transition-colors focus-within:border-cyan-300/70 focus-within:bg-slate-950">
      <span className="mb-3 flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
          <Icon size={15} className="text-cyan-200" /> {label}
        </span>
        <span className="text-xs text-slate-600">{suffix}</span>
      </span>
      <input
        type="number"
        min={200}
        value={value}
        onChange={event => onChange(Number(event.target.value))}
        className={classNames(
          'w-full bg-transparent text-3xl font-bold tracking-normal text-white outline-none [appearance:textfield] placeholder:text-slate-700',
          error && 'text-rose-100'
        )}
      />
      <span className={classNames('mt-2 block text-xs leading-5', error ? 'text-rose-200' : 'text-slate-500')}>{helper}</span>
    </label>
  )
}

function SectionHeader({ eyebrow, title, Icon }: { eyebrow: string; title: string; Icon: typeof Home }) {
  return (
    <div className="mb-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{eyebrow}</p>
      <h3 className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-100">
        <Icon size={17} className="text-cyan-200" /> {title}
      </h3>
    </div>
  )
}

function ChoiceCard({ active, label, note, marker, onClick }: {
  active: boolean
  label: string
  note?: string
  marker?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        'group min-h-20 rounded-lg border p-3 text-left transition-all',
        active
          ? 'border-cyan-300/70 bg-cyan-300/10 shadow-[0_0_0_1px_rgba(103,232,249,0.18),0_18px_45px_rgba(8,47,73,0.22)]'
          : 'border-white/10 bg-white/[0.035] hover:border-white/25 hover:bg-white/[0.055]'
      )}
    >
      <span className="flex items-start justify-between gap-3">
        <span>
          <span className="block text-sm font-semibold text-white">{label}</span>
          {note && <span className="mt-1 block text-xs leading-5 text-slate-500">{note}</span>}
        </span>
        <span className={classNames(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors',
          active ? 'border-cyan-200 bg-cyan-200 text-slate-950' : 'border-white/15 text-transparent group-hover:border-white/30'
        )}>
          <Check size={13} strokeWidth={3} />
        </span>
      </span>
      {marker && (
        <span className={classNames(
          'mt-3 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold',
          active ? 'border-cyan-200/30 bg-cyan-200/10 text-cyan-100' : 'border-white/10 text-slate-500'
        )}>
          {marker}
        </span>
      )}
    </button>
  )
}

function AddonTile({ active, label, note, Icon, onClick }: {
  active: boolean
  label: string
  note: string
  Icon: typeof Car
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        'flex min-h-24 items-start gap-3 rounded-lg border p-3 text-left transition-all',
        active
          ? 'border-emerald-300/50 bg-emerald-300/10 text-emerald-50'
          : 'border-white/10 bg-white/[0.035] text-slate-300 hover:border-white/25 hover:bg-white/[0.055]'
      )}
    >
      <span className={classNames(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border',
        active ? 'border-emerald-200/30 bg-emerald-200/10 text-emerald-100' : 'border-white/10 bg-slate-950/60 text-slate-400'
      )}>
        <Icon size={18} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-white">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-slate-500">{note}</span>
      </span>
    </button>
  )
}

function RangeTrack({ result }: { result: EstimateResult }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
        <span>Low</span>
        <span>Most likely</span>
        <span>High</span>
      </div>
      <div className="relative h-3 rounded-full bg-slate-800">
        <div className="absolute inset-y-0 left-0 w-full rounded-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-amber-300" />
        <div className="absolute left-1/2 top-1/2 h-6 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.5)]" />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
        <span className="font-semibold text-emerald-100">{formatINR(result.low)}</span>
        <span className="text-center font-semibold text-white">{formatINR(result.totalCost)}</span>
        <span className="text-right font-semibold text-amber-100">{formatINR(result.high)}</span>
      </div>
    </div>
  )
}

export function CostEstimateResult({ stored }: { stored: StoredEstimate }) {
  const { input, result } = stored
  const maxPct = useMemo(() => Math.max(1, ...result.breakdown.map(item => item.percentage)), [result])

  const downloadSummary = () => {
    const lines = [
      'Auto Nirman Cost Estimate',
      `Total: ${formatINR(result.totalCost)}`,
      `Range: ${formatINR(result.low)} - ${formatINR(result.high)}`,
      `Per sq ft: Rs ${result.costPerSqft.toLocaleString('en-IN')}`,
      `Timeline: ${result.timelineMonths} months`,
      '',
      'Breakdown:',
      ...result.breakdown.map(item => `${item.label}: ${formatINR(item.amount)} (${item.percentage}%)`),
      '',
      'Assumptions:',
      ...result.assumptions.map(item => `- ${item}`),
    ]

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'auto-nirman-cost-estimate.txt'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
            <Sparkles size={14} /> Estimate dossier
          </div>
          <h1 className="max-w-4xl text-4xl font-bold tracking-normal text-white sm:text-6xl">
            Your construction cost view is ready.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Built from {input.builtSqft.toLocaleString('en-IN')} sq ft across {input.floors} floor{input.floors > 1 ? 's' : ''}, using {result.cityLabel} pricing assumptions.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => window.location.assign('/dashboard/cost-estimator')}
            className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-white/25 hover:bg-white/[0.07]"
          >
            Edit inputs
          </button>
          <button
            type="button"
            onClick={downloadSummary}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-cyan-200"
          >
            <Download size={16} /> Export summary
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="overflow-hidden rounded-lg border border-white/10 bg-slate-950/80 shadow-2xl shadow-black/40">
          <div className="border-b border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.16),rgba(16,185,129,0.08),rgba(245,158,11,0.10))] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">Estimated project cost</p>
            <h2 className="mt-2 text-6xl font-bold tracking-normal text-white">{formatINR(result.totalCost)}</h2>
            <p className="mt-3 text-sm text-slate-300">{result.cityLabel} benchmark - {result.timelineMonths} month build window</p>
          </div>
          <div className="space-y-5 p-6">
            <RangeTrack result={result} />
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
                <IndianRupee size={18} className="text-cyan-200" />
                <p className="mt-3 text-xs text-slate-500">Per sq ft</p>
                <p className="mt-1 text-xl font-semibold text-white">Rs {result.costPerSqft.toLocaleString('en-IN')}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
                <Clock3 size={18} className="text-amber-200" />
                <p className="mt-3 text-xs text-slate-500">Timeline</p>
                <p className="mt-1 text-xl font-semibold text-white">{result.timelineMonths} mo</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
                <Gauge size={18} className="text-emerald-200" />
                <p className="mt-3 text-xs text-slate-500">Band</p>
                <p className="mt-1 text-xl font-semibold text-white">+/- {result.confidencePct}%</p>
              </div>
            </div>
            {result.addonCost > 0 && (
              <div className="rounded-lg border border-amber-300/25 bg-amber-300/10 px-4 py-3 text-sm text-amber-50">
                Add-ons allowance: <span className="font-semibold">{formatINR(result.addonCost)}</span>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-white/10 bg-slate-950/75 p-6 shadow-2xl shadow-black/40">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Cost stack</p>
              <h2 className="mt-1 text-2xl font-semibold text-white">Trade-wise distribution</h2>
            </div>
            <BarChart3 className="text-cyan-200" size={24} />
          </div>
          <div className="space-y-3">
            {result.breakdown.map(item => (
              <div key={item.key} className="rounded-lg border border-white/10 bg-white/[0.025] p-4">
                <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                  <span className="font-medium text-slate-300">{item.label}</span>
                  <span className="font-semibold text-white">{formatINR(item.amount)}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.max(8, (item.percentage / maxPct) * 100)}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-lg border border-white/10 bg-slate-950/70 p-6">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Assumptions</p>
        <div className="grid gap-3 md:grid-cols-2">
          {result.assumptions.map(item => (
            <div key={item} className="flex gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm leading-6 text-slate-400">
              <CheckCircle2 className="mt-1 shrink-0 text-cyan-300" size={15} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default function CostEstimator({ apiUrl }: { apiUrl?: string }) {
  const router = useRouter()
  const [plotSqft, setPlotSqft] = useState(1200)
  const [builtSqft, setBuiltSqft] = useState(900)
  const [floors, setFloors] = useState<Floors>(2)
  const [houseType, setHouseType] = useState<HouseType>('independent')
  const [cityTier, setCityTier] = useState<CityTier>('tier2')
  const [citySlug, setCitySlug] = useState('')
  const [quality, setQuality] = useState<Quality>('standard')
  const [addons, setAddons] = useState<Record<AddonKey, boolean>>({
    basement: false,
    parking: true,
    lift: false,
    vastu: false,
    solarReady: false,
  })

  const { loading, error, fieldError, calculate } = useEstimator(apiUrl)
  const coverage = Math.max(0, Math.round((builtSqft / Math.max(plotSqft, 1)) * 100))

  const input: EstimateInput = {
    plotSqft,
    builtSqft,
    floors,
    houseType,
    cityTier,
    citySlug: citySlug || undefined,
    quality,
    ...addons,
  }

  const handleSubmit = async () => {
    const nextResult = await calculate(input)
    if (!nextResult) return

    const payload: StoredEstimate = {
      input,
      result: nextResult,
      createdAt: new Date().toISOString(),
    }

    sessionStorage.setItem(ESTIMATE_STORAGE_KEY, JSON.stringify(payload))
    router.push('/dashboard/cost-estimator/result')
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-7 grid gap-5 lg:grid-cols-[1fr_360px] lg:items-end">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
            <Sparkles size={14} /> Auto Nirman estimating studio
          </div>
          <h1 className="max-w-4xl text-4xl font-bold tracking-normal text-white sm:text-6xl">
            Build cost clarity before the first site visit.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Enter the project profile here. The full estimate opens separately as a clean result dossier.
          </p>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Current input profile</p>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xl font-bold text-white">{builtSqft.toLocaleString('en-IN')}</p>
              <p className="mt-1 text-xs text-slate-500">built sq ft</p>
            </div>
            <div>
              <p className="text-xl font-bold text-white">{coverage}%</p>
              <p className="mt-1 text-xs text-slate-500">coverage</p>
            </div>
            <div>
              <p className="text-xl font-bold text-white">{floors}</p>
              <p className="mt-1 text-xs text-slate-500">floors</p>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-white/10 bg-slate-950/70 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="border-b border-white/10 bg-white/[0.035] px-5 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Input console</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Project specification</h2>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-200/20 bg-cyan-200/10 text-cyan-100">
              <SlidersHorizontal size={20} />
            </div>
          </div>
        </div>

        <div className="grid gap-7 p-5 sm:p-6 lg:grid-cols-2">
          <section>
            <SectionHeader eyebrow="01 - Area" title="Site and built-up area" Icon={Ruler} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <NumberField label="Plot area" value={plotSqft} onChange={setPlotSqft} suffix="sq ft" helper="Total plot area available for planning." error={fieldError === 'plotSqft'} Icon={Ruler} />
              <NumberField label="Built-up area" value={builtSqft} onChange={setBuiltSqft} suffix="sq ft" helper="Chargeable construction area across floors." error={fieldError === 'builtSqft'} Icon={Home} />
            </div>
            {error && (
              <div className="mt-4 rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            )}
          </section>

          <section>
            <SectionHeader eyebrow="02 - Structure" title="Floors and house type" Icon={Layers3} />
            <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
              <div className="grid grid-cols-2 gap-2">
                {floorOptions.map(option => (
                  <ChoiceCard key={option.value} active={floors === option.value} label={option.label} note={option.note} onClick={() => setFloors(option.value)} />
                ))}
              </div>
              <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
                {houseTypeOptions.map(option => (
                  <ChoiceCard key={option.value} active={houseType === option.value} label={option.label} note={option.note} onClick={() => setHouseType(option.value)} />
                ))}
              </div>
            </div>
          </section>

          <section>
            <SectionHeader eyebrow="03 - Market" title="Location benchmark" Icon={MapPin} />
            <div className="grid gap-2 sm:grid-cols-2">
              {tierOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setCityTier(option.value)}
                  className={classNames(
                    'rounded-lg border p-3 text-left transition-all',
                    cityTier === option.value ? 'border-cyan-300/70 bg-cyan-300/10' : 'border-white/10 bg-white/[0.035] hover:border-white/25'
                  )}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span>
                      <span className="block text-sm font-semibold text-white">{option.label}</span>
                      <span className="mt-1 block text-xs text-slate-500">{option.note}</span>
                    </span>
                    <span className={`h-8 w-1.5 rounded-full bg-gradient-to-b ${option.accent}`} />
                  </span>
                </button>
              ))}
            </div>
            <input
              type="text"
              value={citySlug}
              onChange={event => setCitySlug(event.target.value)}
              placeholder="Optional city override, e.g. Lucknow, Pune, Mumbai"
              className="mt-3 w-full rounded-lg border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-cyan-300/70"
            />
          </section>

          <section>
            <SectionHeader eyebrow="04 - Specification" title="Material quality" Icon={TrendingUp} />
            <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {qualityOptions.map(option => (
                <ChoiceCard key={option.value} active={quality === option.value} label={option.label} note={option.note} marker={option.marker} onClick={() => setQuality(option.value)} />
              ))}
            </div>
          </section>

          <section className="lg:col-span-2">
            <SectionHeader eyebrow="05 - Scope" title="Optional add-ons" Icon={CheckCircle2} />
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {addonOptions.map(({ key, label, note, Icon }) => (
                <AddonTile
                  key={key}
                  active={addons[key]}
                  label={label}
                  note={note}
                  Icon={Icon}
                  onClick={() => setAddons(current => ({ ...current, [key]: !current[key] }))}
                />
              ))}
            </div>
          </section>
        </div>

        <div className="border-t border-white/10 bg-black/20 p-5 sm:p-6">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-300 px-5 py-3.5 text-sm font-bold text-slate-950 transition-colors hover:bg-cyan-200 disabled:cursor-wait disabled:opacity-70"
          >
            {loading ? 'Calculating estimate...' : 'Generate estimate and open result'}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
