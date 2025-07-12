// src/components/CleanOutput.tsx

'use client';

import React from 'react';

interface CleanOutputProps {
  data: any;
}

interface Line {
  key?: string;
  value?: string;
  level: number;
  isHeader: boolean;
}

function parseToStructuredLines(data: any, level = 0): Line[] {
  const lines: Line[] = [];

  if (typeof data === 'object' && data !== null) {
    for (const key in data) {
      const value = data[key];

      if (typeof value === 'object' && value !== null) {
        lines.push({ key, level, isHeader: true });
        lines.push(...parseToStructuredLines(value, level + 1));
      } else {
        lines.push({
          key,
          value: String(value),
          level,
          isHeader: false,
        });
      }
    }
  } else {
    lines.push({
      value: String(data),
      level,
      isHeader: false,
    });
  }

  return lines;
}

export const CleanOutput: React.FC<CleanOutputProps> = ({ data }) => {
  const lines = parseToStructuredLines(data);

  return (
    <div className="bg-[#0f172a] border border-cyan-500/30 rounded-lg p-4 text-cyan-100 shadow-[0_0_10px_#06b6d4] font-mono text-sm leading-relaxed overflow-auto max-h-[500px]">
      {lines.map((line, idx) => {
        const indent = Math.min(line.level * 16, 64); // max indent at 64px

        return (
          <div
            key={idx}
            className="flex gap-2 mb-1"
            style={{ paddingLeft: `${indent}px` }}
          >
            {line.isHeader ? (
              <span className="text-cyan-400 font-bold text-base drop-shadow-[0_0_6px_#22d3ee] mt-2">
                {line.key}:
              </span>
            ) : (
              <>
                {line.key && (
                  <span className="text-cyan-300 font-bold min-w-[130px]">
                    {line.key}:
                  </span>
                )}
                <span className="text-cyan-500">{line.value}</span>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CleanOutput;
