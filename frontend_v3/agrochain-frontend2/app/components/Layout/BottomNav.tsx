'use client'

import { Home, Sprout, BarChart3, Shield, QrCode, TrendingUp, User, MoreVertical } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

const mainNavItems = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: Sprout, label: 'Predict', href: '/predict' },
  { icon: BarChart3, label: 'Yield', href: '/yield-prediction' },
  { icon: Shield, label: 'Resilience', href: '/resilience' },
  { icon: QrCode, label: 'Trace', href: '/traceability' },
]

const secondaryNavItems = [
  { icon: TrendingUp, label: 'Market', href: '/market' },
  { icon: User, label: 'Profile', href: '/profile' },
]

export function BottomNav() {
  const pathname = usePathname()
  const [showMore, setShowMore] = useState(false)

  const isActive = (href: string) => {
    if (href === '/') return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Floating Action Button for More */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 right-4 z-50"
          >
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-2">
              {secondaryNavItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link key={item.href} href={item.href} onClick={() => setShowMore(false)}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center gap-3 p-3 rounded-lg mb-1 last:mb-0 ${
                        active ? 'bg-agro-green/10 text-agro-green' : 'hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </motion.div>
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMore(false)}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Main Bottom Navigation */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-40 shadow-lg"
      >
        <div className="flex justify-around items-center h-16 px-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex flex-col items-center justify-center flex-1 h-full min-w-[60px] px-1 ${
                    active ? 'text-agro-green' : 'text-gray-500'
                  }`}
                >
                  <motion.div
                    animate={{
                      scale: active ? 1.1 : 1,
                    }}
                    className={`p-2 rounded-lg mb-1 transition-colors ${
                      active ? 'bg-agro-green/10' : ''
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.div>
                  <motion.span
                    animate={{
                      fontSize: active ? '12px' : '11px',
                      fontWeight: active ? '600' : '500',
                    }}
                    className="text-xs font-medium truncate max-w-full"
                  >
                    {item.label}
                  </motion.span>
                  
                  {/* Active indicator */}
                  {active && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute top-0 w-12 h-1 bg-agro-green rounded-b-full"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.div>
              </Link>
            )
          })}

          {/* More Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMore(!showMore)}
            className={`flex flex-col items-center justify-center flex-1 h-full min-w-[60px] px-1 ${
              showMore ? 'text-agro-green' : 'text-gray-500'
            }`}
          >
            <motion.div
              animate={{ rotate: showMore ? 180 : 0 }}
              className={`p-2 rounded-lg mb-1 ${
                showMore ? 'bg-agro-green/10' : ''
              }`}
            >
              <MoreVertical className="w-5 h-5" />
            </motion.div>
            <span className="text-xs font-medium">More</span>
          </motion.button>
        </div>
      </motion.nav>
    </>
  )
}