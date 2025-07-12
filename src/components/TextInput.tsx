'use client';

interface TextInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  glowActive: boolean;
  glowHandlers: any;
}

export default function TextInput({
  label,
  name,
  value,
  onChange,
  glowActive,
  glowHandlers,
}: TextInputProps) {
  return (
    <div className="text-sm w-full">
      <label className="block mb-1 text-cyan-300 font-semibold">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className={`w-full bg-black/20 text-white px-4 py-2 rounded-md border border-cyan-500 outline-none ${
          glowActive ? 'ring-2 ring-cyan-400/50' : ''
        }`}
        {...glowHandlers}
      />
    </div>
  );
}
