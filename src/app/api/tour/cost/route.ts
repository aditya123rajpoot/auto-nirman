import { NextRequest, NextResponse } from 'next/server';
import { postToBackend } from '@/lib/backend';
import { interiorTiers, type InteriorTierId } from '@/data/interiorTiers';

type RoomCostPayload = {
  tierId: InteriorTierId;
  rooms: Array<{
    id: string;
    name: string;
    areaSqFt: number;
  }>;
};

export async function POST(req: NextRequest) {
  const input = (await req.json()) as RoomCostPayload;
  const backendResult = await postToBackend('/api/v1/tour/cost', input);

  if (backendResult) {
    return NextResponse.json(backendResult);
  }

  const tier = interiorTiers[input.tierId] ?? interiorTiers.premium;
  const rooms = input.rooms.map(room => ({
    ...room,
    cost: Math.round(room.areaSqFt * tier.costPerSqFt),
  }));

  return NextResponse.json({
    ok: true,
    tier,
    rooms,
    totalCost: rooms.reduce((sum, room) => sum + room.cost, 0),
  });
}

