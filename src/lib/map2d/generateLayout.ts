import type { Map2DInput, Map2DLayout, Map2DPoint, Map2DRoom } from '@/types/map2d';

const roomColors: Record<Map2DRoom['type'], string> = {
  living: '#2dd4bf',
  kitchen: '#f59e0b',
  bedroom: '#60a5fa',
  bath: '#a78bfa',
  parking: '#94a3b8',
  stair: '#fb7185',
  dining: '#34d399',
  utility: '#f472b6',
  circulation: '#38bdf8',
  court: '#84cc16',
  balcony: '#22c55e',
  store: '#c084fc',
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function room(id: string, label: string, type: Map2DRoom['type'], x: number, y: number, width: number, height: number): Map2DRoom {
  return { id, label, type, x, y, width, height, color: roomColors[type] };
}

function overlapArea(a: Map2DRoom, b: Map2DRoom) {
  const x = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
  const y = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
  return x * y;
}

function roomBounds(rooms: Map2DRoom[]) {
  return rooms.reduce(
    (bounds, item) => ({
      minX: Math.min(bounds.minX, item.x),
      minY: Math.min(bounds.minY, item.y),
      maxX: Math.max(bounds.maxX, item.x + item.width),
      maxY: Math.max(bounds.maxY, item.y + item.height),
    }),
    { minX: Number.POSITIVE_INFINITY, minY: Number.POSITIVE_INFINITY, maxX: 0, maxY: 0 }
  );
}

function polygonArea(points: Map2DPoint[]) {
  if (points.length < 3) return 0;
  const sum = points.reduce((total, point, index) => {
    const next = points[(index + 1) % points.length];
    return total + point.x * next.y - next.x * point.y;
  }, 0);
  return Math.abs(sum) / 2;
}

function polygonBounds(points: Map2DPoint[]) {
  return points.reduce(
    (bounds, point) => ({
      minX: Math.min(bounds.minX, point.x),
      minY: Math.min(bounds.minY, point.y),
      maxX: Math.max(bounds.maxX, point.x),
      maxY: Math.max(bounds.maxY, point.y),
    }),
    { minX: Number.POSITIVE_INFINITY, minY: Number.POSITIVE_INFINITY, maxX: 0, maxY: 0 }
  );
}

function normalizePolygon(input: Map2DInput): Map2DPoint[] | undefined {
  if (input.plotMode !== 'trace') return undefined;
  return input.plotPolygon?.map(point => ({
    x: clamp(point.x, 0, input.plotWidth),
    y: clamp(point.y, 0, input.plotLength),
  }));
}

function fitRoomsToBuildableArea(rooms: Map2DRoom[], bounds: ReturnType<typeof polygonBounds>, setback: number) {
  const current = roomBounds(rooms);
  const currentWidth = Math.max(1, current.maxX - current.minX);
  const currentHeight = Math.max(1, current.maxY - current.minY);
  const targetX = bounds.minX + setback;
  const targetY = bounds.minY + setback;
  const targetWidth = Math.max(16, bounds.maxX - bounds.minX - setback * 2);
  const targetHeight = Math.max(22, bounds.maxY - bounds.minY - setback * 2);
  const scaleX = targetWidth / currentWidth;
  const scaleY = targetHeight / currentHeight;

  return rooms.map(item => ({
    ...item,
    x: targetX + (item.x - current.minX) * scaleX,
    y: targetY + (item.y - current.minY) * scaleY,
    width: item.width * scaleX,
    height: item.height * scaleY,
  }));
}

function createAIRooms(input: Map2DInput, bounds: ReturnType<typeof polygonBounds>, bedroomCount: number, bathroomCount: number, setback: number) {
  const aiRooms = input.aiPlan?.rooms;
  if (!aiRooms?.length) return null;

  const rooms = aiRooms
    .map((item, index) => room(
      `ai-${index + 1}`,
      item.label,
      item.type,
      Number(item.x),
      Number(item.y),
      Number(item.width),
      Number(item.height)
    ))
    .filter(item => (
      Number.isFinite(item.x) &&
      Number.isFinite(item.y) &&
      Number.isFinite(item.width) &&
      Number.isFinite(item.height) &&
      item.width >= 4 &&
      item.height >= 4 &&
      item.x >= bounds.minX &&
      item.y >= bounds.minY &&
      item.x + item.width <= bounds.maxX &&
      item.y + item.height <= bounds.maxY
    ));

  const bedrooms = rooms.filter(item => item.type === 'bedroom').length;
  const bathrooms = rooms.filter(item => item.type === 'bath').length;
  const hasLiving = rooms.some(item => item.type === 'living');
  const hasKitchen = rooms.some(item => item.type === 'kitchen');

  if (bedrooms < bedroomCount || bathrooms < bathroomCount || !hasLiving || !hasKitchen) return null;

  const totalOverlap = rooms.reduce((sum, current, index) => {
    const rest = rooms.slice(index + 1);
    return sum + rest.reduce((innerSum, next) => innerSum + overlapArea(current, next), 0);
  }, 0);
  const totalArea = rooms.reduce((sum, item) => sum + item.width * item.height, 0);

  if (totalArea <= 0 || totalOverlap / totalArea > 0.08) return null;

  return fitRoomsToBuildableArea(rooms, bounds, setback);
}

function addArchitecturalPockets(rooms: Map2DRoom[], input: Map2DInput, bounds: ReturnType<typeof polygonBounds>, setback: number) {
  const refined = [...rooms];
  const buildableX = bounds.minX + setback;
  const buildableY = bounds.minY + setback;
  const buildableWidth = Math.max(16, bounds.maxX - bounds.minX - setback * 2);
  const buildableLength = Math.max(22, bounds.maxY - bounds.minY - setback * 2);
  const occupied = roomBounds(refined);
  const centerX = buildableX + buildableWidth * 0.5;
  const centerY = buildableY + buildableLength * 0.5;

  const hasCirculation = refined.some(item => item.type === 'circulation');
  if (!hasCirculation) {
    const passageWidth = clamp(buildableWidth * 0.18, 4, 7);
    const passageHeight = clamp(buildableLength * 0.42, 10, 22);
    refined.push(room(
      'refine-lobby',
      input.planStyle === 'premium' ? 'Family Lobby' : 'Lobby / Passage',
      'circulation',
      centerX - passageWidth / 2,
      centerY - passageHeight / 2,
      passageWidth,
      passageHeight
    ));
  }

  const rightGap = buildableX + buildableWidth - occupied.maxX;
  if (rightGap > 4.5) {
    refined.push(room(
      'refine-court-east',
      input.planStyle === 'premium' ? 'Light Court' : 'Open Court',
      'court',
      occupied.maxX,
      buildableY + buildableLength * 0.2,
      rightGap,
      buildableLength * 0.52
    ));
  }

  const bottomGap = buildableY + buildableLength - occupied.maxY;
  if (bottomGap > 4.5) {
    refined.push(room(
      'refine-sitout-rear',
      input.roadSide === 'south' ? 'Front Sitout' : 'Rear Court',
      input.planStyle === 'premium' ? 'balcony' : 'court',
      buildableX + buildableWidth * 0.12,
      occupied.maxY,
      buildableWidth * 0.76,
      bottomGap
    ));
  }

  const topGap = occupied.minY - buildableY;
  if (topGap > 4.5) {
    refined.push(room(
      'refine-front-sitout',
      input.parking ? 'Entry Walkway' : 'Front Sitout',
      'balcony',
      buildableX + buildableWidth * 0.08,
      buildableY,
      buildableWidth * 0.84,
      topGap
    ));
  }

  const serviceRoom = refined.find(item => item.type === 'kitchen' || item.type === 'utility');
  if (serviceRoom && !refined.some(item => item.type === 'store')) {
    const storeWidth = clamp(serviceRoom.width * 0.42, 4, 6);
    const storeHeight = clamp(serviceRoom.height * 0.45, 4, 6);
    refined.push(room(
      'refine-store',
      'Store',
      'store',
      Math.min(serviceRoom.x + serviceRoom.width - storeWidth, buildableX + buildableWidth - storeWidth),
      Math.min(serviceRoom.y + serviceRoom.height, buildableY + buildableLength - storeHeight),
      storeWidth,
      storeHeight
    ));
  }

  return refined.filter(item => item.width >= 3 && item.height >= 3);
}

export function validateMap2DInput(input: Map2DInput) {
  if (!Number.isFinite(input.plotLength) || input.plotLength < 25) {
    throw new Error('Plot length should be at least 25 ft.');
  }

  if (!Number.isFinite(input.plotWidth) || input.plotWidth < 18) {
    throw new Error('Plot width should be at least 18 ft.');
  }

  if (input.plotLength > 160 || input.plotWidth > 120) {
    throw new Error('MVP supports plots up to 160 ft x 120 ft.');
  }

  if (input.plotMode === 'trace') {
    const polygon = normalizePolygon(input);
    if (!polygon || polygon.length < 4) {
      throw new Error('Trace at least 4 boundary points for irregular plot mode.');
    }

    if (polygonArea(polygon) < 450) {
      throw new Error('Traced plot area is too small for a useful layout.');
    }
  }
}

export function generateMap2DLayout(input: Map2DInput): Map2DLayout {
  validateMap2DInput(input);

  const polygon = normalizePolygon(input);
  const planStyle = input.planStyle ?? 'family';
  const aiPlan = input.aiPlan;
  const bedroomCount = input.bedrooms ?? (input.houseType === '3bhk' ? 3 : 2);
  const bathroomCount = clamp(input.bathrooms ?? (bedroomCount === 3 ? 2 : 1), 1, 3);
  const bounds = polygon ? polygonBounds(polygon) : { minX: 0, minY: 0, maxX: input.plotWidth, maxY: input.plotLength };
  const plotArea = polygon ? polygonArea(polygon) : input.plotLength * input.plotWidth;
  const availableWidth = Math.max(18, bounds.maxX - bounds.minX);
  const availableLength = Math.max(25, bounds.maxY - bounds.minY);
  const setback = input.parking ? 3 : 2;
  const buildableWidth = Math.max(16, availableWidth - setback * 2);
  const buildableLength = Math.max(22, availableLength - setback * 2);
  const styleBoost = aiPlan?.strategy === 'premium_family' || planStyle === 'premium' ? 1.14 : aiPlan?.strategy === 'compact_core' || planStyle === 'compact' ? 0.88 : 1;
  const livingBias = aiPlan?.roomEmphasis === 'living' ? 1.12 : aiPlan?.roomEmphasis === 'bedrooms' ? 0.92 : 1;
  const frontDepth = input.parking
    ? clamp(buildableLength * 0.24 * styleBoost * livingBias, 10, planStyle === 'premium' ? 20 : 17)
    : clamp(buildableLength * 0.18 * styleBoost * livingBias, 8, planStyle === 'premium' ? 17 : 14);
  const middleDepth = clamp(buildableLength * (planStyle === 'compact' ? 0.24 : 0.28) * livingBias, 9, planStyle === 'premium' ? 19 : 17);
  const rearDepth = buildableLength - frontDepth - middleDepth;
  const leftWidth = buildableWidth * 0.5;
  const rightWidth = buildableWidth - leftWidth;
  const rooms: Map2DRoom[] = [];

  const bx = bounds.minX + setback;
  const by = bounds.minY + setback;

  if (input.parking) {
    rooms.push(room('parking', 'Covered Parking', 'parking', bx, by, leftWidth, frontDepth));
    rooms.push(room('living', 'Living Lounge', 'living', bx + leftWidth, by, rightWidth, frontDepth));
  } else {
    rooms.push(room('living', 'Living Lounge', 'living', bx, by, buildableWidth, frontDepth));
  }

  rooms.push(room('dining', 'Dining Core', 'dining', bx, by + frontDepth, leftWidth, middleDepth));
  rooms.push(room('kitchen', input.vastu ? 'Kitchen SE Zone' : 'Kitchen', 'kitchen', bx + leftWidth, by + frontDepth, rightWidth, middleDepth * 0.62));
  rooms.push(room('utility', 'Utility', 'utility', bx + leftWidth, by + frontDepth + middleDepth * 0.62, rightWidth, middleDepth * 0.38));

  const bedroomZoneY = by + frontDepth + middleDepth;
  const bedRows = bedroomCount === 2 ? 2 : 3;
  const bedRowHeight = rearDepth / bedRows;
  const bathWidth = clamp(rightWidth * 0.42, 5, 8.5);
  const bedRightWidth = Math.max(7, rightWidth - bathWidth);

  rooms.push(room('bed-1', 'Master Bedroom', 'bedroom', bx, bedroomZoneY, leftWidth, bedroomCount === 2 ? rearDepth * 0.62 : bedRowHeight * 1.15));
  rooms.push(room('bed-2', 'Bedroom 2', 'bedroom', bx + leftWidth, bedroomZoneY, bathroomCount > 1 ? bedRightWidth : rightWidth, bathroomCount > 1 ? (bedroomCount === 2 ? rearDepth * 0.58 : bedRowHeight) : rearDepth * 0.58));

  if (bedroomCount >= 3) {
    rooms.push(room('bed-3', 'Bedroom 3', 'bedroom', bx, bedroomZoneY + bedRowHeight * 1.15, leftWidth, rearDepth - bedRowHeight * 1.15));
  }

  if (bathroomCount === 1) {
    rooms.push(room('bath-1', 'Bath / WC', 'bath', bx + leftWidth, bedroomZoneY + rearDepth * 0.58, rightWidth, rearDepth * 0.42));
  } else {
    const bathHeight = rearDepth / bathroomCount;
    for (let index = 0; index < bathroomCount; index += 1) {
      const y = bedroomZoneY + index * bathHeight;
      const label = index === 0 ? 'Attached Bath' : `Bath ${index + 1}`;
      rooms.push(room(`bath-${index + 1}`, label, 'bath', bx + leftWidth + bedRightWidth, y, bathWidth, bathHeight));
    }
  }

  if (input.staircase) {
    const stairWidth = Math.min(9, rightWidth * 0.45);
    const stairHeight = Math.min(11, frontDepth * 0.75);
    rooms.push(room('stair', 'Staircase', 'stair', bx + buildableWidth - stairWidth, by, stairWidth, stairHeight));
  }

  const aiRooms = createAIRooms(input, bounds, bedroomCount, bathroomCount, setback);
  const finalRooms = addArchitecturalPockets(aiRooms ?? rooms, input, bounds, setback);

  const doors = [
    { x: bx + buildableWidth * 0.45, y: by, width: 4, orientation: 'north' as const },
    { x: bx + leftWidth - 0.2, y: by + frontDepth + middleDepth * 0.35, width: 3, orientation: 'east' as const },
    { x: bx + leftWidth + 1, y: by + frontDepth, width: 3, orientation: 'south' as const },
    { x: bx + leftWidth - 0.2, y: by + frontDepth + middleDepth + 2, width: 3, orientation: 'east' as const },
  ];

  const windows = finalRooms
    .filter(item => item.type !== 'parking' && item.type !== 'stair')
    .map(item => ({
      x: item.x + item.width * 0.28,
      y: item.y,
      width: clamp(item.width * 0.35, 3, 7),
      orientation: 'north' as const,
    }));

  const usedArea = finalRooms.reduce((sum, item) => sum + item.width * item.height, 0);
  const scoreAdjustments = aiPlan?.scoreAdjustments ?? {};
  const efficiency = clamp(Math.round((usedArea / plotArea) * 100) + (scoreAdjustments.efficiency ?? 0), 55, input.plotMode === 'trace' ? 90 : 94);
  const vastuScore = clamp((input.vastu ? 94 : 78) + (scoreAdjustments.vastu ?? 0), 55, 98);
  const circulation = clamp((input.parking ? 88 : 84 + (planStyle === 'premium' ? 4 : 0)) + (scoreAdjustments.circulation ?? 0), 78, 96);
  const daylight = clamp((input.roadSide === 'north' || input.roadSide === 'east' ? 91 : 86) + (scoreAdjustments.daylight ?? 0), 78, 96);

  const aiNotes = [
    aiPlan ? `${aiPlan.conceptTitle}: ${aiPlan.strategy.replaceAll('_', ' ')} strategy applied.` : 'Rules-based planning strategy applied.',
    aiRooms ? 'AI-generated room coordinates passed Auto Nirman geometry validation and were used for this map.' : 'AI layout suggestion was reviewed; deterministic geometry was used where validation required safer placement.',
    `${bedroomCount} bedroom / ${bathroomCount} bathroom ${planStyle} layout generated with ${Math.round(usedArea).toLocaleString('en-IN')} sq ft planned coverage.`,
    input.plotMode === 'trace' ? `Irregular traced boundary detected with approx ${Math.round(plotArea).toLocaleString('en-IN')} sq ft plot area.` : 'Rectangular plot mode used for maximum coordinate precision.',
    ...(aiPlan?.designNotes?.length ? aiPlan.designNotes : [
      input.vastu ? 'Kitchen is biased toward the south-east planning zone and living is kept near the entry side.' : 'Vastu preference is off, so room placement prioritizes compact circulation and daylight.',
      input.parking ? 'Front bay reserves a covered parking zone without breaking internal circulation.' : 'No parking bay selected, so the living zone gets a larger frontage.',
      planStyle === 'premium' ? 'Premium planning increases lounge emphasis and reduces cramped room feel.' : planStyle === 'compact' ? 'Compact planning prioritizes fitting required rooms inside tighter plot geometry.' : 'Family planning balances shared spaces, bedrooms, and utility placement.',
    ]),
  ];

  return {
    input,
    plot: {
      length: input.plotLength,
      width: input.plotWidth,
      buildableLength,
      buildableWidth,
      setback,
      polygon,
      areaSqft: plotArea,
      bounds,
    },
    rooms: finalRooms,
    doors,
    windows,
    aiNotes,
    aiPlan,
    score: {
      efficiency,
      vastu: vastuScore,
      circulation,
      daylight,
    },
  };
}
