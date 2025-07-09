import './globals.css';
import Navbar from '@/components/Navbar';
import { headers } from 'next/headers';

export const metadata = {
  title: 'Auto Nirman',
  description: 'Futuristic AI-powered construction platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = headers().get('x-pathname') || '';

  const showNavbar = pathname !== '/chatbot';

  return (
    <html lang="en" className="bg-black text-white">
      <body className="bg-black text-white overflow-x-hidden transition-colors duration-300">
        {showNavbar && <Navbar />}
        {children}
      </body>
    </html>
  );
}
