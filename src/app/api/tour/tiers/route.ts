import { NextResponse } from 'next/server';
import { getFromBackend } from '@/lib/backend';
import { interiorTierList } from '@/data/interiorTiers';

export async function GET() {
  const backendResult = await getFromBackend('/api/v1/tour/tiers');

  if (backendResult) {
    return NextResponse.json(backendResult);
  }

  return NextResponse.json({ ok: true, tiers: interiorTierList });
}

