import './globals.css';
import { Inter, Space_Grotesk } from 'next/font/google';
import Navbar from '@/components/Navbar';
import SessionWrapper from '@/components/SessionWrapper';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});
export const metadata = {
  title: 'Auto Nirman',
  description: 'Futuristic AI-powered construction platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} bg-black text-white`}>
      <body className="bg-black text-white overflow-x-hidden transition-colors duration-300">
        <SessionWrapper>
          <Navbar />
          {children}
        </SessionWrapper>
      </body>
    </html>
  );
}