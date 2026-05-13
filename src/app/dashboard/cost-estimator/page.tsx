import CostEstimator from '@/components/CostEstimator'

function EstimatorBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#05070b]">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(8,47,73,0.38),rgba(2,6,23,0.86)_45%,rgba(0,0,0,1))]" />
      <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(rgba(125,211,252,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.7)_1px,transparent_1px)] [background-size:44px_44px]" />
      <div className="absolute right-[-120px] top-20 h-[520px] w-[520px] rounded-full border border-cyan-200/10" />
      <div className="absolute right-16 top-40 h-64 w-96 rotate-[-8deg] border border-cyan-200/10 bg-cyan-200/[0.025]">
        <div className="absolute left-10 top-10 h-28 w-36 border border-cyan-200/10" />
        <div className="absolute bottom-12 right-12 h-20 w-48 border border-cyan-200/10" />
        <div className="absolute left-0 top-1/2 h-px w-full bg-cyan-200/10" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-cyan-200/10" />
      </div>
      <div className="absolute bottom-[-180px] left-[-120px] h-[460px] w-[460px] rounded-full bg-cyan-400/[0.06] blur-3xl" />
    </div>
  )
}

export default function CostEstimatorPage() {
  return (
    <main className="relative min-h-screen pt-20 text-white">
      <EstimatorBackdrop />
      <CostEstimator />
    </main>
  )
}
