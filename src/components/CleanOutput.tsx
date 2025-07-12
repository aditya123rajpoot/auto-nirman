'use client';

import React from 'react';
import { jsonToReadableLines } from '@/utils/jsonToReadableLines';

interface CleanOutputProps {
  data: any;
}

const CleanOutput: React.FC<CleanOutputProps> = ({ data }) => {
  const lines = jsonToReadableLines(data);

  return (
    <pre className="whitespace-pre-wrap font-mono bg-black/20 p-4 rounded border border-cyan-500 text-cyan-200 max-h-[500px] overflow-auto">
      {lines.map((line: string, index: number) => (
        <div key={index}>{line}</div>
      ))}
    </pre>
  );
};

export default CleanOutput;
