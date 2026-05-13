'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const routeAccents = [
  { match: (path: string) => path === '/', color: '#67e8f9', glow: 'rgba(34,211,238,0.24)' },
  { match: (path: string) => path === '/dashboard', color: '#93c5fd', glow: 'rgba(96,165,250,0.24)' },
  { match: (path: string) => path.startsWith('/dashboard/boq'), color: '#fcd34d', glow: 'rgba(251,191,36,0.24)' },
  { match: (path: string) => path.startsWith('/dashboard/cost-estimator'), color: '#6ee7b7', glow: 'rgba(52,211,153,0.24)' },
  { match: (path: string) => path.startsWith('/dashboard/2d-map-generator'), color: '#fdba74', glow: 'rgba(251,146,60,0.24)' },
  { match: (path: string) => path.startsWith('/chatbot'), color: '#c4b5fd', glow: 'rgba(167,139,250,0.24)' },
  { match: (path: string) => path.startsWith('/signup'), color: '#c4b5fd', glow: 'rgba(167,139,250,0.24)' },
  { match: (path: string) => path.startsWith('/login'), color: '#67e8f9', glow: 'rgba(34,211,238,0.24)' },
  { match: (path: string) => path.startsWith('/user'), color: '#6ee7b7', glow: 'rgba(52,211,153,0.24)' },
];

function getRouteAccent(pathname: string) {
  return routeAccents.find(item => item.match(pathname)) ?? routeAccents[0];
}

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const accent = getRouteAccent(pathname);
    document.documentElement.style.setProperty('--page-heading-accent', accent.color);
    document.documentElement.style.setProperty('--page-heading-glow', accent.glow);

    setLoading(true);
    const timer = window.setTimeout(() => setLoading(false), 360);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="fixed left-0 top-0 z-[120] h-[3px] w-full origin-left bg-gradient-to-r from-cyan-300 via-blue-400 to-orange-300 shadow-[0_0_22px_rgba(34,211,238,0.55)]"
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={pathname}
          className="page-transition-root"
          initial={{ opacity: 0.88, y: 8, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0.96, y: 0, filter: 'blur(2px)' }}
          transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
