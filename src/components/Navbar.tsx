'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import { HiOutlineMenu, HiX } from 'react-icons/hi';
import { FaBolt, FaCalculator, FaChartLine, FaHome, FaMap, FaRobot, FaUser } from 'react-icons/fa';

const navLinks = [
  {
    name: 'Home',
    href: '/',
    icon: FaHome,
    glow: 'hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:text-cyan-50 hover:shadow-[0_0_26px_rgba(34,211,238,0.18)]',
    activePill: 'bg-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.38)]',
    activeDrawer: 'border-cyan-300/45 bg-cyan-300/12 text-cyan-100 shadow-[0_0_22px_rgba(34,211,238,0.16)]',
  },
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: FaChartLine,
    glow: 'hover:border-blue-300/40 hover:bg-blue-400/10 hover:text-blue-50 hover:shadow-[0_0_26px_rgba(96,165,250,0.2)]',
    activePill: 'bg-blue-300 shadow-[0_0_24px_rgba(96,165,250,0.38)]',
    activeDrawer: 'border-blue-300/45 bg-blue-400/12 text-blue-100 shadow-[0_0_22px_rgba(96,165,250,0.17)]',
  },
  {
    name: 'BOQ',
    href: '/dashboard/boq-upload',
    icon: FaBolt,
    glow: 'hover:border-amber-300/45 hover:bg-amber-300/10 hover:text-amber-50 hover:shadow-[0_0_26px_rgba(251,191,36,0.2)]',
    activePill: 'bg-amber-300 shadow-[0_0_24px_rgba(251,191,36,0.38)]',
    activeDrawer: 'border-amber-300/45 bg-amber-300/12 text-amber-100 shadow-[0_0_22px_rgba(251,191,36,0.17)]',
  },
  {
    name: 'Estimate',
    href: '/dashboard/cost-estimator',
    icon: FaCalculator,
    glow: 'hover:border-emerald-300/45 hover:bg-emerald-300/10 hover:text-emerald-50 hover:shadow-[0_0_26px_rgba(52,211,153,0.2)]',
    activePill: 'bg-emerald-300 shadow-[0_0_24px_rgba(52,211,153,0.38)]',
    activeDrawer: 'border-emerald-300/45 bg-emerald-300/12 text-emerald-100 shadow-[0_0_22px_rgba(52,211,153,0.17)]',
  },
  {
    name: '2D Map',
    href: '/dashboard/2d-map-generator',
    icon: FaMap,
    glow: 'hover:border-orange-300/45 hover:bg-orange-300/10 hover:text-orange-50 hover:shadow-[0_0_26px_rgba(251,146,60,0.2)]',
    activePill: 'bg-orange-300 shadow-[0_0_24px_rgba(251,146,60,0.38)]',
    activeDrawer: 'border-orange-300/45 bg-orange-300/12 text-orange-100 shadow-[0_0_22px_rgba(251,146,60,0.17)]',
  },
  {
    name: 'AI Chat',
    href: '/chatbot',
    icon: FaRobot,
    glow: 'hover:border-violet-300/45 hover:bg-violet-300/10 hover:text-violet-50 hover:shadow-[0_0_26px_rgba(167,139,250,0.22)]',
    activePill: 'bg-violet-300 shadow-[0_0_24px_rgba(167,139,250,0.42)]',
    activeDrawer: 'border-violet-300/45 bg-violet-300/12 text-violet-100 shadow-[0_0_22px_rgba(167,139,250,0.18)]',
  },
];

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  if (href === '/dashboard') return pathname === '/dashboard';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function ShimmerButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-white px-4 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-slate-950 transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-200 hover:shadow-[0_0_34px_rgba(34,211,238,0.38)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
    >
      <span className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/70 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [softened, setSoftened] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });

  const hideNavbar = pathname === '/login' || pathname === '/signup';

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const onScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > lastScrollY;

      setScrolled(currentScrollY > 8);
      setSoftened(currentScrollY > 48);
      setHidden(scrollingDown && currentScrollY > 170 && !isOpen);

      lastScrollY = currentScrollY;
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
    setHidden(false);
  }, [pathname]);

  if (hideNavbar) return null;

  return (
    <motion.nav
      initial={{ opacity: 0, y: -18 }}
      animate={hidden ? { opacity: 0, y: -88, filter: 'blur(14px)' } : { opacity: 1, y: 0, filter: softened ? 'blur(0.4px)' : 'blur(0px)' }}
      transition={{ duration: 0.42, ease: 'easeOut' }}
      onMouseEnter={() => setHidden(false)}
      className={`fixed left-0 top-0 z-[90] w-full ${hidden ? 'pointer-events-none' : 'pointer-events-auto'}`}
    >
      <motion.div
        style={{ scaleX, transformOrigin: '0%' }}
        className="absolute left-0 top-0 h-[2px] w-full bg-gradient-to-r from-cyan-400 via-blue-400 to-orange-300"
      />

      <div
        className={`w-full overflow-hidden border-b transition-all duration-500 ${
          scrolled
            ? 'border-cyan-300/18 bg-slate-950 shadow-[0_14px_58px_rgba(0,0,0,0.6),0_0_54px_rgba(34,211,238,0.13)] backdrop-blur-3xl'
            : 'border-white/10 bg-slate-950 shadow-[0_14px_52px_rgba(0,0,0,0.42),0_0_40px_rgba(34,211,238,0.08)] backdrop-blur-2xl'
        }`}
      >
        <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />

        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:gap-4 sm:px-6 sm:py-3">
          <Link href="/" className="group flex min-w-0 items-center gap-3" aria-label="Auto Nirman home">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-cyan-200/20 bg-cyan-200/10 shadow-[0_0_24px_rgba(34,211,238,0.12)] sm:h-11 sm:w-11 sm:rounded-xl">
              <span className="absolute inset-0 animate-pulse rounded-lg bg-cyan-400/10" />
              <Image
                src="/logo.png"
                alt="Auto Nirman"
                width={32}
                height={32}
                priority
                className="relative rounded-lg transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-black uppercase tracking-[0.16em] text-white transition-colors group-hover:text-cyan-100 sm:text-base sm:tracking-[0.2em]">
                Auto Nirman
              </p>
              <p className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100/55 sm:block">
                Construction intelligence
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-1 rounded-xl border border-white/10 bg-white/[0.035] p-1 lg:flex">
            {navLinks.map(link => {
              const active = isActive(pathname, link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group relative inline-flex items-center gap-2 rounded-lg border border-transparent px-3 py-2 text-xs font-semibold transition-all duration-300 ${link.glow}`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className={`absolute inset-0 rounded-lg ${link.activePill}`}
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className={`relative z-10 transition-transform duration-150 group-hover:scale-110 ${active ? 'text-slate-950' : 'text-cyan-100/70 group-hover:text-current'}`}>
                    <Icon size={13} />
                  </span>
                  <span className={`relative z-10 whitespace-nowrap ${active ? 'text-slate-950' : 'text-slate-300 group-hover:text-current'}`}>
                    {link.name}
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/user"
              className={`group inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-300 hover:-translate-y-0.5 ${
                isActive(pathname, '/user')
                  ? 'border-emerald-300/40 bg-emerald-300/15 text-emerald-100 shadow-[0_0_24px_rgba(52,211,153,0.16)]'
                  : 'border-white/10 bg-white/[0.035] text-slate-300 hover:border-emerald-300/35 hover:bg-emerald-300/10 hover:text-emerald-100 hover:shadow-[0_0_24px_rgba(52,211,153,0.16)]'
              }`}
              aria-label="User account"
            >
              <FaUser size={15} className="transition-transform duration-150 group-hover:scale-110" />
            </Link>

            <ShimmerButton href="/dashboard">
              Launch <FaBolt size={12} />
            </ShimmerButton>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(prev => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-xl text-white transition-all duration-300 hover:border-cyan-300/35 hover:bg-cyan-300/10 hover:text-cyan-100 hover:shadow-[0_0_24px_rgba(34,211,238,0.18)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 lg:hidden"
            aria-label="Toggle navigation"
            aria-expanded={isOpen}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isOpen ? 'close' : 'open'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-center"
              >
                {isOpen ? <HiX /> : <HiOutlineMenu />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="overflow-hidden border-t border-white/10 lg:hidden"
            >
              <div className="grid gap-2 p-3 sm:grid-cols-2">
                {navLinks.map((link, i) => {
                  const active = isActive(pathname, link.href);
                  const Icon = link.icon;
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.045, duration: 0.2 }}
                    >
                      <Link
                        href={link.href}
                        className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-semibold transition-all duration-300 ${
                          active
                            ? link.activeDrawer
                            : `border-white/10 bg-white/[0.03] text-slate-300 ${link.glow}`
                        }`}
                      >
                        <Icon size={15} />
                        {link.name}
                      </Link>
                    </motion.div>
                  );
                })}

                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navLinks.length * 0.045, duration: 0.2 }}
                >
                  <Link
                    href="/user"
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-sm font-semibold text-slate-300 transition-all duration-300 hover:border-emerald-300/35 hover:bg-emerald-300/10 hover:text-emerald-100 hover:shadow-[0_0_24px_rgba(52,211,153,0.16)]"
                  >
                    <FaUser size={15} />
                    User Account
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (navLinks.length + 1) * 0.045, duration: 0.2 }}
                  className="sm:col-span-2"
                >
                  <Link
                    href="/dashboard"
                    className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-white py-3 text-sm font-black uppercase tracking-[0.12em] text-slate-950 transition-all duration-300 hover:bg-cyan-200 hover:shadow-[0_0_30px_rgba(34,211,238,0.25)]"
                  >
                    <span className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/60 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    <span className="relative z-10 inline-flex items-center gap-2">
                      Launch Dashboard <FaBolt size={13} />
                    </span>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
