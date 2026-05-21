import { NextResponse } from 'next/server';
import { postToBackend } from '@/lib/backend';
import { AUTO_NIRMAN_MAP_SYSTEM_PROMPT, GROQ_CACHE_MODEL, getGroqCachedTokens } from '@/lib/groqPrompts';
import type { Map2DAIPlan, Map2DInput } from '@/types/map2d';

function fallbackPlan(input: Map2DInput): Map2DAIPlan {
  const premium = input.planStyle === 'premium';
  const compact = input.planStyle === 'compact';

  return {
    conceptTitle: premium ? 'Premium Family Flow' : compact ? 'Compact Smart Core' : 'Balanced Family Plan',
    strategy: premium ? 'premium_family' : compact ? 'compact_core' : 'open_living',
    roomEmphasis: premium ? 'living' : compact ? 'bedrooms' : 'balanced',
    recommendedRooms: [
      `${input.bedrooms ?? (input.houseType === '3bhk' ? 3 : 2)} bedrooms`,
      `${input.bathrooms ?? 2} bathrooms`,
      input.parking ? 'covered parking' : 'larger living frontage',
      input.staircase ? 'edge staircase' : 'single-floor circulation',
    ],
    rooms: [],
    designNotes: [
      input.plotMode === 'trace' ? 'AI detected an irregular plot and recommends using the cleanest internal buildable zone.' : 'AI recommends a clean rectangular planning grid.',
      input.vastu ? 'Kitchen and utility should stay biased toward the south-east service zone.' : 'Room placement can prioritize daylight and compact circulation.',
      premium ? 'Give the living/dining zone more breathing space and keep bedroom entries more private.' : 'Keep plumbing grouped so bathrooms and utility do not fragment the plan.',
    ],
    scoreAdjustments: {
      efficiency: compact ? 3 : premium ? -2 : 1,
      circulation: premium ? 4 : 1,
      daylight: input.roadSide === 'north' || input.roadSide === 'east' ? 2 : 0,
    },
  };
}

function parseAIJson(content: string) {
  const clean = content.replace(/```json|```/g, '').trim();
  const match = clean.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : clean) as Map2DAIPlan;
}

function sanitizePlan(plan: Map2DAIPlan, input: Map2DInput): Map2DAIPlan {
  const fallback = fallbackPlan(input);
  const validStrategies = ['open_living', 'privacy_first', 'compact_core', 'premium_family'];
  const validEmphasis = ['living', 'bedrooms', 'balanced'];

  return {
    conceptTitle: typeof plan.conceptTitle === 'string' && plan.conceptTitle.trim() ? plan.conceptTitle.slice(0, 48) : fallback.conceptTitle,
    strategy: validStrategies.includes(plan.strategy) ? plan.strategy : fallback.strategy,
    roomEmphasis: validEmphasis.includes(plan.roomEmphasis) ? plan.roomEmphasis : fallback.roomEmphasis,
    recommendedRooms: Array.isArray(plan.recommendedRooms) ? plan.recommendedRooms.slice(0, 8).map(String) : fallback.recommendedRooms,
    rooms: Array.isArray(plan.rooms)
      ? plan.rooms.slice(0, 12).map(room => ({
          label: String(room.label ?? 'Room').slice(0, 32),
          type: ['living', 'kitchen', 'bedroom', 'bath', 'parking', 'stair', 'dining', 'utility', 'circulation', 'court', 'balcony', 'store'].includes(room.type) ? room.type : 'living',
          x: Number(room.x),
          y: Number(room.y),
          width: Number(room.width),
          height: Number(room.height),
        }))
      : fallback.rooms,
    designNotes: Array.isArray(plan.designNotes) ? plan.designNotes.slice(0, 5).map(note => String(note).slice(0, 150)) : fallback.designNotes,
    scoreAdjustments: plan.scoreAdjustments ?? fallback.scoreAdjustments,
  };
}

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as Map2DInput;
    const backendResult = await postToBackend('/api/v1/map2d/ai-plan', input);

    if (backendResult) {
      return NextResponse.json(backendResult);
    }

    const polygon = input.plotPolygon;
    const bounds = polygon?.length
      ? polygon.reduce(
          (acc, point) => ({
            minX: Math.min(acc.minX, point.x),
            minY: Math.min(acc.minY, point.y),
            maxX: Math.max(acc.maxX, point.x),
            maxY: Math.max(acc.maxY, point.y),
          }),
          { minX: Number.POSITIVE_INFINITY, minY: Number.POSITIVE_INFINITY, maxX: 0, maxY: 0 }
        )
      : { minX: 0, minY: 0, maxX: input.plotWidth, maxY: input.plotLength };

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ success: true, aiPlan: fallbackPlan(input), source: 'fallback' });
    }

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_CACHE_MODEL,
        temperature: 0.35,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: AUTO_NIRMAN_MAP_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: JSON.stringify({
              plotMode: input.plotMode,
              plotLength: input.plotLength,
              plotWidth: input.plotWidth,
              polygon: input.plotPolygon,
              buildableCoordinateBox: bounds,
              roadSide: input.roadSide,
              houseType: input.houseType,
              bedrooms: input.bedrooms,
              bathrooms: input.bathrooms,
              planStyle: input.planStyle,
              vastu: input.vastu,
              parking: input.parking,
              staircase: input.staircase,
              city: input.city,
              userBrief: input.aiBrief,
            }),
          },
        ],
      }),
    });

    const data = await groqRes.json();
    const content = data?.choices?.[0]?.message?.content;
    const cache = getGroqCachedTokens(data);
    console.log('Groq map cache usage:', cache);

    if (!groqRes.ok || !content) {
      return NextResponse.json({ success: true, aiPlan: fallbackPlan(input), source: 'fallback' });
    }

    return NextResponse.json({ success: true, aiPlan: sanitizePlan(parseAIJson(content), input), source: 'groq', cache });
  } catch {
    return NextResponse.json({ success: false, error: 'AI map planning failed.' }, { status: 500 });
  }
}
