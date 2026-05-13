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
    .replace('Bath / WC', 'Bath');
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

    const planX = 140;
    const planY = 130;
    const planW = 1000;
    const planH = 820;
    const scale = Math.min(planW / layout.plot.width, planH / layout.plot.length);
    const plotW = layout.plot.width * scale;
    const plotH = layout.plot.length * scale;
    const offsetX = planX + (planW - plotW) / 2;
    const offsetY = planY + (planH - plotH) / 2;

    ctx.save();
    ctx.shadowColor = 'rgba(34, 211, 238, 0.28)';
    ctx.shadowBlur = 24;
    ctx.strokeStyle = '#67e8f9';
    ctx.lineWidth = 7;
    drawRoundedRect(ctx, offsetX, offsetY, plotW, plotH, 8);
    ctx.stroke();
    ctx.restore();

    ctx.strokeStyle = 'rgba(226, 232, 240, 0.35)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.strokeRect(
      offsetX + layout.plot.setback * scale,
      offsetY + layout.plot.setback * scale,
      layout.plot.buildableWidth * scale,
      layout.plot.buildableLength * scale
    );
    ctx.setLineDash([]);

    layout.rooms.forEach(room => {
      const x = offsetX + room.x * scale;
      const y = offsetY + room.y * scale;
      const width = room.width * scale;
      const height = room.height * scale;

      ctx.save();
      ctx.fillStyle = `${room.color}24`;
      ctx.strokeStyle = room.color;
      ctx.lineWidth = 4;
      ctx.shadowColor = `${room.color}66`;
      ctx.shadowBlur = 10;
      drawRoundedRect(ctx, x, y, width, height, 7);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      const label = compactLabel(room.label);
      const maxTextWidth = Math.max(20, width - 18);
      const labelSize = fitText(ctx, label, maxTextWidth, height < 72 ? 18 : 24, 11);
      const canShowDimensions = width > 88 && height > 58;
      const centerY = y + height / 2;

      ctx.fillStyle = '#e5f7ff';
      ctx.font = `800 ${labelSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, x + width / 2, centerY - (canShowDimensions ? 10 : 0));

      if (canShowDimensions) {
        const dimension = `${room.width.toFixed(1)}' x ${room.height.toFixed(1)}'`;
        const dimSize = fitText(ctx, dimension, maxTextWidth, 15, 10, 600);
        ctx.fillStyle = 'rgba(226, 232, 240, 0.72)';
        ctx.font = `600 ${dimSize}px Arial`;
        ctx.fillText(dimension, x + width / 2, centerY + 17);
      }
    });

    layout.doors.forEach(door => {
      const x = offsetX + door.x * scale;
      const y = offsetY + door.y * scale;
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
      const x = offsetX + win.x * scale;
      const y = offsetY + win.y * scale;
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

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '800 30px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('AUTO NIRMAN FUTURISTIC 2D PLAN', 70, 58);
    ctx.font = '500 18px Arial';
    ctx.fillStyle = 'rgba(226, 232, 240, 0.68)';
    ctx.fillText(`${layout.input.houseType.toUpperCase()} | ${layout.plot.width}' x ${layout.plot.length}' | Road: ${layout.input.roadSide.toUpperCase()}`, 70, 88);

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

    const panelX = 1190;
    const panelY = 330;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
    ctx.strokeStyle = 'rgba(125, 211, 252, 0.22)';
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, panelX, panelY, 330, 470, 18);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#e5f7ff';
    ctx.font = '800 24px Arial';
    ctx.fillText('AI DESIGN ASSISTANT', panelX + 28, panelY + 46);
    ctx.font = '500 16px Arial';
    ctx.fillStyle = 'rgba(226, 232, 240, 0.7)';
    ctx.fillText('Accuracy and beauty checks', panelX + 28, panelY + 74);

    const scores = [
      ['Efficiency', layout.score.efficiency],
      ['Vastu', layout.score.vastu],
      ['Circulation', layout.score.circulation],
      ['Daylight', layout.score.daylight],
    ];
    scores.forEach(([label, value], index) => {
      const y = panelY + 122 + index * 54;
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '700 15px Arial';
      ctx.fillText(String(label), panelX + 28, y);
      ctx.fillStyle = 'rgba(255,255,255,0.10)';
      drawRoundedRect(ctx, panelX + 135, y - 14, 128, 10, 5);
      ctx.fill();
      ctx.fillStyle = '#22d3ee';
      drawRoundedRect(ctx, panelX + 135, y - 14, 128 * (Number(value) / 100), 10, 5);
      ctx.fill();
      ctx.fillStyle = '#f8fafc';
      ctx.font = '800 15px Arial';
      ctx.fillText(`${value}%`, panelX + 275, y);
    });

    const assistantBadges = [
      'Geometry locked',
      'Room labels cleaned',
      'JPEG export ready',
      layout.input.vastu ? 'Vastu assist on' : 'Efficiency priority',
    ];

    assistantBadges.forEach((badge, index) => {
      const y = panelY + 330 + index * 34;
      ctx.fillStyle = 'rgba(34, 211, 238, 0.12)';
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.24)';
      drawRoundedRect(ctx, panelX + 28, y - 19, 274, 24, 12);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#dff9ff';
      ctx.font = '700 14px Arial';
      ctx.fillText(badge, panelX + 44, y - 3);
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
    ctx.fillText(`${layout.plot.width}'`, offsetX + plotW / 2, offsetY + plotH + 78);

    ctx.save();
    ctx.translate(offsetX - 54, offsetY + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${layout.plot.length}'`, 0, 0);
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


