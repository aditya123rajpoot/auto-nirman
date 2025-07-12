'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendLayoutRequest } from '@/lib/api';
import { FaDraftingCompass } from 'react-icons/fa';
import { cleanSmartLayoutResponse } from '@/utils/cleanSmartLayoutResponse';
import { useRouter } from 'next/navigation';
import SandTimerAnimation from '@/components/SandTimerAnimation';
import DotTyping from '@/components/DotTyping';
import CustomNumberInput from '@/components/CustomNumberInput';
import CustomDropdown from '@/components/CustomDropdown';
import TextInput from '@/components/TextInput';

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
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [glowActive, setGlowActive] = useState<Record<string, boolean>>({});
  const [hasMouse, setHasMouse] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onPointerOver = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') setHasMouse(true);
    };
    const onResize = () => setIsMobile(window.innerWidth <= 640);

    window.addEventListener('pointerover', onPointerOver);
    onResize();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('pointerover', onPointerOver);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const activateGlow = (key: string) =>
    setGlowActive((prev) => ({ ...prev, [key]: true }));

  const deactivateGlow = (key: string) =>
    setGlowActive((prev) => ({ ...prev, [key]: false }));

  const glowProps = (key: string) => ({
    onPointerEnter: (e: React.PointerEvent) => {
      if (e.pointerType === 'mouse' && hasMouse) activateGlow(key);
    },
    onPointerLeave: (e: React.PointerEvent) => {
      if (e.pointerType === 'mouse') deactivateGlow(key);
    },
    onPointerDown: (e: React.PointerEvent) => {
      if (e.pointerType === 'touch' || e.pointerType === 'pen') activateGlow(key);
    },
    onPointerUp: (e: React.PointerEvent) => {
      if (e.pointerType === 'touch' || e.pointerType === 'pen') deactivateGlow(key);
    },
  });

  const handleChange = (name: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendLayoutRequest({ ...formData });
      const cleaned = cleanSmartLayoutResponse(res.plan_sections || []);
      const encoded = encodeURIComponent(JSON.stringify(cleaned));
      router.push(`/dashboard/smart-construction-output?data=${encoded}`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = (name: string) => {
    setOpenDropdown((prev) => {
      const isOpening = prev !== name;
      if (isOpening) {
        setTimeout(() => {
          const el = document.getElementById(`dropdown-${name}`);
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
      return isOpening ? name : null;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0f172a] to-black text-white px-4 py-14 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,#38bdf820_1px,transparent_0)] [background-size:20px_20px] opacity-10 z-0" />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-purple-900/30 to-black z-0" />

      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.95 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center text-cyan-400 px-4 text-center"
          >
            <SandTimerAnimation />
            <motion.div
              className="mt-6 text-lg italic font-semibold flex items-center justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ repeat: Infinity, repeatType: 'mirror', duration: 1.8 }}
            >
              Your page is getting ready... <DotTyping />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 w-full max-w-3xl mx-auto">
        <h1 className="flex items-center justify-center gap-2 text-2xl sm:text-3xl font-bold text-center text-cyan-400 mb-10">
          <FaDraftingCompass className="w-7 h-7 animate-pulse" />
          Smart Construction Planner
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 px-2 sm:px-0 pb-20">
          <CardWrapper>
            <CustomNumberInput
              label="Built-up Area (sq ft)"
              name="total_builtup_area"
              value={formData.total_builtup_area}
              onChange={handleChange}
              glowActive={glowActive['total_builtup_area'] || false}
              glowHandlers={glowProps('total_builtup_area')}
            />
          </CardWrapper>

          <CardWrapper>
            <CustomNumberInput
              label="Floors"
              name="number_of_floors"
              value={formData.number_of_floors}
              onChange={handleChange}
              glowActive={glowActive['number_of_floors'] || false}
              glowHandlers={glowProps('number_of_floors')}
            />
          </CardWrapper>

          <CardWrapper>
            <div id="dropdown-shape_of_plot">
              <CustomDropdown
                label="Plot Shape"
                name="shape_of_plot"
                value={formData.shape_of_plot}
                options={['Rectangular', 'Square', 'L-shaped', 'Irregular']}
                onChange={handleChange}
                isOpen={openDropdown === 'shape_of_plot'}
                toggleOpen={() => toggleDropdown('shape_of_plot')}
                glowActive={glowActive['shape_of_plot'] || false}
                glowHandlers={glowProps('shape_of_plot')}
                isMobile={isMobile}
              />
            </div>
          </CardWrapper>

          <CardWrapper>
            <TextInput
              label="Your City"
              name="your_city"
              value={formData.your_city}
              onChange={handleChange}
              glowActive={glowActive['your_city'] || false}
              glowHandlers={glowProps('your_city')}
            />
          </CardWrapper>

          <CardWrapper>
            <div id="dropdown-weather_in_your_city">
              <CustomDropdown
                label="City Weather"
                name="weather_in_your_city"
                value={formData.weather_in_your_city}
                options={['Hot and Dry', 'Cold', 'Humid', 'Moderate']}
                onChange={handleChange}
                isOpen={openDropdown === 'weather_in_your_city'}
                toggleOpen={() => toggleDropdown('weather_in_your_city')}
                glowActive={glowActive['weather_in_your_city'] || false}
                glowHandlers={glowProps('weather_in_your_city')}
                isMobile={isMobile}
              />
            </div>
          </CardWrapper>

          <CardWrapper>
            <div id="dropdown-do_you_follow_vastu">
              <CustomDropdown
                label="Follow Vastu?"
                name="do_you_follow_vastu"
                value={formData.do_you_follow_vastu}
                options={['Yes', 'No']}
                onChange={handleChange}
                isOpen={openDropdown === 'do_you_follow_vastu'}
                toggleOpen={() => toggleDropdown('do_you_follow_vastu')}
                glowActive={glowActive['do_you_follow_vastu'] || false}
                glowHandlers={glowProps('do_you_follow_vastu')}
                isMobile={isMobile}
              />
            </div>
          </CardWrapper>
        </div>

        <div className={`text-center ${isMobile ? 'mt-6 mb-12' : 'mt-12 mb-20'}`}>
          <motion.button
            {...glowProps('generate_button')}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={handleSubmit}
            disabled={loading}
            className="relative inline-flex items-center justify-center px-6 py-3 text-sm sm:text-base font-semibold text-white rounded-full
              bg-gradient-to-br from-cyan-500 via-purple-700 to-indigo-600
              shadow-[0_0_12px_#00FFFF55,0_0_25px_#3B82F655]
              hover:shadow-[0_0_20px_#0ff,0_0_30px_#6366f1]
              hover:ring-2 hover:ring-cyan-400/50
              backdrop-blur-md transition-all duration-300 ease-in-out
              disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              boxShadow: glowActive['generate_button']
                ? '0 0 16px 4px #22d3eeaa, 0 0 30px 8px #7e22ceaa'
                : undefined,
            }}
            aria-label="Generate Smart Layout"
          >
            {loading ? (
              <>
                <svg className="w-5 h-5 animate-spin text-white mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <span className="text-lg sm:text-xl mr-2">🚀</span>
                Generate Layout
              </>
            )}
          </motion.button>
        </div>

        {error && (
          <div className="mt-4 text-red-400 text-center text-xs" role="alert">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

// ✅ PATCHED: CardWrapper allows dropdown overflow
function CardWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white/5 p-4 rounded-xl backdrop-blur border border-white/10 max-w-xs w-full mx-auto sm:max-w-full mb-6 overflow-visible relative">
      {children}
    </div>
  );
}
