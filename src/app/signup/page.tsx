'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import api from '@/utils/api';
import { FaEye, FaEyeSlash, FaArrowRight, FaShieldAlt, FaBolt, FaChartLine, FaCheckCircle } from 'react-icons/fa';

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
          autoComplete="off"
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

const benefits = [
  'BOQ Analysis with AI anomaly detection',
  'Compare rates against CPWD benchmarks',
  'Instant PDF leakage reports',
  'Trusted by 500+ Indian developers',
];

export default function SignupPage() {
  const [name, setName]                   = useState('');
  const [email, setEmail]                 = useState('');
  const [password, setPassword]           = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword]   = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [error, setError]                 = useState('');
  const [loading, setLoading]             = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [mounted, setMounted]             = useState(false);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const response = await api.post('/auth/signup', { name, email, password });
      if (response.status === 200 || response.status === 201) router.push('/login');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch {
      setError('Google sign-up failed. Try again.');
      setGoogleLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen flex flex-col lg:flex-row bg-[#020817] overflow-hidden">

      {/* ══ LEFT PANEL ══ */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#020817] via-[#0a1628] to-[#0d1b40]" />
        <motion.div
          className="absolute inset-0 opacity-40"
          animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{ backgroundImage: 'radial-gradient(ellipse at 20% 50%, #0ea5e944 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, #7c3aed33 0%, transparent 60%)' }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-cyan-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/8 rounded-full blur-3xl" />

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

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }} className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
            <span className="text-purple-400 text-xs font-semibold tracking-wider uppercase">Join 500+ Developers</span>
          </div>

          <h1 className="text-5xl xl:text-6xl font-black leading-[1.05] mb-6 tracking-tight">
            <span className="text-white">Start saving </span>
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">crores</span>
            <br />
            <span className="text-slate-400">on every project.</span>
          </h1>

          <p className="text-slate-400 text-lg leading-relaxed max-w-md mb-10">
            Create your free account and run your first BOQ analysis in under 5 minutes. No credit card required.
          </p>

          {/* Benefits list */}
          <div className="space-y-3">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <FaCheckCircle className="text-cyan-400 shrink-0" size={14} />
                <span className="text-slate-300 text-sm">{b}</span>
              </motion.div>
            ))}
          </div>
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
              <p className="text-white text-sm font-semibold">500+ developers already signed up</p>
              <p className="text-slate-500 text-xs">across Lucknow, Delhi, Mumbai & more</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ══ RIGHT PANEL — Form ══ */}
      <div className="w-full lg:w-[45%] flex items-center justify-center px-6 py-12 relative min-h-screen">
        <div className="absolute inset-0 bg-[#020817]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#7c3aed15_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_#0ea5e910_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-purple-400/20 to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative z-10 w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <Image src="/logo.png" alt="Auto Nirman" width={36} height={36} className="drop-shadow-[0_0_10px_#38bdf8]" />
            <span className="text-lg font-bold text-white">Auto Nirman</span>
          </div>

          {/* Mobile tagline */}
          <div className="lg:hidden mb-8 p-4 bg-purple-500/5 border border-purple-500/10 rounded-2xl">
            <p className="text-purple-400 text-xs font-semibold uppercase tracking-wider mb-1">Join 500+ Developers</p>
            <p className="text-white font-bold text-lg leading-snug">Start saving crores on every project.</p>
          </div>

          {/* Header */}
          <div className="mb-8">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-3 py-1 mb-4">
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
              <span className="text-purple-400 text-xs font-semibold tracking-wider uppercase">Create Account</span>
            </motion.div>
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Get started free</h2>
            <p className="text-slate-500 text-sm">No credit card required · Setup in 2 minutes</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            <FloatingInput id="name" type="text" label="Full Name" value={name} onChange={setName} />
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
            <FloatingInput
              id="confirmPassword" type={showConfirm ? 'text' : 'password'}
              label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword}
              rightElement={
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-slate-600 hover:text-cyan-400 transition-colors p-1">
                  {showConfirm ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                </button>
              }
            />

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
                  ⚠ {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button type="submit" disabled={loading || !name || !email || !password || !confirmPassword}
              whileHover={{ scale: loading ? 1 : 1.01 }} whileTap={{ scale: loading ? 1 : 0.99 }}
              className="relative w-full py-4 rounded-xl font-bold text-sm overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed group mt-2">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 group-hover:from-purple-400 group-hover:to-cyan-400 transition-all duration-300" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(ellipse_at_50%_120%,_rgba(168,85,247,0.5),_transparent_70%)]" />
              <span className="relative z-10 flex items-center justify-center gap-2 text-white tracking-wide">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</>
                ) : (
                  <>Create Account <FaArrowRight size={13} /></>
                )}
              </span>
            </motion.button>
          </form>

          <p className="text-center text-xs text-slate-600 mt-5">
            Already have an account?{' '}
            <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">Sign in</Link>
          </p>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-slate-700 text-xs font-medium tracking-wider uppercase">or</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            onClick={handleGoogleSignup} disabled={googleLoading}
            className="w-full py-3.5 rounded-xl border border-white/8 bg-white/4 hover:bg-white/8 hover:border-purple-400/30 text-white text-sm font-semibold flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-50">
            {googleLoading
              ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              : <Image src="/google-icon.png" alt="Google" width={18} height={18} />}
            <span>{googleLoading ? 'Redirecting...' : 'Sign up with Google'}</span>
          </motion.button>

          <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-white/5">
            {[{ icon: FaShieldAlt, text: 'SOC 2 Type II' }, { icon: FaBolt, text: '99.9% Uptime' }].map((badge, i) => (
              <div key={i} className="flex items-center gap-1.5 text-slate-700 text-xs">
                <badge.icon size={10} /><span>{badge.text}</span>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-slate-800 mt-3">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-slate-600 hover:text-slate-400 transition-colors">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-slate-600 hover:text-slate-400 transition-colors">Privacy Policy</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}