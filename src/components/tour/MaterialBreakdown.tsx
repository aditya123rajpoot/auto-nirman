'use client';

import type { InteriorTier } from '@/data/interiorTiers';

export default function MaterialBreakdown({ tier }: { tier: InteriorTier }) {
  const rows = [
    ['Flooring', tier.materials.flooring],
    ['Walls', tier.materials.wallFinish],
    ['Ceiling', tier.materials.ceiling],
    ['Lighting', tier.materials.lighting],
    ['Kitchen', tier.materials.kitchenFittings],
    ['Bath', tier.materials.bathFittings],
  ];

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
      <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-slate-500">Material breakdown</p>
      <div className="space-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-white/10 bg-black/20 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
            <p className="mt-1 text-xs leading-5 text-slate-200">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
