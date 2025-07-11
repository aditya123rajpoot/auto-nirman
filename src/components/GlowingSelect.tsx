'use client';

import { useState } from 'react';

export default function GlowingSelect({
  label,
  name,
  value,
  options,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <label className="block text-sm mb-1">{label}</label>

      <div
        className="bg-black/30 text-white border border-white/20 rounded-lg px-3 py-2 cursor-pointer 
                   focus:ring-2 focus:ring-cyan-500 transition"
        onClick={() => setOpen(!open)}
      >
        {value}
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-black/80 border border-white/20 rounded-lg shadow-lg">
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className="px-3 py-2 cursor-pointer hover:bg-cyan-600 hover:text-white hover:shadow-[0_0_10px_#06b6d4] rounded-md transition"
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
