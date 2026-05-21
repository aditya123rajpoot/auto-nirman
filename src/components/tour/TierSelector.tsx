'use client';

import type { InteriorTier, InteriorTierId } from '@/data/interiorTiers';

type TierSelectorProps = {
  tiers: InteriorTier[];
  selectedTierId: InteriorTierId;
  onSelect: (tier: InteriorTierId) => void;
};

export default function TierSelector({ tiers, selectedTierId, onSelect }: TierSelectorProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
      <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-slate-500">Interior tier</p>
      <div className="grid gap-2">
        {tiers.map(tier => {
          const active = tier.id === selectedTierId;
          return (
            <button
              key={tier.id}
              type="button"
              onClick={() => onSelect(tier.id)}
              className={`living-surface rounded-lg border p-3 text-left transition-all hover:-translate-y-0.5 ${
                active
                  ? 'border-amber-200/50 bg-amber-200/10 shadow-[0_0_26px_rgba(251,191,36,0.14)]'
                  : 'border-white/10 bg-black/20 hover:border-white/25 hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-black text-white">{tier.name}</span>
                <span className={active ? 'text-xs font-black text-amber-100' : 'text-xs font-semibold text-slate-500'}>
                  Rs {tier.costPerSqFt.toLocaleString('en-IN')}/sq ft
                </span>
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-500">{tier.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
