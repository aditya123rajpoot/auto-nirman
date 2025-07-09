'use client';

import { SessionProvider } from 'next-auth/react';
import Navbar from '../components/Navbar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Navbar />
      <main className="pt-16 bg-black text-white min-h-screen">{children}</main>
    </SessionProvider>
  );
}
