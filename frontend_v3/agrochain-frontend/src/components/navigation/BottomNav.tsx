// src/components/navigation/BottomNav.tsx
'use client'

import { Home, Sprout, TrendingUp, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { name: 'Home', icon: Home, href: '/' },
  { name: 'My Crop', icon: Sprout, href: '/crop' },
  { name: 'Market', icon: TrendingUp, href: '/market' },
  { name: 'Verify', icon: CheckCircle, href: '/verify' },
]

export default function BottomNav() {
  const pathname = usePathname()
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-6">
      <div className="flex justify-between">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg ${
                isActive ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}


