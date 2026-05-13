'use client';

import { useEffect, useRef } from 'react';
import { Download } from 'lucide-react';
import type { Map2DLayout } from '@/types/map2d';

type Map2DCanvasProps = {
  layout: Map2DLayout;
};

const canvasWidth = 1600;
const canvasHeight = 1100;

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawPolygonPath(ctx: CanvasRenderingContext2D, points: Array<{ x: number; y: number }>) {
  if (!points.length) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  points.slice(1).forEach(point => ctx.lineTo(point.x, point.y));
  ctx.closePath();
}

function drawGrid(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.strokeStyle = 'rgba(125, 211, 252, 0.08)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= canvasWidth; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvasHeight);
    ctx.stroke();
  }
  for (let y = 0; y <= canvasHeight; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvasWidth, y);
    ctx.stroke();
  }
  ctx.restore();
}

function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, startSize: number, minSize: number, weight = 800) {
  let size = startSize;
  do {
    ctx.font = `${weight} ${size}px Arial`;
    if (ctx.measureText(text).width <= maxWidth) return size;
    size -= 1;
  } while (size >= minSize);
  return minSize;
}

function compactLabel(label: string) {
  return label
    .replace('Covered Parking', 'Parking')
    .replace('Living Lounge', 'Living')
    .replace('Dining Core', 'Dining')
    .replace('Kitchen SE Zone', 'Kitchen')
    .replace('Master Bedroom', 'Master')
    .replace('Bedroom 2', 'Bed 2')
    .replace('Bedroom 3', 'Bed 3')
    .replace('Bath / WC', 'Bath')
    .replace('Lobby / Passage', 'Lobby')
    .replace('Entry Walkway', 'Entry')
    .replace('Family Lobby', 'Lobby');
}

function isOpenZone(type: string) {
  return type === 'court' || type === 'balcony' || type === 'circulation';
}

function titleCase(value?: string) {
  if (!value) return 'Family';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function Map2DCanvas({ layout }: Map2DCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const bg = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    bg.addColorStop(0, '#07111f');
    bg.addColorStop(0.48, '#071827');
    bg.addColorStop(1, '#02050b');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    drawGrid(ctx);

    ctx.fillStyle = 'rgba(34, 211, 238, 0.08)';
    ctx.beginPath();
    ctx.arc(1160, 240, 320, 0, Math.PI * 2);
    ctx.fill();

    const plotBounds = layout.plot.bounds ?? { minX: 0, minY: 0, maxX: layout.plot.width, maxY: layout.plot.length };
    const plotArea = layout.plot.areaSqft ?? layout.plot.width * layout.plot.length;
    const isTraced = layout.input.plotMode === 'trace' && Boolean(layout.plot.polygon?.length);
    const originX = isTraced ? plotBounds.minX : 0;
    const originY = isTraced ? plotBounds.minY : 0;
    const visibleW = isTraced ? Math.max(10, plotBounds.maxX - plotBounds.minX) : layout.plot.width;
    const visibleH = isTraced ? Math.max(10, plotBounds.maxY - plotBounds.minY) : layout.plot.length;

    const planX = 80;
    const planY = 145;
    const planW = 1010;
    const planH = 800;
    const scale = Math.min(planW / visibleW, planH / visibleH);
    const plotW = visibleW * scale;
    const plotH = visibleH * scale;
    const offsetX = planX + (planW - plotW) / 2;
    const offsetY = planY + (planH - plotH) / 2;
    const tx = (value: number) => offsetX + (value - originX) * scale;
    const ty = (value: number) => offsetY + (value - originY) * scale;

    const canvasPolygon = layout.plot.polygon?.map(point => ({
      x: tx(point.x),
      y: ty(point.y),
    }));

    ctx.save();
    ctx.shadowColor = 'rgba(34, 211, 238, 0.28)';
    ctx.shadowBlur = 24;
    ctx.strokeStyle = '#67e8f9';
    ctx.lineWidth = 7;
    if (canvasPolygon?.length) {
      ctx.fillStyle = 'rgba(34, 211, 238, 0.045)';
      drawPolygonPath(ctx, canvasPolygon);
      ctx.fill();
      ctx.stroke();
    } else {
      drawRoundedRect(ctx, offsetX, offsetY, plotW, plotH, 8);
      ctx.stroke();
    }
    ctx.restore();

    ctx.strokeStyle = 'rgba(226, 232, 240, 0.35)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.strokeRect(
      tx(plotBounds.minX + layout.plot.setback),
      ty(plotBounds.minY + layout.plot.setback),
      layout.plot.buildableWidth * scale,
      layout.plot.buildableLength * scale
    );
    ctx.setLineDash([]);

    if (canvasPolygon?.length) {
      ctx.save();
      drawPolygonPath(ctx, canvasPolygon);
      ctx.clip();
    }

    layout.rooms.forEach(room => {
      const x = tx(room.x);
      const y = ty(room.y);
      const width = room.width * scale;
      const height = room.height * scale;

      ctx.save();
      ctx.fillStyle = isOpenZone(room.type) ? `${room.color}1f` : `${room.color}36`;
      ctx.strokeStyle = room.color;
      ctx.lineWidth = isOpenZone(room.type) ? 3 : 5;
      ctx.shadowColor = `${room.color}66`;
      ctx.shadowBlur = isOpenZone(room.type) ? 3 : 8;
      if (isOpenZone(room.type)) ctx.setLineDash([12, 8]);
      drawRoundedRect(ctx, x, y, width, height, 4);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      const label = compactLabel(room.label);
      const maxTextWidth = Math.max(20, width - 18);
      const labelSize = fitText(ctx, label, maxTextWidth, height < 72 ? 20 : 28, 13);
      const canShowDimensions = !isOpenZone(room.type) && width > 76 && height > 52;
      const centerY = y + height / 2;

      ctx.fillStyle = isOpenZone(room.type) ? '#d9f99d' : '#e5f7ff';
      ctx.font = `800 ${labelSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, x + width / 2, centerY - (canShowDimensions ? 10 : 0));

      if (canShowDimensions) {
        const dimension = `${room.width.toFixed(1)}' x ${room.height.toFixed(1)}'`;
        const dimSize = fitText(ctx, dimension, maxTextWidth, 16, 11, 700);
        ctx.fillStyle = 'rgba(226, 232, 240, 0.72)';
        ctx.font = `700 ${dimSize}px Arial`;
        ctx.fillText(dimension, x + width / 2, centerY + 17);
      }
    });

    layout.doors.forEach(door => {
      const x = tx(door.x);
      const y = ty(door.y);
      const width = door.width * scale;
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + width, y);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(248, 250, 252, 0.65)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, width, 0, Math.PI / 2);
      ctx.stroke();
    });

    layout.windows.forEach(win => {
      const x = tx(win.x);
      const y = ty(win.y);
      const width = win.width * scale;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, y - 5);
      ctx.lineTo(x + width, y - 5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y - 10);
      ctx.lineTo(x + width, y - 10);
      ctx.stroke();
    });

    if (canvasPolygon?.length) {
      ctx.restore();
    }

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '800 32px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('AUTO NIRMAN PERSONALIZED 2D PLAN', 70, 58);
    ctx.font = '600 18px Arial';
    ctx.fillStyle = 'rgba(226, 232, 240, 0.68)';
    ctx.fillText(`${layout.input.houseType.toUpperCase()} | ${layout.input.bathrooms ?? 2} Bath | ${titleCase(layout.input.planStyle)} plan | ${layout.input.plotMode === 'trace' ? 'TRACED PLOT' : `${layout.plot.width}' x ${layout.plot.length}'`} | ${Math.round(plotArea).toLocaleString('en-IN')} sq ft | Road: ${layout.input.roadSide.toUpperCase()}`, 70, 88);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '800 22px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('N', 1235, 153);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(1235, 195);
    ctx.lineTo(1235, 165);
    ctx.lineTo(1223, 178);
    ctx.moveTo(1235, 165);
    ctx.lineTo(1247, 178);
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#fbbf24';
    ctx.font = '800 20px Arial';
    ctx.fillText(`${layout.input.roadSide.toUpperCase()} ROAD SIDE`, 1220, 245);

    const panelX = 1135;
    const panelY = 150;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.84)';
    ctx.strokeStyle = 'rgba(125, 211, 252, 0.22)';
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, panelX, panelY, 390, 760, 18);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#e5f7ff';
    ctx.font = '800 26px Arial';
    ctx.fillText('CLIENT PLAN BRIEF', panelX + 28, panelY + 46);
    ctx.font = '500 16px Arial';
    ctx.fillStyle = 'rgba(226, 232, 240, 0.7)';
    ctx.fillText('Personalized output and design checks', panelX + 28, panelY + 74);

    const conceptTitle = layout.aiPlan?.conceptTitle ?? `${titleCase(layout.input.planStyle)} Plan`;
    const statCards = [
      [`${layout.input.houseType.toUpperCase()}`, 'Configuration'],
      [`${layout.input.bathrooms ?? 2} Bath`, 'Bathrooms'],
      [titleCase(layout.input.planStyle), 'Planning style'],
      [layout.aiPlan ? 'AI Planned' : 'Rule Based', 'Engine'],
    ];

    statCards.forEach(([value, label], index) => {
      const x = panelX + 28 + (index % 2) * 170;
      const y = panelY + 108 + Math.floor(index / 2) * 76;
      ctx.fillStyle = 'rgba(34, 211, 238, 0.10)';
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.18)';
      drawRoundedRect(ctx, x, y, 150, 54, 12);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f8fafc';
      ctx.font = '800 18px Arial';
      ctx.fillText(value, x + 14, y + 23);
      ctx.fillStyle = 'rgba(203, 213, 225, 0.68)';
      ctx.font = '600 11px Arial';
      ctx.fillText(label.toUpperCase(), x + 14, y + 42);
    });

    const scores = [
      ['Efficiency', layout.score.efficiency],
      ['Vastu', layout.score.vastu],
      ['Circulation', layout.score.circulation],
      ['Daylight', layout.score.daylight],
    ];
    scores.forEach(([label, value], index) => {
      const y = panelY + 300 + index * 48;
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '700 15px Arial';
      ctx.fillText(String(label), panelX + 28, y);
      ctx.fillStyle = 'rgba(255,255,255,0.10)';
      drawRoundedRect(ctx, panelX + 150, y - 14, 145, 10, 5);
      ctx.fill();
      ctx.fillStyle = '#22d3ee';
      drawRoundedRect(ctx, panelX + 150, y - 14, 145 * (Number(value) / 100), 10, 5);
      ctx.fill();
      ctx.fillStyle = '#f8fafc';
      ctx.font = '800 15px Arial';
      ctx.fillText(`${value}%`, panelX + 315, y);
    });

    ctx.fillStyle = 'rgba(34, 211, 238, 0.11)';
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.22)';
    drawRoundedRect(ctx, panelX + 28, panelY + 445, 330, 50, 14);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#e0faff';
    ctx.font = '800 15px Arial';
    ctx.fillText(conceptTitle, panelX + 44, panelY + 466);
    ctx.fillStyle = 'rgba(203, 213, 225, 0.72)';
    ctx.font = '600 12px Arial';
    ctx.fillText((layout.aiPlan?.strategy ?? 'deterministic_layout').replaceAll('_', ' ').toUpperCase(), panelX + 44, panelY + 485);

    ctx.fillStyle = 'rgba(226, 232, 240, 0.84)';
    ctx.font = '800 14px Arial';
    ctx.fillText('ROOM SCHEDULE', panelX + 28, panelY + 520);

    layout.rooms.slice(0, 8).forEach((room, index) => {
      const y = panelY + 550 + index * 25;
      ctx.fillStyle = room.color;
      drawRoundedRect(ctx, panelX + 28, y - 11, 10, 10, 4);
      ctx.fill();
      ctx.fillStyle = '#dff9ff';
      ctx.font = '700 13px Arial';
      ctx.fillText(compactLabel(room.label), panelX + 48, y);
      ctx.fillStyle = 'rgba(203, 213, 225, 0.68)';
      ctx.font = '600 12px Arial';
      ctx.fillText(`${Math.round(room.width * room.height)} sq ft`, panelX + 285, y);
    });

    ctx.strokeStyle = 'rgba(226, 232, 240, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY + plotH + 48);
    ctx.lineTo(offsetX + plotW, offsetY + plotH + 48);
    ctx.stroke();
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '700 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(visibleW)}'`, offsetX + plotW / 2, offsetY + plotH + 78);

    ctx.save();
    ctx.translate(offsetX - 54, offsetY + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${Math.round(visibleH)}'`, 0, 0);
    ctx.restore();
  }, [layout]);

  const downloadJPEG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/jpeg', 0.96);
    link.download = `auto-nirman-${layout.input.houseType}-2d-map.jpg`;
    link.click();
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-cyan-300/20 bg-slate-950/80 p-2 shadow-2xl shadow-cyan-950/20">
        <canvas ref={canvasRef} className="h-auto w-full rounded-md" />
      </div>
      <button
        type="button"
        onClick={downloadJPEG}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-cyan-200"
      >
        <Download size={16} /> Download JPEG
      </button>
    </div>
  );
}


