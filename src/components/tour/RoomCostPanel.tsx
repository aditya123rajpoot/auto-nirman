'use client';

import { IndianRupee } from 'lucide-react';
import type { InteriorTier } from '@/data/interiorTiers';

export type TourRoom = {
  id: string;
  name: string;
  type: 'living' | 'bedroom' | 'kitchen' | 'bathroom';
  width: number;
  length: number;
  areaSqFt: number;
};

function formatINR(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function RoomCostPanel({
  room,
  tier,
  totalCost,
}: {
  room: TourRoom;
  tier: InteriorTier;
  totalCost: number;
}) {
  const roomCost = room.areaSqFt * tier.costPerSqFt;

  return (
    <div className="rounded-lg border border-amber-200/15 bg-amber-100/[0.045] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Selected room</p>
          <h2 className="mt-2 text-2xl font-black text-white">{room.name}</h2>
          <p className="mt-1 text-sm text-slate-400">
            {room.width}' x {room.length}' · {room.areaSqFt.toLocaleString('en-IN')} sq ft
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-amber-200/20 bg-amber-200/10 text-amber-100">
          <IndianRupee size={20} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-white/10 bg-black/20 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Tier</p>
          <p className="mt-1 text-sm font-black text-white">{tier.name}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/20 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Rate</p>
          <p className="mt-1 text-sm font-black text-white">Rs {tier.costPerSqFt.toLocaleString('en-IN')}/sq ft</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/20 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Room cost</p>
          <p className="mt-1 text-sm font-black text-amber-100">{formatINR(roomCost)}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/20 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Total project</p>
          <p className="mt-1 text-sm font-black text-cyan-100">{formatINR(totalCost)}</p>
        </div>
      </div>
    </div>
  );
}
