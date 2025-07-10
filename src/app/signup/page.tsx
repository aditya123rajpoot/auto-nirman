'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import api from '@/utils/api'; // ✅ Ensure this resolves to src/utils/api.ts

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      console.log('📦 Sending signup request to backend:', {
        name,
        email,
        password,
      });

      const response = await api.post('/auth/signup', {
        name,
        email,
        password,
      });

      console.log('✅ Signup response:', response.data);

      if (response.status === 200 || response.status === 201) {
        router.push('/login');
      }
    } catch (err: any) {
      console.error('❌ Signup error:', err);
      setError(err?.response?.data?.detail || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden px-4">
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
        <h2 className="text-3xl font-bold text-center text-blue-400 mb-1">Create Your Account</h2>
        <p className="text-sm text-center text-white/60 mb-6">Start building with Auto Nirman</p>

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full px-4 py-2 rounded bg-white/10 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-blue-400 transition"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full px-4 py-2 rounded bg-white/10 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-blue-400 transition"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition hover:shadow-[0_0_10px_#38bdf8] disabled:opacity-50"
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-sm mt-4 text-white/60">
          Already have an account?{' '}
          <Link href="/login" className="text-accent hover:underline">
            Login
          </Link>
        </p>

        <div className="flex items-center gap-2 my-6">
          <div className="h-px bg-gray-600 flex-1" />
          <p className="text-white/40 text-sm">OR</p>
          <div className="h-px bg-gray-600 flex-1" />
        </div>

        <button
          onClick={() => alert('Google signup coming soon!')}
          className="flex items-center justify-center gap-3 w-full py-2 border border-white/30 rounded bg-white/10 hover:bg-white/20 transition"
        >
          <Image src="/google-icon.png" alt="Google" width={20} height={20} />
          <span className="text-white font-medium">Sign up with Google</span>
        </button>
      </motion.div>
    </div>
  );
}
