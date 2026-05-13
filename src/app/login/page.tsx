'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import api from '@/utils/api';
import { FaUserSecret, FaEye, FaEyeSlash, FaArrowRight, FaShieldAlt, FaBolt, FaChartLine } from 'react-icons/fa';

// ── Floating particle ──
function Particle({ x, y, size, duration, delay }: { x: number; y: number; size: number; duration: number; delay: number }) {
  return (
    <motion.div
      className="absolute rounded-full bg-cyan-400/20 pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
      animate={{ y: [-20, 20, -20], x: [-10, 10, -10], opacity: [0.1, 0.4, 0.1] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

// ── Floating label input ──
function FloatingInput({
  id, type, label, value, onChange, rightElement,
}: {
  id: string; type: string; label: string; value: string;
  onChange: (v: string) => void; rightElement?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  const isFloated = focused || value.length > 0;

  return (
    <div className="relative">
      {/* Glow border */}
      <div className={`absolute -inset-[1px] rounded-xl transition-all duration-500 ${focused ? 'bg-gradient-to-r from-cyan-500/40 via-blue-500/40 to-purple-500/40' : 'opacity-0'}`} />
      <div className="relative rounded-xl overflow-hidden">
        <input
          id={id}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder=" "
          autoComplete={id === 'email' ? 'email' : 'current-password'}
          className="peer w-full px-4 pt-7 pb-3 bg-[#0d1f35] text-white text-sm outline-none transition-all duration-300 [color-scheme:dark]"
          style={{
            WebkitBoxShadow: '0 0 0 1000px #0d1f35 inset',
            WebkitTextFillColor: 'white',
            caretColor: '#22d3ee',
          }}
        />
        <label
          htmlFor={id}
          className={`absolute left-4 transition-all duration-300 pointer-events-none font-medium ${
            isFloated
              ? 'top-2.5 text-[10px] text-cyan-400 tracking-widest uppercase'
              : 'top-1/2 -translate-y-1/2 text-sm text-slate-500'
          }`}
        >
          {label}
        </label>
        <div className={`absolute bottom-0 left-0 right-0 h-[1px] transition-all duration-500 ${focused ? 'bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400' : 'bg-white/10'}`} />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">{rightElement}</div>
        )}
      </div>
    </div>
  );
}

const particles = Array.from({ length: 12 }, (_, i) => ({
  id: i, x: Math.random() * 100, y: Math.random() * 100,
  size: Math.random() * 5 + 3, duration: Math.random() * 4 + 4, delay: Math.random() * 3,
}));

const stats = [
  { icon: FaChartLine, value: '₹1Cr+', label: 'Saved per project' },
  { icon: FaBolt,      value: '10x',   label: 'Faster audits' },
  { icon: FaShieldAlt, value: '95%',   label: 'BOQ accuracy' },
];

export default function LoginPage() {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted]           = useState(false);
  const router = useRouter();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [4, -4]);
  const rotateY = useTransform(mouseX, [-300, 300], [-4, 4]);

  useEffect(() => {
    setMounted(true);
    const handle = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };
    window.addEventListener('mousemove', handle);
    return () => window.removeEventListener('mousemove', handle);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.status === 200) router.push('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch {
      setError('Google sign-in failed. Try again.');
      setGoogleLoading(false);
    }
  };

  const handleGuestLogin = () => {
    if (typeof window !== 'undefined') localStorage.setItem('autonirman_guest', 'true');
    router.push('/dashboard');
  };

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen flex flex-col lg:flex-row bg-[#020817] overflow-x-hidden">

      {/* ══ LEFT PANEL — Branding (hidden on mobile) ══ */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#020817] via-[#0a1628] to-[#0d1b40]" />
        <motion.div
          className="absolute inset-0 opacity-40"
          animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{ backgroundImage: 'radial-gradient(ellipse at 20% 50%, #0ea5e944 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, #7c3aed33 0%, transparent 60%)' }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        {particles.map(p => <Particle key={p.id} {...p} />)}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-cyan-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/8 rounded-full blur-3xl" />

        {/* Logo */}
        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-400/20 rounded-xl blur-md" />
              <Image src="/logo.png" alt="Auto Nirman" width={44} height={44} className="relative drop-shadow-[0_0_10px_#38bdf8]" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Auto Nirman</span>
          </motion.div>
        </div>

        {/* Hero text */}
        <motion.div className="relative z-10" style={{ rotateX, rotateY, transformPerspective: 1000 }}>
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}>
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
              <span className="text-cyan-400 text-xs font-semibold tracking-wider uppercase">AI Infrastructure Intelligence</span>
            </div>
            <h1 className="text-5xl xl:text-6xl font-black leading-[1.05] mb-6 tracking-tight">
              <span className="text-white">Eliminate </span>
              <span className="relative">
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">₹1 Crore</span>
                <motion.div className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.2, delay: 0.8 }} />
              </span>
              <br />
              <span className="text-white">before it </span>
              <span className="text-slate-400">disappears.</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-md">
              India's most advanced BOQ analysis engine. Trusted by developers managing
              <span className="text-white font-semibold"> ₹50Cr–₹500Cr </span>
              projects across Tier 1 and Tier 2 cities.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }} className="flex gap-6 mt-10">
            {stats.map((stat, i) => (
              <motion.div key={i} whileHover={{ scale: 1.05, y: -2 }} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl px-5 py-4 hover:border-cyan-400/30 transition-all duration-300 group cursor-default">
                <stat.icon className="text-cyan-400 mb-2 group-hover:scale-110 transition-transform" size={18} />
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Social proof */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.8 }} className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {['A', 'R', 'V', 'P', 'S'].map((letter, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-[#020817] flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: ['#0ea5e9', '#7c3aed', '#0284c7', '#06b6d4', '#4f46e5'][i] }}>
                  {letter}
                </div>
              ))}
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Trusted by 500+ developers</p>
              <p className="text-slate-500 text-xs">across Lucknow, Delhi, Mumbai & more</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ══ RIGHT PANEL — Form ══ */}
      <div className="w-full lg:w-[45%] flex items-center justify-center px-4 pb-10 pt-24 sm:px-6 lg:min-h-screen lg:py-12 relative">
        <div className="absolute inset-0 bg-[#020817]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#0ea5e915_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_#7c3aed10_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative z-10 w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-5">
            <Image src="/logo.png" alt="Auto Nirman" width={36} height={36} className="drop-shadow-[0_0_10px_#38bdf8]" />
            <span className="text-lg font-bold text-white">Auto Nirman</span>
          </div>

          {/* Mobile tagline */}
          <div className="lg:hidden mb-6 p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl">
            <p className="text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">AI Infrastructure Intelligence</p>
            <p className="text-white font-bold text-base leading-snug sm:text-lg">Eliminate ₹1 Crore before it disappears.</p>
          </div>

          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-3 py-1 mb-4">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
              <span className="text-cyan-400 text-xs font-semibold tracking-wider uppercase">Secure Login</span>
            </motion.div>
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight sm:text-4xl lg:text-3xl">Welcome back</h2>
            <p className="text-slate-500 text-sm">Sign in to your intelligence dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <FloatingInput id="email" type="email" label="Email address" value={email} onChange={setEmail} />
            <FloatingInput
              id="password" type={showPassword ? 'text' : 'password'}
              label="Password" value={password} onChange={setPassword}
              rightElement={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-600 hover:text-cyan-400 transition-colors p-1">
                  {showPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                </button>
              }
            />

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-xs text-slate-600 hover:text-cyan-400 transition-colors">Forgot password?</Link>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
                  ⚠ {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button type="submit" disabled={loading || !email || !password}
              whileHover={{ scale: loading ? 1 : 1.01 }} whileTap={{ scale: loading ? 1 : 0.99 }}
              className="relative w-full py-4 rounded-xl font-bold text-sm overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed group mt-2">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 group-hover:from-cyan-400 group-hover:to-indigo-500 transition-all duration-300" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(ellipse_at_50%_120%,_rgba(6,182,212,0.5),_transparent_70%)]" />
              <span className="relative z-10 flex items-center justify-center gap-2 text-white tracking-wide">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Authenticating...</>
                ) : (
                  <>Sign In <FaArrowRight size={13} /></>
                )}
              </span>
            </motion.button>
          </form>

          <p className="text-center text-xs text-slate-600 mt-5">
            New to Auto Nirman?{' '}
            <Link href="/signup" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">Create account</Link>
          </p>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-slate-700 text-xs font-medium tracking-wider uppercase">or</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <div className="space-y-3">
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              onClick={handleGoogleLogin} disabled={googleLoading}
              className="w-full py-3.5 rounded-xl border border-white/8 bg-white/4 hover:bg-white/8 hover:border-cyan-400/30 text-white text-sm font-semibold flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-50">
              {googleLoading
                ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                : <Image src="/google-icon.png" alt="Google" width={18} height={18} />}
              <span>{googleLoading ? 'Redirecting...' : 'Continue with Google'}</span>
            </motion.button>

            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              onClick={handleGuestLogin}
              className="w-full py-3.5 rounded-xl border border-white/5 hover:bg-purple-500/8 hover:border-purple-400/20 text-slate-600 hover:text-slate-300 text-sm font-medium flex items-center justify-center gap-3 transition-all duration-300">
              <FaUserSecret size={14} /> Continue as Guest
            </motion.button>
          </div>

          <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-white/5">
            {[{ icon: FaShieldAlt, text: 'SOC 2 Type II' }, { icon: FaBolt, text: '99.9% Uptime' }].map((badge, i) => (
              <div key={i} className="flex items-center gap-1.5 text-slate-700 text-xs">
                <badge.icon size={10} /><span>{badge.text}</span>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-slate-800 mt-3">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-slate-600 hover:text-slate-400 transition-colors">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-slate-600 hover:text-slate-400 transition-colors">Privacy Policy</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
