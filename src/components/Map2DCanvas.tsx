'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, FileImage, LocateFixed, MapPinned } from 'lucide-react';
import type { Map2DLayout, Map2DPoint, Map2DRoom } from '@/types/map2d';

type Map2DCanvasProps = {
  layout: Map2DLayout;
};

type SvgViewport = {
  minX: number;
  minY: number;
  width: number;
  height: number;
  padding: number;
};

const roomStyle: Record<Map2DRoom['type'], { fill: string; fill2: string; stroke: string; glow: string; label: string }> = {
  living: { fill: '#22d3ee', fill2: '#0f766e', stroke: '#67e8f9', glow: '#22d3ee', label: 'Living' },
  kitchen: { fill: '#f59e0b', fill2: '#92400e', stroke: '#fbbf24', glow: '#f59e0b', label: 'Kitchen' },
  bedroom: { fill: '#60a5fa', fill2: '#1d4ed8', stroke: '#93c5fd', glow: '#60a5fa', label: 'Bedroom' },
  bath: { fill: '#c084fc', fill2: '#6d28d9', stroke: '#ddd6fe', glow: '#a78bfa', label: 'Bath' },
  parking: { fill: '#94a3b8', fill2: '#475569', stroke: '#cbd5e1', glow: '#94a3b8', label: 'Parking' },
  stair: { fill: '#fb7185', fill2: '#be123c', stroke: '#fda4af', glow: '#fb7185', label: 'Stair' },
  dining: { fill: '#34d399', fill2: '#047857', stroke: '#86efac', glow: '#34d399', label: 'Dining' },
  utility: { fill: '#f472b6', fill2: '#be185d', stroke: '#f9a8d4', glow: '#f472b6', label: 'Utility' },
  circulation: { fill: '#38bdf8', fill2: '#0369a1', stroke: '#7dd3fc', glow: '#38bdf8', label: 'Circulation' },
  court: { fill: '#a3e635', fill2: '#4d7c0f', stroke: '#bef264', glow: '#a3e635', label: 'Court' },
  balcony: { fill: '#22c55e', fill2: '#166534', stroke: '#86efac', glow: '#22c55e', label: 'Balcony' },
  store: { fill: '#e879f9', fill2: '#a21caf', stroke: '#f0abfc', glow: '#e879f9', label: 'Store' },
};

function pointsToString(points: Map2DPoint[]) {
  return points.map(point => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(' ');
}

function polygonArea(points: Map2DPoint[]) {
  if (points.length < 3) return 0;
  const sum = points.reduce((total, point, index) => {
    const next = points[(index + 1) % points.length];
    return total + point.x * next.y - next.x * point.y;
  }, 0);
  return Math.abs(sum) / 2;
}

function polygonCentroid(points: Map2DPoint[]) {
  if (!points.length) return { x: 0, y: 0 };
  const signed = points.reduce((sum, point, index) => {
    const next = points[(index + 1) % points.length];
    return sum + point.x * next.y - next.x * point.y;
  }, 0);
  if (Math.abs(signed) < 0.001) {
    return points.reduce((sum, point) => ({ x: sum.x + point.x / points.length, y: sum.y + point.y / points.length }), { x: 0, y: 0 });
  }
  let cx = 0;
  let cy = 0;
  points.forEach((point, index) => {
    const next = points[(index + 1) % points.length];
    const cross = point.x * next.y - next.x * point.y;
    cx += (point.x + next.x) * cross;
    cy += (point.y + next.y) * cross;
  });
  return { x: cx / (3 * signed), y: cy / (3 * signed) };
}

function pointInPolygon(point: Map2DPoint, polygon: Map2DPoint[]) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const pi = polygon[i];
    const pj = polygon[j];
    const intersects = (pi.y > point.y) !== (pj.y > point.y) && point.x < ((pj.x - pi.x) * (point.y - pi.y)) / ((pj.y - pi.y) || 0.00001) + pi.x;
    if (intersects) inside = !inside;
  }
  return inside;
}

function distanceToSegment(point: Map2DPoint, a: Map2DPoint, b: Map2DPoint) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (dx === 0 && dy === 0) return Math.hypot(point.x - a.x, point.y - a.y);
  const t = Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(point.x - (a.x + t * dx), point.y - (a.y + t * dy));
}

function minDistanceToEdges(point: Map2DPoint, polygon: Map2DPoint[]) {
  return polygon.reduce((min, current, index) => {
    const next = polygon[(index + 1) % polygon.length];
    return Math.min(min, distanceToSegment(point, current, next));
  }, Number.POSITIVE_INFINITY);
}

function visualCenter(points: Map2DPoint[]) {
  const centroid = polygonCentroid(points);
  if (pointInPolygon(centroid, points)) {
    const distance = minDistanceToEdges(centroid, points);
    if (distance > 1.2) return { point: centroid, clearance: distance };
  }

  const bounds = getBounds(points);
  const columns = 7;
  const rows = 7;
  let best = { point: centroid, clearance: -1 };
  for (let xIndex = 1; xIndex < columns; xIndex += 1) {
    for (let yIndex = 1; yIndex < rows; yIndex += 1) {
      const point = {
        x: bounds.minX + ((bounds.maxX - bounds.minX) * xIndex) / columns,
        y: bounds.minY + ((bounds.maxY - bounds.minY) * yIndex) / rows,
      };
      if (!pointInPolygon(point, points)) continue;
      const clearance = minDistanceToEdges(point, points);
      if (clearance > best.clearance) best = { point, clearance };
    }
  }
  return best.clearance > 0 ? best : { point: centroid, clearance: 0 };
}

function rectPoints(room: Map2DRoom): Map2DPoint[] {
  return [
    { x: room.x, y: room.y },
    { x: room.x + room.width, y: room.y },
    { x: room.x + room.width, y: room.y + room.height },
    { x: room.x, y: room.y + room.height },
  ];
}

function getRoomPoints(room: Map2DRoom) {
  return room.points?.length ? room.points : rectPoints(room);
}

function getBounds(points: Map2DPoint[]) {
  return points.reduce(
    (bounds, point) => ({
      minX: Math.min(bounds.minX, point.x),
      minY: Math.min(bounds.minY, point.y),
      maxX: Math.max(bounds.maxX, point.x),
      maxY: Math.max(bounds.maxY, point.y),
    }),
    { minX: Number.POSITIVE_INFINITY, minY: Number.POSITIVE_INFINITY, maxX: Number.NEGATIVE_INFINITY, maxY: Number.NEGATIVE_INFINITY }
  );
}

function createViewport(layout: Map2DLayout): SvgViewport {
  const plotPoints = layout.plot.polygon?.length ? layout.plot.polygon : [
    { x: 0, y: 0 },
    { x: layout.plot.width, y: 0 },
    { x: layout.plot.width, y: layout.plot.length },
    { x: 0, y: layout.plot.length },
  ];
  const roomPoints = layout.rooms.flatMap(room => getRoomPoints(room));
  const bounds = getBounds([...plotPoints, ...roomPoints]);
  const width = Math.max(12, bounds.maxX - bounds.minX);
  const height = Math.max(12, bounds.maxY - bounds.minY);
  const padding = Math.max(width, height) * 0.02;
  return {
    minX: bounds.minX - padding,
    minY: bounds.minY - padding,
    width: width + padding * 2,
    height: height + padding * 2,
    padding,
  };
}

function compactLabel(label: string) {
  return label
    .replace('Covered Parking', 'Parking')
    .replace('Living Lounge', 'Living')
    .replace('Dining Core', 'Dining')
    .replace('Kitchen SE Zone', 'Kitchen')
    .replace('Master Bedroom', 'Master')
    .replace('Bedroom 2', 'Bedroom')
    .replace('Bedroom 3', 'Bedroom')
    .replace('Bath / WC', 'Bath')
    .replace('Lobby / Passage', 'Lobby')
    .replace('Family Lobby', 'Lobby');
}

function shortRoomLabel(room: Map2DRoom) {
  const labels: Record<Map2DRoom['type'], string> = {
    living: 'Living',
    kitchen: 'Kitchen',
    bedroom: room.label.toLowerCase().includes('master') ? 'Master' : 'Bed',
    bath: 'Bath',
    parking: 'Park',
    stair: 'Stair',
    dining: 'Dining',
    utility: 'Utility',
    circulation: 'Lobby',
    court: 'Court',
    balcony: 'Balcony',
    store: 'Store',
  };
  return labels[room.type];
}

function roomCode(room: Map2DRoom, index?: number) {
  const map: Partial<Record<Map2DRoom['type'], string>> = {
    living: 'LV',
    kitchen: 'KT',
    bedroom: 'BR',
    bath: 'BA',
    parking: 'PK',
    stair: 'ST',
    dining: 'DN',
    utility: 'UT',
    circulation: 'LB',
    court: 'CT',
    balcony: 'BC',
    store: 'SR',
  };
  return `${map[room.type] ?? 'RM'}${typeof index === 'number' ? index + 1 : ''}`;
}

function wrapLabel(label: string, maxChars: number) {
  const words = label.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  words.forEach(word => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });
  if (current) lines.push(current);
  return lines.slice(0, 2);
}

function PlotBoundary({ layout }: { layout: Map2DLayout }) {
  const points = layout.plot.polygon?.length ? layout.plot.polygon : rectPoints({ x: 0, y: 0, width: layout.plot.width, height: layout.plot.length } as Map2DRoom);

  return (
    <g>
      <polygon points={pointsToString(points)} fill="url(#plot-shell)" stroke="#67e8f9" strokeWidth="0.48" filter="url(#boundaryGlow)" />
      <polygon points={pointsToString(points)} fill="none" stroke="rgba(255,255,255,0.42)" strokeWidth="0.12" />
    </g>
  );
}

function RoomLabel({ room, active }: { room: Map2DRoom; active: boolean }) {
  const points = getRoomPoints(room);
  const center = visualCenter(points);
  const area = room.areaSqft ?? polygonArea(points);
  const bounds = getBounds(points);
  const boxWidth = Math.max(0.1, bounds.maxX - bounds.minX);
  const boxHeight = Math.max(0.1, bounds.maxY - bounds.minY);
  const shortestSide = Math.min(boxWidth, boxHeight);
  const baseSize = Math.max(0.72, Math.min(2.35, Math.sqrt(Math.max(area, 1)) * 0.24, shortestSide * 0.18));
  const showDetails = area >= 118 && center.clearance >= baseSize * 2.2;
  const fullLabel = compactLabel(room.label);
  const baseLabel = fullLabel.length > Math.max(8, boxWidth * 0.9) ? shortRoomLabel(room) : fullLabel;
  const maxByWidth = (boxWidth * 0.62) / Math.max(baseLabel.length * 0.56, 1);
  const maxByHeight = boxHeight * 0.18;
  const maxByClearance = Math.max(0.55, center.clearance * 0.58);
  const labelSize = Math.max(0.58, Math.min(baseSize, maxByWidth, maxByHeight, maxByClearance));
  const showInlineDetails = showDetails && labelSize >= 1.05;
  const lines = [baseLabel.toUpperCase()];
  const labelY = center.point.y - (lines.length - 1) * labelSize * 0.5 - (showInlineDetails ? labelSize * 0.32 : 0);
  const detailY = labelY + lines.length * labelSize * 1.08 + labelSize * 0.38;

  return (
    <g className="pointer-events-none">
      <text
        x={center.point.x}
        y={labelY}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-white/92 font-black uppercase"
        filter="url(#labelGlow)"
        style={{ fontSize: labelSize, letterSpacing: 0 }}
      >
        {lines.map((line, lineIndex) => (
          <tspan key={`${line}-${lineIndex}`} x={center.point.x} dy={lineIndex === 0 ? 0 : labelSize * 1.08}>
            {line}
          </tspan>
        ))}
      </text>
      {showInlineDetails && (
        <text x={center.point.x} y={detailY} textAnchor="middle" className="fill-slate-200/72 font-bold" filter="url(#labelGlow)" style={{ fontSize: Math.max(1.15, labelSize * 0.48) }}>
          {room.dimensions ?? `${room.width.toFixed(1)}' x ${room.height.toFixed(1)}'`}
        </text>
      )}
      {active && (
        <circle cx={center.point.x} cy={center.point.y} r={Math.max(2.4, labelSize * 2.4)} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.14" />
      )}
    </g>
  );
}

function RoomPolygon({ room, selected, onSelect, index }: { room: Map2DRoom; selected: boolean; onSelect: (id: string) => void; index: number }) {
  const points = getRoomPoints(room);
  const style = roomStyle[room.type];
  const gradientId = `room-gradient-${room.id.replace(/[^a-z0-9]/gi, '-')}`;
  const glowId = `room-glow-${room.id.replace(/[^a-z0-9]/gi, '-')}`;
  const area = room.areaSqft ?? polygonArea(points);

  return (
    <g
      className="cursor-pointer transition-opacity duration-200"
      onMouseEnter={() => onSelect(room.id)}
      onFocus={() => onSelect(room.id)}
      tabIndex={0}
      aria-label={`${room.label}, ${Math.round(area)} square feet`}
    >
      <title>{`${roomCode(room, index)} - ${room.label}: ${Math.round(area)} sq ft`}</title>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={style.fill} stopOpacity="0.36" />
          <stop offset="58%" stopColor={style.fill2} stopOpacity="0.18" />
          <stop offset="100%" stopColor={style.fill} stopOpacity="0.08" />
        </linearGradient>
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation={selected ? '0.55' : '0.24'} floodColor={style.glow} floodOpacity={selected ? '0.64' : '0.28'} />
        </filter>
      </defs>
      <polygon
        points={pointsToString(points)}
        fill={`url(#${gradientId})`}
        stroke={style.stroke}
        strokeWidth={selected ? 0.42 : 0.22}
        filter={`url(#${glowId})`}
      />
      <polygon points={pointsToString(points)} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.07" />
      <polygon points={pointsToString(points)} fill="url(#roomSheen)" stroke="none" opacity={selected ? 0.6 : 0.32} />
      <RoomLabel room={room} active={selected} />
    </g>
  );
}

function BrandSignature({ viewport, logoDataUrl }: { viewport: SvgViewport; logoDataUrl: string | null }) {
  const unit = Math.max(viewport.width, viewport.height);
  const width = unit * 0.175;
  const height = unit * 0.082;
  const x = viewport.minX + viewport.width - viewport.padding * 0.6 - width;
  const y = viewport.minY + viewport.padding * 0.62;
  const logoSize = height * 0.44;
  const labelY = y + height * 0.28;
  const logoY = y + height * 0.68;
  const logoX = x + width / 2 - logoSize / 2;

  return (
    <g className="pointer-events-none">
      <rect x={x} y={y} width={width} height={height} rx={height * 0.22} fill="rgba(3,12,24,0.82)" stroke="rgba(103,232,249,0.38)" strokeWidth="0.1" filter="url(#signatureGlow)" />
      <text x={x + width / 2} y={labelY} textAnchor="middle" dominantBaseline="middle" className="fill-cyan-100/80 font-black uppercase tracking-[0.18em]" style={{ fontSize: height * 0.12 }}>
        Created by
      </text>
      <rect
        x={logoX - height * 0.075}
        y={logoY - logoSize / 2 - height * 0.055}
        width={logoSize + height * 0.15}
        height={logoSize + height * 0.11}
        rx={height * 0.1}
        fill="rgba(2,6,23,0.9)"
        stroke="rgba(103,232,249,0.62)"
        strokeWidth="0.07"
      />
      {logoDataUrl ? (
        <image href={logoDataUrl} x={logoX} y={logoY - logoSize / 2} width={logoSize} height={logoSize} preserveAspectRatio="xMidYMid meet" opacity="1" />
      ) : (
        <circle cx={x + width / 2} cy={logoY} r={logoSize * 0.34} fill="rgba(34,211,238,0.18)" stroke="#67e8f9" strokeWidth="0.12" />
      )}
    </g>
  );
}

function MetricsPanel({ layout }: { layout: Map2DLayout }) {
  const plannedArea = layout.rooms.reduce((sum, room) => sum + (room.areaSqft ?? room.width * room.height), 0);
  const efficiency = Math.round((plannedArea / Math.max(layout.plot.areaSqft, 1)) * 100);
  const topScore = Math.max(...Object.values(layout.score));
  const deadSpace = Math.max(0, Math.round(layout.plot.areaSqft - plannedArea));

  return (
    <div className="grid gap-2 sm:grid-cols-4">
      {[
        [`${efficiency}%`, 'Plan efficiency'],
        [`${topScore}%`, 'Top AI score'],
        [`${Math.round(plannedArea).toLocaleString('en-IN')}`, 'Used sq ft'],
        [`${deadSpace.toLocaleString('en-IN')}`, 'Open sq ft'],
      ].map(([value, label]) => (
        <div key={label} className="rounded-lg border border-cyan-300/10 bg-cyan-300/[0.045] p-3">
          <p className="text-lg font-black text-white">{value}</p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
        </div>
      ))}
    </div>
  );
}

function Legend({ rooms, selectedId, onSelect }: { rooms: Map2DRoom[]; selectedId: string | null; onSelect: (id: string) => void }) {
  const types = Array.from(new Set(rooms.map(room => room.type)));
  return (
    <div className="flex flex-wrap gap-2">
      {types.map(type => {
        const style = roomStyle[type];
        const id = rooms.find(room => room.type === type)?.id ?? type;
        return (
          <button
            key={type}
            type="button"
            onMouseEnter={() => onSelect(id)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${selectedId === id ? 'border-cyan-200 bg-cyan-300/15 text-cyan-50' : 'border-white/10 bg-white/[0.035] text-slate-400 hover:text-white'}`}
          >
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: style.fill }} />
            {style.label}
          </button>
        );
      })}
    </div>
  );
}

function RoomSchedule({ rooms, selectedId, onSelect }: { rooms: Map2DRoom[]; selectedId: string | null; onSelect: (id: string) => void }) {
  return (
    <div className="max-h-48 space-y-2 overflow-auto pr-1">
      {rooms.map((room, index) => {
        const style = roomStyle[room.type];
        return (
          <button
            key={room.id}
            type="button"
            onMouseEnter={() => onSelect(room.id)}
            className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-xs transition-colors ${selectedId === room.id ? 'border-cyan-300/40 bg-cyan-300/10' : 'border-white/10 bg-white/[0.03]'}`}
          >
            <span className="flex min-w-0 items-center gap-2 font-semibold text-slate-200">
              <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: style.fill }} />
              <span className="truncate">
                {room.label}
                <span className="ml-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">{roomCode(room, index)}</span>
              </span>
            </span>
            <span className="shrink-0 text-right text-slate-500">
              {Math.round(room.areaSqft ?? room.width * room.height)} sq ft
              <span className="block text-[10px]">{room.dimensions}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function SelectedRoomPanel({ room, index }: { room?: Map2DRoom; index?: number }) {
  if (!room) return null;
  const style = roomStyle[room.type];
  return (
    <div className="rounded-lg border border-cyan-300/15 bg-cyan-300/[0.045] p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Selected room</p>
      <div className="mt-2 flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-black text-white">{room.label}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{roomStyle[room.type].label} | {roomCode(room, index)}</p>
        </div>
        <span className="h-4 w-4 shrink-0 rounded-sm shadow-[0_0_18px_currentColor]" style={{ backgroundColor: style.fill, color: style.glow }} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-md border border-white/10 bg-black/20 p-2">
          <p className="font-black text-white">{Math.round(room.areaSqft ?? room.width * room.height)} sq ft</p>
          <p className="mt-1 uppercase tracking-[0.12em] text-slate-500">Area</p>
        </div>
        <div className="rounded-md border border-white/10 bg-black/20 p-2">
          <p className="font-black text-white">{room.dimensions ?? `${room.width.toFixed(1)}' x ${room.height.toFixed(1)}'`}</p>
          <p className="mt-1 uppercase tracking-[0.12em] text-slate-500">Clear span</p>
        </div>
      </div>
    </div>
  );
}

function PlotCanvas({ layout, selectedId, onSelect, svgRef, logoDataUrl }: { layout: Map2DLayout; selectedId: string | null; onSelect: (id: string) => void; svgRef: React.RefObject<SVGSVGElement | null>; logoDataUrl: string | null }) {
  const viewport = useMemo(() => createViewport(layout), [layout]);
  const plotPoints = layout.plot.polygon?.length ? layout.plot.polygon : rectPoints({ x: 0, y: 0, width: layout.plot.width, height: layout.plot.length } as Map2DRoom);

  return (
    <svg
      ref={svgRef}
      viewBox={`${viewport.minX} ${viewport.minY} ${viewport.width} ${viewport.height}`}
      preserveAspectRatio="xMidYMid meet"
      className="h-auto w-full rounded-md bg-[#050b14]"
      style={{ aspectRatio: `${viewport.width} / ${viewport.height}` }}
      role="img"
      aria-label="Auto Nirman polygon-based architectural floor plan"
    >
      <defs>
        <pattern id="blueprintGrid" width="4" height="4" patternUnits="userSpaceOnUse">
          <path d="M 4 0 L 0 0 0 4" fill="none" stroke="rgba(125,211,252,0.16)" strokeWidth="0.08" />
        </pattern>
        <pattern id="blueprintMicroGrid" width="1" height="1" patternUnits="userSpaceOnUse">
          <path d="M 1 0 L 0 0 0 1" fill="none" stroke="rgba(125,211,252,0.075)" strokeWidth="0.035" />
        </pattern>
        <linearGradient id="sheetLight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#061526" />
          <stop offset="48%" stopColor="#050b14" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
        <linearGradient id="roomSheen" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="44%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.06" />
        </linearGradient>
        <linearGradient id="plot-shell" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#155e75" stopOpacity="0.23" />
          <stop offset="58%" stopColor="#0f172a" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#020617" stopOpacity="0.78" />
        </linearGradient>
        <filter id="boundaryGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="0.9" floodColor="#22d3ee" floodOpacity="0.6" />
          <feDropShadow dx="0" dy="0.35" stdDeviation="0.25" floodColor="#000000" floodOpacity="0.5" />
        </filter>
        <filter id="labelGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="0.28" floodColor="#020617" floodOpacity="0.95" />
          <feDropShadow dx="0" dy="0" stdDeviation="0.12" floodColor="#67e8f9" floodOpacity="0.22" />
        </filter>
        <filter id="signatureGlow" x="-45%" y="-45%" width="190%" height="190%">
          <feDropShadow dx="0" dy="0" stdDeviation="0.28" floodColor="#67e8f9" floodOpacity="0.62" />
          <feDropShadow dx="0" dy="0.18" stdDeviation="0.22" floodColor="#000000" floodOpacity="0.7" />
        </filter>
        <clipPath id="plotClip">
          <polygon points={pointsToString(plotPoints)} />
        </clipPath>
      </defs>
      <rect x={viewport.minX} y={viewport.minY} width={viewport.width} height={viewport.height} fill="url(#sheetLight)" />
      <rect x={viewport.minX} y={viewport.minY} width={viewport.width} height={viewport.height} fill="url(#blueprintMicroGrid)" />
      <rect x={viewport.minX} y={viewport.minY} width={viewport.width} height={viewport.height} fill="url(#blueprintGrid)" opacity="0.72" />
      <PlotBoundary layout={layout} />
      <g clipPath="url(#plotClip)">
        {layout.rooms.map((room, index) => (
          <RoomPolygon key={room.id} room={room} selected={selectedId === room.id} onSelect={onSelect} index={index} />
        ))}
      </g>
      <BrandSignature viewport={viewport} logoDataUrl={logoDataUrl} />
    </svg>
  );
}

export default function Map2DCanvas({ layout }: Map2DCanvasProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(layout.rooms[0]?.id ?? null);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const selectedRoomIndex = Math.max(0, layout.rooms.findIndex(room => room.id === selectedId));
  const selectedRoom = layout.rooms[selectedRoomIndex] ?? layout.rooms[0];

  useEffect(() => {
    let mounted = true;
    fetch('/logo.png')
      .then(response => response.blob())
      .then(
        blob =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(blob);
          })
      )
      .then(dataUrl => {
        if (mounted) setLogoDataUrl(dataUrl);
      })
      .catch(() => {
        if (mounted) setLogoDataUrl(null);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const downloadJPEG = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const cloned = svg.cloneNode(true) as SVGSVGElement;
    cloned.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    cloned.setAttribute('width', '2400');
    cloned.setAttribute('height', '1350');
    cloned.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    const xml = new XMLSerializer().serializeToString(cloned);
    const svgBlob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 2400;
      canvas.height = 1350;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#050b14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/jpeg', 0.96);
      link.download = `auto-nirman-${layout.input.houseType}-polygon-plan.jpg`;
      link.click();
    };
    image.src = url;
  };

  return (
    <div className="overflow-hidden rounded-lg border border-cyan-300/20 bg-slate-950/80 shadow-2xl shadow-cyan-950/20">
      <div className="flex justify-center border-b border-white/10 bg-white/[0.018] px-4 py-3">
        <button
          type="button"
          onClick={downloadJPEG}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-100/40 bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.22)] transition-colors hover:bg-cyan-200"
        >
          <Download size={16} /> Download
        </button>
      </div>

      <div className="grid gap-4 p-3 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-lg border border-white/10 bg-black/20 p-2">
          <PlotCanvas layout={layout} selectedId={selectedId} onSelect={setSelectedId} svgRef={svgRef} logoDataUrl={logoDataUrl} />
        </div>
        <aside className="space-y-3">
          <SelectedRoomPanel room={selectedRoom} index={selectedRoomIndex} />
          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
            <p className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-cyan-100">
              <LocateFixed size={14} /> Efficiency metrics
            </p>
            <MetricsPanel layout={layout} />
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
            <p className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500">
              <MapPinned size={14} className="text-cyan-200" /> Legend
            </p>
            <Legend rooms={layout.rooms} selectedId={selectedId} onSelect={setSelectedId} />
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-slate-500">Room schedule</p>
            <RoomSchedule rooms={layout.rooms} selectedId={selectedId} onSelect={setSelectedId} />
          </div>
        </aside>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-white/10 px-4 py-3 text-xs text-slate-500">
        <FileImage size={14} className="text-cyan-200" />
        <span>Rooms are polygon-clipped to the plot boundary; hover rooms or legend items to inspect the architectural zoning.</span>
      </div>
    </div>
  );
}
