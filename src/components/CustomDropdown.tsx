'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown } from 'react-icons/fa';

interface CustomDropdownProps {
  label: string;
  name: string;
  value: string;
  options: string[];
  onChange: (name: string, value: string) => void;
  isOpen: boolean;
  toggleOpen: () => void;
  glowActive: boolean;
  glowHandlers: any;
  isMobile: boolean;
}

export default function CustomDropdown({
  label,
  name,
  value,
  options,
  onChange,
  isOpen,
  toggleOpen,
  glowActive,
  glowHandlers,
  isMobile,
}: CustomDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        toggleOpen();
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    else document.removeEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div
      id={`dropdown-${name}`}
      ref={dropdownRef}
      className="relative group text-sm transition duration-300 rounded-md"
    >
      <label className="block mb-1 text-cyan-300 font-semibold">{label}</label>

      <button
        type="button"
        onClick={toggleOpen}
        className={`w-full px-4 py-2 rounded-md border border-cyan-500 bg-black/20 text-white text-left relative z-10 flex items-center justify-between ${
          glowActive ? 'ring-2 ring-cyan-400/50' : ''
        }`}
        {...glowHandlers}
      >
        <span className="truncate">{value}</span>
        <FaChevronDown className="ml-2 text-cyan-300 text-xs" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-1 bg-gradient-to-br from-black via-[#0f172a]/90 to-[#0b0c10]/90 border border-cyan-600 rounded-xl shadow-[0_0_12px_#00ffff44] max-h-24 overflow-y-auto backdrop-blur-sm custom-scrollbar"
            style={{ top: '100%' }}
          >
            {options.map((option) => (
              <li
                key={option}
                onClick={() => onChange(name, option)}
                className={`px-4 py-2 text-sm cursor-pointer transition duration-150 ${
                  option === value
                    ? 'bg-cyan-800 text-cyan-300 font-bold'
                    : 'text-white hover:bg-cyan-500/20'
                } hover:shadow-[0_0_6px_#00ffff88] rounded-md`}
              >
                {option}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
