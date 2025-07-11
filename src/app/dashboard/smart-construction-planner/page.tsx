'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendLayoutRequest } from '@/lib/api';
import { FaDraftingCompass } from 'react-icons/fa';
import { cleanSmartLayoutResponse } from '@/utils/cleanSmartLayoutResponse';
import FormattedJSONView from '@/components/FormattedJSONView';

const initialForm = {
  total_builtup_area: 2400,
  number_of_floors: 2,
  shape_of_plot: 'Rectangular',
  your_city: 'Lucknow',
  weather_in_your_city: 'Hot and Dry',
  do_you_follow_vastu: 'Yes',
};

export default function SmartConstructionPlannerPage() {
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (name: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const res = await sendLayoutRequest({ ...formData });
      const cleaned = cleanSmartLayoutResponse(res.plan_sections || []);
      setResponse(cleaned);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0f172a] to-black text-white px-4 py-20 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,#38bdf820_1px,transparent_0)] [background-size:20px_20px] opacity-10 z-0" />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-purple-900/30 to-black z-0" />

      <div className="relative z-10 max-w-4xl mx-auto pb-20">
        <h1 className="flex items-center justify-center gap-3 text-3xl sm:text-4xl font-extrabold text-center text-cyan-400 mb-10 select-none">
          <FaDraftingCompass className="w-10 h-10 text-cyan-400 animate-pulse" />
          Smart Construction Planner
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white/5 p-6 rounded-xl backdrop-blur border border-white/10">
          <CustomNumberInput
            label="Total Built-up Area (sq ft)"
            name="total_builtup_area"
            value={formData.total_builtup_area}
            onChange={handleChange}
          />
          <CustomNumberInput
            label="Number of Floors"
            name="number_of_floors"
            value={formData.number_of_floors}
            onChange={handleChange}
          />
          <CustomDropdown
            label="Plot Shape"
            name="shape_of_plot"
            value={formData.shape_of_plot}
            onChange={handleChange}
            options={['Rectangular', 'Square', 'L-shaped', 'Irregular']}
          />
          <TextInput
            label="Your City"
            name="your_city"
            value={formData.your_city}
            onChange={handleChange}
          />
          <CustomDropdown
            label="City Weather"
            name="weather_in_your_city"
            value={formData.weather_in_your_city}
            onChange={handleChange}
            options={['Hot and Dry', 'Cold', 'Humid', 'Moderate']}
          />
          <CustomDropdown
            label="Do you follow Vastu?"
            name="do_you_follow_vastu"
            value={formData.do_you_follow_vastu}
            onChange={handleChange}
            options={['Yes', 'No']}
          />
        </div>

        <div className="text-center mt-8">
          <motion.button
            whileHover={{ scale: 1.07, boxShadow: '0 0 25px #0a2e42, 0 0 50px #071f2c' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={loading}
            className="relative inline-flex items-center justify-center px-12 py-4 font-extrabold tracking-wide text-white rounded-full
              bg-gradient-to-r from-cyan-600 via-blue-700 to-indigo-700
              shadow-[0_0_20px_#0a2e42,0_0_40px_#071f2c,0_0_60px_#071f2c]
              transition-all duration-300 ease-in-out
              disabled:opacity-50 disabled:cursor-not-allowed
              before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-r before:from-cyan-600 before:via-blue-700 before:to-indigo-700
              before:blur-[30px] before:opacity-70 before:transition-opacity before:duration-300
              group"
          >
            <span className="relative z-10 flex items-center gap-3">
              {loading ? (
                <>
                  <svg className="w-6 h-6 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Generating Layout...
                </>
              ) : (
                <>
                  <span className="text-2xl">🚀</span> Generate Smart Layout
                </>
              )}
            </span>
          </motion.button>
        </div>

        {response && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 bg-white/10 p-6 rounded-xl border border-white/10"
          >
            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">Generated Plan</h2>
            {response.map((section, idx) => (
              <FormattedJSONView
                key={idx}
                title={section.title}
                content={section.content}
                note={section.note}
              />
            ))}
          </motion.div>
        )}

        {error && <div className="mt-6 text-red-400 text-center text-sm">{error}</div>}
      </div>
    </div>
  );
}

// 🔤 Text Input
function TextInput({ label, name, value, onChange }: { label: string; name: string; value: string; onChange: (name: string, value: string) => void }) {
  return (
    <div className="group transition duration-300 rounded-lg">
      <label className="block text-sm mb-1 font-semibold">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className="w-full bg-black/30 text-white border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-300 group-hover:ring-2 group-hover:ring-cyan-400"
      />
    </div>
  );
}

// 🔢 Custom Number Input
function CustomNumberInput({ label, name, value, onChange }: { label: string; name: string; value: number; onChange: (name: string, value: number) => void }) {
  return (
    <div className="group transition duration-300 rounded-lg">
      <label className="block text-sm mb-1 font-semibold">{label}</label>
      <div className="flex items-center bg-black/30 border border-white/20 rounded-lg overflow-hidden transition duration-300 group-hover:ring-2 group-hover:ring-cyan-400">
        <button onClick={() => onChange(name, Math.max(0, value - 1))} className="px-3 py-2 bg-cyan-700/20 hover:bg-cyan-400/30 text-cyan-300 hover:text-white transition">–</button>
        <input
          type="number"
          name={name}
          value={value}
          onChange={(e) => onChange(name, parseInt(e.target.value) || 0)}
          className="w-full text-center bg-transparent text-white focus:outline-none px-2 py-2 appearance-none"
        />
        <button onClick={() => onChange(name, value + 1)} className="px-3 py-2 bg-cyan-700/20 hover:bg-cyan-400/30 text-cyan-300 hover:text-white transition">+</button>
      </div>
    </div>
  );
}

// 🔮 Neon Dropdown
function CustomDropdown({ label, name, value, options, onChange }: { label: string; name: string; value: string; options: string[]; onChange: (name: string, value: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative group transition duration-300 rounded-lg">
      <label className="block text-sm mb-1 font-semibold">{label}</label>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer bg-black/30 text-white border border-white/20 rounded-lg px-3 py-2 relative select-none transition duration-300 group-hover:ring-2 group-hover:ring-cyan-400">
        {value}
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">▼</span>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute z-50 mt-1 w-full bg-black/90 border border-cyan-500 rounded-lg shadow-xl overflow-hidden"
          >
            {options.map((opt) => (
              <motion.li
                key={opt}
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  onChange(name, opt);
                  setIsOpen(false);
                }}
                className={`px-4 py-2 cursor-pointer transition-all duration-200 ${
                  opt === value
                    ? 'bg-cyan-600/50 text-white border-l-4 border-cyan-400 font-semibold'
                    : 'hover:bg-cyan-500/30 text-white'
                }`}
              >
                {opt}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
