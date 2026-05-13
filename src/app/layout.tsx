import './globals.css';
import Navbar from '@/components/Navbar';
import PageTransition from '@/components/PageTransition';
import SessionWrapper from '@/components/SessionWrapper';

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
    <html lang="en" className="bg-black text-white">
      <body className="bg-black text-white antialiased overflow-x-hidden transition-colors duration-300">
        <SessionWrapper>
          <Navbar />
          <PageTransition>{children}</PageTransition>
        </SessionWrapper>
      </body>
    </html>
  );
}
