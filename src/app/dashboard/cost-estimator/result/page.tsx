'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CostEstimateResult, ESTIMATE_STORAGE_KEY } from '@/components/CostEstimator'
import type { EstimateInput, EstimateResult } from '@/types/estimator'

type StoredEstimate = {
  input: EstimateInput
  result: EstimateResult
  createdAt: string
}

function EstimatorBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#05070b]">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(8,47,73,0.34),rgba(2,6,23,0.82)_42%,rgba(0,0,0,1))]" />
      <div className="absolute inset-0 opacity-[0.075] bg-[linear-gradient(rgba(125,211,252,0.65)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.65)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="absolute right-[-90px] top-24 h-[560px] w-[560px] rounded-full border border-cyan-200/10" />
      <div className="absolute right-24 top-36 h-72 w-[460px] rotate-[-6deg] border border-cyan-200/10 bg-cyan-200/[0.022]">
        <div className="absolute left-12 top-10 h-28 w-40 border border-cyan-200/10" />
        <div className="absolute bottom-12 right-14 h-24 w-56 border border-cyan-200/10" />
        <div className="absolute left-0 top-1/2 h-px w-full bg-cyan-200/10" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-cyan-200/10" />
      </div>
      <div className="absolute bottom-[-180px] left-[-120px] h-[480px] w-[480px] rounded-full bg-emerald-400/[0.045] blur-3xl" />
    </div>
  )
}

export default function CostEstimatorResultPage() {
  const [stored, setStored] = useState<StoredEstimate | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem(ESTIMATE_STORAGE_KEY)
    if (raw) {
      try {
        setStored(JSON.parse(raw) as StoredEstimate)
      } catch {
        setStored(null)
      }
    }
    setLoaded(true)
  }, [])

  if (!loaded) {
    return (
      <main className="relative min-h-screen pt-20 text-white">
        <EstimatorBackdrop />
        <div className="mx-auto max-w-4xl px-4 py-16 text-slate-400">Loading estimate...</div>
      </main>
    )
  }

  if (!stored) {
    return (
      <main className="relative min-h-screen pt-20 text-white">
        <EstimatorBackdrop />
        <div className="mx-auto max-w-3xl px-4 py-16">
          <div className="rounded-lg border border-white/10 bg-slate-950/75 p-8 text-center shadow-2xl shadow-black/40">
            <h1 className="text-3xl font-bold text-white">No estimate found</h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Generate a cost estimate first, then the full result dossier will open here.
            </p>
            <Link
              href="/dashboard/cost-estimator"
              className="mt-6 inline-flex rounded-lg bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-cyan-200"
            >
              Go to estimator
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen pt-20 text-white">
      <EstimatorBackdrop />
      <CostEstimateResult stored={stored} />
    </main>
  )
}
