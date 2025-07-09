'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineMenu, HiX } from 'react-icons/hi';
import Image from 'next/image';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Legal', href: '/legal' },
  { name: 'Map', href: '/map' },
  { name: 'AI Chatbot', href: '/chatbot' },
  { name: 'Login', href: '/login' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setVisible(e.clientY < 80);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const toggleMenu = () => setIsOpen((prev) => !prev);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-blue-500/20 shadow-[0_0_20px_#0ff4] transition-all"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/logo.png"
            alt="Auto Nirman"
            width={40}
            height={40}
            className="rounded-full group-hover:scale-105 transition-transform duration-300"
          />
          <motion.span
            whileHover={{ scale: 1.05 }}
            className="text-white text-xl font-extrabold tracking-widest transition-all group-hover:text-blue-400"
          >
            Auto Nirman
          </motion.span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`relative text-sm font-medium tracking-wide group transition-all duration-300 ${
                pathname === link.href ? 'text-blue-400' : 'text-white hover:text-blue-300'
              }`}
            >
              {link.name}
              <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
        </div>

        {/* Mobile Menu Icon */}
        <div
          className="md:hidden text-white text-2xl cursor-pointer"
          onClick={toggleMenu}
        >
          {isOpen ? <HiX /> : <HiOutlineMenu />}
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-black/90 px-6 pb-4 border-t border-white/10"
          >
            <div className="flex flex-col space-y-4 mt-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-white text-sm font-medium transition-colors ${
                    pathname === link.href ? 'text-blue-400' : 'hover:text-blue-300'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

