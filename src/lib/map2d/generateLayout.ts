import type { Map2DInput, Map2DLayout, Map2DPoint, Map2DRoom } from '@/types/map2d';

const roomColors: Record<Map2DRoom['type'], string> = {
  living: '#22d3ee',
  kitchen: '#f59e0b',
  bedroom: '#60a5fa',
  bath: '#c084fc',
  parking: '#94a3b8',
  stair: '#fb7185',
  dining: '#34d399',
  utility: '#f472b6',
  circulation: '#38bdf8',
  court: '#a3e635',
  balcony: '#22c55e',
  store: '#e879f9',
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

function polygonSignedArea(points: Map2DPoint[]) {
  if (points.length < 3) return 0;
  return points.reduce((total, point, index) => {
    const next = points[(index + 1) % points.length];
    return total + point.x * next.y - next.x * point.y;
  }, 0) / 2;
}

function rectToPolygon(item: Pick<Map2DRoom, 'x' | 'y' | 'width' | 'height'>): Map2DPoint[] {
  return [
    { x: item.x, y: item.y },
    { x: item.x + item.width, y: item.y },
    { x: item.x + item.width, y: item.y + item.height },
    { x: item.x, y: item.y + item.height },
  ];
}

function interpolateLine(a: Map2DPoint, b: Map2DPoint, t: number): Map2DPoint {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  };
}

function lineIntersection(a: Map2DPoint, b: Map2DPoint, edgeA: Map2DPoint, edgeB: Map2DPoint) {
  const dx1 = b.x - a.x;
  const dy1 = b.y - a.y;
  const dx2 = edgeB.x - edgeA.x;
  const dy2 = edgeB.y - edgeA.y;
  const denominator = dx1 * dy2 - dy1 * dx2;
  if (Math.abs(denominator) < 0.00001) return b;
  const t = ((edgeA.x - a.x) * dy2 - (edgeA.y - a.y) * dx2) / denominator;
  return interpolateLine(a, b, t);
}

function clipPolygon(subject: Map2DPoint[], clip: Map2DPoint[]) {
  if (subject.length < 3 || clip.length < 3) return [];
  const clockwise = polygonSignedArea(clip) < 0;
  let output = subject;

  for (let index = 0; index < clip.length; index += 1) {
    const edgeA = clip[index];
    const edgeB = clip[(index + 1) % clip.length];
    const input = output;
    output = [];
    if (!input.length) break;

    const inside = (point: Map2DPoint) => {
      const cross = (edgeB.x - edgeA.x) * (point.y - edgeA.y) - (edgeB.y - edgeA.y) * (point.x - edgeA.x);
      return clockwise ? cross <= 0.0001 : cross >= -0.0001;
    };

    let previous = input[input.length - 1];
    for (const current of input) {
      const currentInside = inside(current);
      const previousInside = inside(previous);

      if (currentInside) {
        if (!previousInside) output.push(lineIntersection(previous, current, edgeA, edgeB));
        output.push(current);
      } else if (previousInside) {
        output.push(lineIntersection(previous, current, edgeA, edgeB));
      }
      previous = current;
    }
  }

  return output.filter((point, index, points) => {
    const prev = points[(index + points.length - 1) % points.length];
    return !prev || Math.hypot(point.x - prev.x, point.y - prev.y) > 0.04;
  });
}

function scaledPolygon(points: Map2DPoint[], inset: number) {
  const center = points.reduce(
    (sum, point) => ({ x: sum.x + point.x / points.length, y: sum.y + point.y / points.length }),
    { x: 0, y: 0 }
  );
  const bounds = polygonBounds(points);
  const radius = Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY, 1);
  const factor = Math.max(0.82, 1 - inset / radius);
  return points.map(point => ({
    x: center.x + (point.x - center.x) * factor,
    y: center.y + (point.y - center.y) * factor,
  }));
}

function roomPolygonBounds(points: Map2DPoint[]) {
  return polygonBounds(points);
}

function enhanceRoomsWithPolygons(rooms: Map2DRoom[], plotPolygon: Map2DPoint[], fallbackBounds: ReturnType<typeof polygonBounds>) {
  return rooms
    .map(item => {
      const clipped = clipPolygon(rectToPolygon(item), plotPolygon);
      const points = clipped.length >= 3 ? clipped : clipPolygon(rectToPolygon(item), [
        { x: fallbackBounds.minX, y: fallbackBounds.minY },
        { x: fallbackBounds.maxX, y: fallbackBounds.minY },
        { x: fallbackBounds.maxX, y: fallbackBounds.maxY },
        { x: fallbackBounds.minX, y: fallbackBounds.maxY },
      ]);
      const areaSqft = polygonArea(points);
      const bounds = roomPolygonBounds(points);
      return {
        ...item,
        points,
        areaSqft,
        dimensions: `${Math.max(0, bounds.maxX - bounds.minX).toFixed(1)}' x ${Math.max(0, bounds.maxY - bounds.minY).toFixed(1)}'`,
      };
    })
    .filter(item => (item.areaSqft ?? 0) >= 18 && (item.points?.length ?? 0) >= 3);
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
  const hasCirculation = rooms.some(item => item.type === 'circulation');

  if (bedrooms < bedroomCount || bathrooms < bathroomCount || !hasLiving || !hasKitchen || !hasCirculation) return null;

  const practicalRooms = rooms.every(item => {
    if (item.type === 'bedroom') return item.width >= 8 && item.height >= 9 && item.width * item.height >= 80;
    if (item.type === 'living') return item.width >= 10 && item.height >= 10;
    if (item.type === 'kitchen') return item.width >= 7 && item.height >= 7;
    if (item.type === 'bath') return item.width >= 4 && item.height >= 5;
    if (item.type === 'circulation') return item.width >= 3.5 && item.height >= 8;
    return true;
  });

  if (!practicalRooms) return null;

  const totalOverlap = rooms.reduce((sum, current, index) => {
    const rest = rooms.slice(index + 1);
    return sum + rest.reduce((innerSum, next) => innerSum + overlapArea(current, next), 0);
  }, 0);
  const totalArea = rooms.reduce((sum, item) => sum + item.width * item.height, 0);
  const buildableArea = Math.max(1, (bounds.maxX - bounds.minX - setback * 2) * (bounds.maxY - bounds.minY - setback * 2));

  if (totalArea <= 0 || totalOverlap / totalArea > 0.08) return null;
  if (totalArea / buildableArea < 0.68 || totalArea / buildableArea > 1.04) return null;

  return fitRoomsToBuildableArea(rooms, bounds, setback);
}

function addArchitecturalPockets(rooms: Map2DRoom[], input: Map2DInput, bounds: ReturnType<typeof polygonBounds>, setback: number) {
  const refined = [...rooms];
  const buildableX = bounds.minX + setback;
  const buildableY = bounds.minY + setback;
  const buildableWidth = Math.max(16, bounds.maxX - bounds.minX - setback * 2);
  const buildableLength = Math.max(22, bounds.maxY - bounds.minY - setback * 2);
  const occupied = roomBounds(refined);

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
  const planningInset = 0;
  const buildableWidth = Math.max(16, availableWidth - planningInset * 2);
  const buildableLength = Math.max(22, availableLength - planningInset * 2);
  const styleBoost = aiPlan?.strategy === 'premium_family' || planStyle === 'premium' ? 1.14 : aiPlan?.strategy === 'compact_core' || planStyle === 'compact' ? 0.88 : 1;
  const livingBias = aiPlan?.roomEmphasis === 'living' ? 1.12 : aiPlan?.roomEmphasis === 'bedrooms' ? 0.92 : 1;
  const frontDepth = input.parking
    ? clamp(buildableLength * 0.24 * styleBoost * livingBias, 10, planStyle === 'premium' ? 20 : 17)
    : clamp(buildableLength * 0.18 * styleBoost * livingBias, 8, planStyle === 'premium' ? 17 : 14);
  const middleDepth = clamp(buildableLength * (planStyle === 'compact' ? 0.24 : 0.28) * livingBias, 9, planStyle === 'premium' ? 19 : 17);
  const rearDepth = buildableLength - frontDepth - middleDepth;
  const passageWidth = clamp(buildableWidth * (planStyle === 'premium' ? 0.16 : 0.13), 4, 5.8);
  const sideWidth = (buildableWidth - passageWidth) / 2;
  const leftWidth = sideWidth;
  const rightWidth = sideWidth;
  const rooms: Map2DRoom[] = [];

  const bx = bounds.minX + planningInset;
  const by = bounds.minY + planningInset;
  const passageX = bx + leftWidth;
  const rightX = passageX + passageWidth;
  const stairWidth = input.staircase ? clamp(buildableWidth * 0.22, 7, 8.5) : 0;
  const stairHeight = input.staircase ? Math.min(11, frontDepth * 0.74) : 0;
  const stairX = bx + buildableWidth - stairWidth;
  const parkingFrontWidth = input.parking ? clamp(buildableWidth * 0.34, 10, 13.5) : 0;
  const frontLivingX = input.parking ? bx + parkingFrontWidth : bx;
  const frontLivingWidth = Math.max(10, buildableWidth - parkingFrontWidth - stairWidth);

  if (input.parking) {
    rooms.push(room('parking', 'Covered Parking', 'parking', bx, by, parkingFrontWidth, frontDepth));
    rooms.push(room('living', 'Living Lounge', 'living', frontLivingX, by, frontLivingWidth, frontDepth));
  } else {
    rooms.push(room('living', 'Living Lounge', 'living', bx, by, input.staircase ? buildableWidth - stairWidth : buildableWidth, frontDepth));
  }

  if (input.staircase) {
    rooms.push(room('stair', 'Staircase', 'stair', stairX, by, stairWidth, stairHeight));
  }

  rooms.push(room('dining', 'Dining Core', 'dining', bx, by + frontDepth, leftWidth, middleDepth));
  rooms.push(room('lobby', planStyle === 'premium' ? 'Family Lobby' : 'Lobby / Passage', 'circulation', passageX, by + frontDepth, passageWidth, middleDepth + rearDepth));
  rooms.push(room('kitchen', input.vastu ? 'Kitchen SE Zone' : 'Kitchen', 'kitchen', rightX, by + frontDepth, rightWidth, middleDepth * 0.62));
  rooms.push(room('utility', 'Utility', 'utility', rightX, by + frontDepth + middleDepth * 0.62, rightWidth, middleDepth * 0.38));

  const bedroomZoneY = by + frontDepth + middleDepth;
  const bedRows = bedroomCount === 2 ? 2 : 3;
  const bedRowHeight = rearDepth / bedRows;
  const bathDepth = clamp(rearDepth / (bathroomCount + 1.6), 5.5, 8);

  rooms.push(room('bed-1', 'Master Bedroom', 'bedroom', bx, bedroomZoneY, leftWidth, bedroomCount === 2 ? rearDepth * 0.62 : bedRowHeight * 1.15));
  rooms.push(room('bed-2', 'Bedroom 2', 'bedroom', rightX, bedroomZoneY, rightWidth, bathroomCount > 1 ? Math.max(8, rearDepth - bathDepth * bathroomCount) : rearDepth * 0.58));

  if (bedroomCount >= 3) {
    rooms.push(room('bed-3', 'Bedroom 3', 'bedroom', bx, bedroomZoneY + bedRowHeight * 1.15, leftWidth, rearDepth - bedRowHeight * 1.15));
  }

  if (bathroomCount === 1) {
    rooms.push(room('bath-1', 'Bath / WC', 'bath', rightX, bedroomZoneY + rearDepth * 0.58, rightWidth, rearDepth * 0.42));
  } else {
    const bathHeight = Math.min(bathDepth, rearDepth / bathroomCount);
    for (let index = 0; index < bathroomCount; index += 1) {
      const y = bedroomZoneY + rearDepth - (bathroomCount - index) * bathHeight;
      const label = index === 0 ? 'Attached Bath' : `Bath ${index + 1}`;
      rooms.push(room(`bath-${index + 1}`, label, 'bath', rightX, y, rightWidth, bathHeight));
    }
  }

  const aiRooms = createAIRooms(input, bounds, bedroomCount, bathroomCount, planningInset);
  const rawRooms = addArchitecturalPockets(aiRooms ?? rooms, input, bounds, planningInset);
  const renderPolygon = polygon ?? [
    { x: bounds.minX, y: bounds.minY },
    { x: bounds.maxX, y: bounds.minY },
    { x: bounds.maxX, y: bounds.maxY },
    { x: bounds.minX, y: bounds.maxY },
  ];
  const buildablePolygon = input.plotMode === 'trace' && polygon ? polygon : [
    { x: bounds.minX, y: bounds.minY },
    { x: bounds.maxX, y: bounds.minY },
    { x: bounds.maxX, y: bounds.maxY },
    { x: bounds.minX, y: bounds.maxY },
  ];
  const finalRooms = enhanceRoomsWithPolygons(rawRooms, buildablePolygon, bounds);

  const doors = [
    { x: passageX + passageWidth * 0.5 - 2, y: by, width: 4, orientation: 'north' as const },
    { x: passageX - 0.15, y: by + frontDepth + middleDepth * 0.38, width: 3, orientation: 'east' as const },
    { x: rightX + rightWidth * 0.2, y: by + frontDepth, width: 3, orientation: 'south' as const },
    { x: passageX - 0.15, y: bedroomZoneY + 2, width: 3, orientation: 'east' as const },
    { x: rightX + rightWidth * 0.2, y: bedroomZoneY, width: 3, orientation: 'south' as const },
  ];

  const windows = finalRooms
    .filter(item => item.type !== 'parking' && item.type !== 'stair')
    .map(item => ({
      x: item.x + item.width * 0.28,
      y: item.y,
      width: clamp(item.width * 0.35, 3, 7),
      orientation: 'north' as const,
    }));

  const usedArea = finalRooms.reduce((sum, item) => sum + (item.areaSqft ?? item.width * item.height), 0);
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
      setback: planningInset,
      polygon: renderPolygon,
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
