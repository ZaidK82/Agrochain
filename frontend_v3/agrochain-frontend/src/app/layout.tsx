// src/app/layout.tsx
'use client'
import RegisterSW from './register-sw'
import { Inter } from 'next/font/google'
import BottomNav from '../components/navigation/BottomNav'
import TopBar from '../components/navigation/TopBar'
import OfflineBanner from '../components/offline/OfflineBanner'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white min-h-screen pb-20`}>
        <RegisterSW />

        <TopBar />
        <OfflineBanner />
        <main className="container mx-auto px-4 pt-4">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  )
}