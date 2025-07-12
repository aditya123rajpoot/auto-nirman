'use client';

interface CustomNumberInputProps {
  label: string;
  name: string;
  value: number;
  onChange: (name: string, value: number) => void;
  glowActive: boolean;
  glowHandlers: any;
}

export default function CustomNumberInput({
  label,
  name,
  value,
  onChange,
  glowActive,
  glowHandlers,
}: CustomNumberInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) onChange(name, val);
  };

  return (
    <div className="text-sm w-full">
      <label className="block mb-1 text-cyan-300 font-semibold">{label}</label>
      <div className="relative flex items-center border border-cyan-500 rounded-md overflow-hidden">
        <input
          type="number"
          value={value}
          onChange={handleChange}
          className={`w-full bg-black/20 text-white px-4 py-2 outline-none ${
            glowActive ? 'ring-2 ring-cyan-400/50' : ''
          }`}
          {...glowHandlers}
        />
        <div className="flex flex-col">
          <button
            type="button"
            className="text-cyan-400 px-2 py-1 hover:bg-cyan-700/20"
            onClick={() => onChange(name, value + 1)}
          >
            ▲
          </button>
          <button
            type="button"
            className="text-cyan-400 px-2 py-1 hover:bg-cyan-700/20"
            onClick={() => onChange(name, Math.max(0, value - 1))}
          >
            ▼
          </button>
        </div>
      </div>
    </div>
  );
}
