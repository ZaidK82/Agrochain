import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ResilienceProvider } from './context/ResilienceContext';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import './globals.css';

// Configure font with display swap and fallback
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
  weight: ['400', '500', '600', '700'],
  preload: false, // Disable preload to avoid timeout
});

export const metadata: Metadata = {
  title: 'AgroChain - AI-Powered Agricultural Intelligence',
  description: 'Blockchain-verified AI advisory for farmers',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full flex flex-col`}>
        <AppProvider>
          <ResilienceProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </ResilienceProvider>
        </AppProvider>
      </body>
    </html>
  );
}