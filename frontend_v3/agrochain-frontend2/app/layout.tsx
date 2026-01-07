import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/app/components/Layout/Navbar'
import { BottomNav } from '@/app/components/Layout/BottomNav'
import { PageTransition } from '@/app/components/Layout/PageTransition'
import { ProgressBar } from '@/app/components/Layout/ProgressBar'
import { OfflineIndicator } from '@/app/components/Shared/OfflineIndicator'

const inter = Inter({ subsets: ['latin'] })

// ✅ CORRECT: Metadata and Viewport are separate in Next.js 14
export const metadata: Metadata = {
  title: 'AgroChain - Smart Farming Platform',
  description: 'AI-powered crop predictions with blockchain verification',
  manifest: '/manifest.json',
  // themeColor and viewport should NOT be here
}

// ✅ CORRECT: Viewport configuration in Next.js 14
export const viewport: Viewport = {
  themeColor: '#2E7D32',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${inter.className} h-full flex flex-col`}>
        <ProgressBar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <OfflineIndicator />
          <main className="flex-1 overflow-y-auto">
            <div className="container-responsive py-6">
              <PageTransition>
                {children}
              </PageTransition>
            </div>
          </main>
          <BottomNav />
        </div>
      </body>
    </html>
  )
}