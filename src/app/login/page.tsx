'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });

      if (response.status === 200) {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden px-4">
      {/* Cyberpunk grid background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(circle_at_1px_1px,_#38bdf811_1px,_transparent_0)] [background-size:16px_16px] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-800/10 to-black" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md p-8 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-[0_0_30px_#38bdf855] text-white animate-neon-flicker"
      >
        <h2 className="text-3xl font-bold text-center text-blue-400 mb-1">Auto Nirman Login</h2>
        <p className="text-sm text-center text-white/60 mb-6">Smart construction control begins here</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 rounded bg-white/10 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-blue-400 transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 rounded bg-white/10 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-blue-400 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition hover:shadow-[0_0_10px_#38bdf8] disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-1">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
              </div>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <p className="text-center text-sm mt-4 text-white/60">
          Don’t have an account?{' '}
          <Link href="/signup" className="text-accent hover:underline">
            Sign up
          </Link>
        </p>

        <div className="flex items-center gap-2 my-6">
          <div className="h-px bg-gray-600 flex-1" />
          <p className="text-white/40 text-sm">OR</p>
          <div className="h-px bg-gray-600 flex-1" />
        </div>

        <button
          onClick={() => alert('Google login coming soon!')}
          className="flex items-center justify-center gap-3 w-full py-2 border border-white/30 rounded bg-white/10 hover:bg-white/20 transition"
        >
          <Image src="/google-icon.png" alt="Google" width={20} height={20} />
          <span className="text-white font-medium">Login with Google</span>
        </button>
      </motion.div>
    </div>
  );
}
