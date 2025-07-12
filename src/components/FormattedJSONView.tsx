'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { jsonToReadableLines } from '@/utils/jsonToReadableLines';

interface Props {
  title: string;
  content: any;
  note?: string;
}

const FormattedJSONView = ({ title, content, note }: Props) => {
  const [open, setOpen] = useState(true);
  const lines = jsonToReadableLines(content);

  return (
    <div className="bg-[#141414] border border-cyan-500/40 rounded-xl p-4 mb-4 shadow-[0_0_20px_#06b6d4] transition-all duration-300">
      <div
        onClick={() => setOpen(!open)}
        className="cursor-pointer flex items-center justify-between font-bold text-lg sm:text-xl mb-2 text-cyan-400 hover:text-white transition"
      >
        <div className="flex items-center gap-2">
          {open ? <FaChevronDown /> : <FaChevronRight />}
          {title}
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-gray-300 whitespace-pre-wrap"
          >
            <pre className="overflow-auto text-[13px] leading-relaxed">
              {lines.map((line: string, index: number) => (
                <div key={index}>{line}</div>
              ))}
            </pre>
            {note && <p className="mt-2 italic text-cyan-400">{note}</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FormattedJSONView;
