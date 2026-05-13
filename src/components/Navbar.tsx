'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineMenu, HiX } from 'react-icons/hi';
import { FaBolt, FaCalculator, FaChartLine, FaHome, FaMap, FaRobot, FaUser } from 'react-icons/fa';
import Image from 'next/image';

const navLinks = [
  { name: 'Home', href: '/', icon: FaHome },
  { name: 'Dashboard', href: '/dashboard', icon: FaChartLine },
  { name: 'BOQ', href: '/dashboard/boq-upload', icon: FaBolt },
  { name: 'Estimate', href: '/dashboard/cost-estimator', icon: FaCalculator },
  { name: '2D Map', href: '/dashboard/2d-map-generator', icon: FaMap },
  { name: 'AI Chat', href: '/chatbot', icon: FaRobot },
];

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const syncForViewport = () => {
      setVisible(window.innerWidth < 1024);
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (window.innerWidth < 1024) {
        setVisible(true);
        return;
      }
      setVisible(event.clientY < 100);
    };

    syncForViewport();
    window.addEventListener('resize', syncForViewport);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('resize', syncForViewport);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <>
      <div
        onMouseEnter={() => setVisible(true)}
        className="fixed left-0 top-0 z-[80] h-8 w-full"
        aria-hidden="true"
      />

      <motion.nav
        initial={{ opacity: 0, y: -24 }}
        animate={visible || isOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: -24 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => !isOpen && window.innerWidth >= 1024 && setVisible(false)}
        className="fixed left-0 top-0 z-[90] w-full px-2 pt-2 sm:px-5 sm:pt-3"
      >
        <div className="mx-auto max-w-7xl overflow-hidden rounded-xl border border-white/10 bg-slate-950/82 shadow-[0_18px_70px_rgba(0,0,0,0.42),0_0_35px_rgba(34,211,238,0.08)] backdrop-blur-2xl sm:rounded-2xl">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />

          <div className="flex items-center justify-between gap-3 px-3 py-2.5 sm:gap-4 sm:px-5 sm:py-3">
            <Link href="/" className="group flex min-w-0 items-center gap-3">
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-cyan-200/20 bg-cyan-200/10 shadow-[0_0_24px_rgba(34,211,238,0.14)] sm:h-11 sm:w-11 sm:rounded-xl">
                <Image
                  src="/logo.png"
                  alt="Auto Nirman"
                  width={32}
                  height={32}
                  className="rounded-lg transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-black uppercase tracking-[0.16em] text-white sm:text-base sm:tracking-[0.2em]">
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
                    className={`group relative inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                      active
                        ? 'bg-cyan-300 text-slate-950 shadow-[0_0_22px_rgba(34,211,238,0.22)]'
                        : 'text-slate-300 hover:bg-white/[0.07] hover:text-white'
                    }`}
                  >
                    <Icon size={13} className={active ? 'text-slate-950' : 'text-cyan-100/70 group-hover:text-cyan-100'} />
                    {link.name}
                  </Link>
                );
              })}
            </div>

            <div className="hidden items-center gap-3 md:flex">
              <Link
                href="/user"
                className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
                  isActive(pathname, '/user')
                    ? 'border-emerald-300/40 bg-emerald-300/15 text-emerald-100'
                    : 'border-white/10 bg-white/[0.035] text-slate-300 hover:border-cyan-300/35 hover:text-cyan-100'
                }`}
                aria-label="User account"
              >
                <FaUser size={15} />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-slate-950 transition-all hover:bg-cyan-200 hover:shadow-[0_0_30px_rgba(34,211,238,0.22)]"
              >
                Launch <FaBolt size={12} />
              </Link>
            </div>

            <button
              type="button"
              onClick={() => {
                setVisible(true);
                setIsOpen(prev => !prev);
              }}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-xl text-white transition-all hover:border-cyan-300/35 hover:text-cyan-100 lg:hidden"
              aria-label="Toggle navigation"
            >
              {isOpen ? <HiX /> : <HiOutlineMenu />}
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
                  {navLinks.map(link => {
                    const active = isActive(pathname, link.href);
                    const Icon = link.icon;

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-semibold transition-all ${
                          active
                            ? 'border-cyan-300/45 bg-cyan-300/12 text-cyan-100'
                            : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.06]'
                        }`}
                      >
                        <Icon size={15} />
                        {link.name}
                      </Link>
                    );
                  })}
                  <Link
                    href="/user"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-sm font-semibold text-slate-300 transition-all hover:border-emerald-300/35 hover:bg-emerald-300/10 hover:text-emerald-100"
                  >
                    <FaUser size={15} />
                    User Account
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>
    </>
  );
}
