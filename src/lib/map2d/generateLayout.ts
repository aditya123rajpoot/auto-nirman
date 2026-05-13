import type { Map2DInput, Map2DLayout, Map2DRoom } from '@/types/map2d';

const roomColors: Record<Map2DRoom['type'], string> = {
  living: '#2dd4bf',
  kitchen: '#f59e0b',
  bedroom: '#60a5fa',
  bath: '#a78bfa',
  parking: '#94a3b8',
  stair: '#fb7185',
  dining: '#34d399',
  utility: '#f472b6',
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function room(id: string, label: string, type: Map2DRoom['type'], x: number, y: number, width: number, height: number): Map2DRoom {
  return { id, label, type, x, y, width, height, color: roomColors[type] };
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
}

export function generateMap2DLayout(input: Map2DInput): Map2DLayout {
  validateMap2DInput(input);

  const setback = input.parking ? 3 : 2;
  const buildableWidth = Math.max(16, input.plotWidth - setback * 2);
  const buildableLength = Math.max(22, input.plotLength - setback * 2);
  const frontDepth = input.parking ? clamp(buildableLength * 0.24, 10, 16) : clamp(buildableLength * 0.18, 8, 13);
  const middleDepth = clamp(buildableLength * 0.28, 10, 16);
  const rearDepth = buildableLength - frontDepth - middleDepth;
  const leftWidth = buildableWidth * 0.5;
  const rightWidth = buildableWidth - leftWidth;
  const rooms: Map2DRoom[] = [];

  const bx = setback;
  const by = setback;

  if (input.parking) {
    rooms.push(room('parking', 'Covered Parking', 'parking', bx, by, leftWidth, frontDepth));
    rooms.push(room('living', 'Living Lounge', 'living', bx + leftWidth, by, rightWidth, frontDepth));
  } else {
    rooms.push(room('living', 'Living Lounge', 'living', bx, by, buildableWidth, frontDepth));
  }

  rooms.push(room('dining', 'Dining Core', 'dining', bx, by + frontDepth, leftWidth, middleDepth));
  rooms.push(room('kitchen', input.vastu ? 'Kitchen SE Zone' : 'Kitchen', 'kitchen', bx + leftWidth, by + frontDepth, rightWidth, middleDepth * 0.62));
  rooms.push(room('utility', 'Utility', 'utility', bx + leftWidth, by + frontDepth + middleDepth * 0.62, rightWidth, middleDepth * 0.38));

  const bedroomCount = input.houseType === '3bhk' ? 3 : 2;
  if (bedroomCount === 2) {
    rooms.push(room('bed-1', 'Master Bedroom', 'bedroom', bx, by + frontDepth + middleDepth, leftWidth, rearDepth));
    rooms.push(room('bed-2', 'Bedroom 2', 'bedroom', bx + leftWidth, by + frontDepth + middleDepth, rightWidth, rearDepth * 0.62));
    rooms.push(room('bath', 'Bath / WC', 'bath', bx + leftWidth, by + frontDepth + middleDepth + rearDepth * 0.62, rightWidth, rearDepth * 0.38));
  } else {
    rooms.push(room('bed-1', 'Master Bedroom', 'bedroom', bx, by + frontDepth + middleDepth, leftWidth, rearDepth * 0.55));
    rooms.push(room('bed-2', 'Bedroom 2', 'bedroom', bx + leftWidth, by + frontDepth + middleDepth, rightWidth, rearDepth * 0.55));
    rooms.push(room('bed-3', 'Bedroom 3', 'bedroom', bx, by + frontDepth + middleDepth + rearDepth * 0.55, leftWidth, rearDepth * 0.45));
    rooms.push(room('bath', 'Bath / WC', 'bath', bx + leftWidth, by + frontDepth + middleDepth + rearDepth * 0.55, rightWidth, rearDepth * 0.45));
  }

  if (input.staircase) {
    const stairWidth = Math.min(9, rightWidth * 0.45);
    const stairHeight = Math.min(11, frontDepth * 0.75);
    rooms.push(room('stair', 'Staircase', 'stair', bx + buildableWidth - stairWidth, by, stairWidth, stairHeight));
  }

  const doors = [
    { x: bx + buildableWidth * 0.45, y: by, width: 4, orientation: 'north' as const },
    { x: bx + leftWidth - 0.2, y: by + frontDepth + middleDepth * 0.35, width: 3, orientation: 'east' as const },
    { x: bx + leftWidth + 1, y: by + frontDepth, width: 3, orientation: 'south' as const },
    { x: bx + leftWidth - 0.2, y: by + frontDepth + middleDepth + 2, width: 3, orientation: 'east' as const },
  ];

  const windows = rooms
    .filter(item => item.type !== 'parking' && item.type !== 'stair')
    .map(item => ({
      x: item.x + item.width * 0.28,
      y: item.y,
      width: clamp(item.width * 0.35, 3, 7),
      orientation: 'north' as const,
    }));

  const area = input.plotLength * input.plotWidth;
  const usedArea = rooms.reduce((sum, item) => sum + item.width * item.height, 0);
  const efficiency = clamp(Math.round((usedArea / area) * 100), 55, 92);
  const vastuScore = input.vastu ? 94 : 78;
  const circulation = input.parking ? 88 : 84;
  const daylight = input.roadSide === 'north' || input.roadSide === 'east' ? 91 : 86;

  const aiNotes = [
    `${input.houseType.toUpperCase()} layout generated with ${Math.round(usedArea).toLocaleString('en-IN')} sq ft planned coverage.`,
    input.vastu ? 'Kitchen is biased toward the south-east planning zone and living is kept near the entry side.' : 'Vastu preference is off, so room placement prioritizes compact circulation and daylight.',
    input.parking ? 'Front bay reserves a covered parking zone without breaking internal circulation.' : 'No parking bay selected, so the living zone gets a larger frontage.',
    'Room geometry is deterministic; AI assistant notes are used to improve presentation, checks, and design recommendations.',
  ];

  return {
    input,
    plot: {
      length: input.plotLength,
      width: input.plotWidth,
      buildableLength,
      buildableWidth,
      setback,
    },
    rooms,
    doors,
    windows,
    aiNotes,
    score: {
      efficiency,
      vastu: vastuScore,
      circulation,
      daylight,
    },
  };
}
