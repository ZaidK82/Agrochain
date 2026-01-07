'use client'

import { MapPin, Bell, Menu, X, Search, User } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled 
            ? 'bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm' 
            : 'bg-white border-b border-gray-200'
        }`}
      >
        <div className="container-responsive">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Responsive */}
            <Link href="/" className="flex items-center gap-2 md:gap-3">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-8 h-8 md:w-10 md:h-10 bg-agro-green rounded-lg flex items-center justify-center"
              >
                <span className="text-white text-lg md:text-xl">🌾</span>
              </motion.div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-gray-900 text-lg md:text-xl">AgroChain</h1>
                <p className="text-xs text-gray-600 hidden md:block">Nagpur, Maharashtra</p>
              </div>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search crops, predictions, market..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-agro-green/50 focus:bg-white"
                />
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3 md:gap-4">
              {/* Location & Weather - Responsive */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                <MapPin className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium">32°C</span>
              </div>

              {/* Notifications */}
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </motion.button>

              {/* User Profile - Desktop */}
              <div className="hidden md:block">
                <Link href="/profile">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <User className="w-5 h-5 text-gray-600" />
                  </motion.div>
                </Link>
              </div>

              {/* Mobile Menu Toggle */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setMenuOpen(!menuOpen)}
                className="sm:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {menuOpen ? (
                  <X className="w-5 h-5 text-gray-600" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-600" />
                )}
              </motion.button>
            </div>
          </div>

          {/* Search Bar - Mobile */}
          <div className="lg:hidden pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search crops, predictions, market..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-agro-green/50 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="sm:hidden border-t border-gray-200 bg-white"
            >
              <div className="container-responsive py-4 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-4 h-4 text-gray-600" />
                    <span>Nagpur, Maharashtra</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <span>Weather: 32°C • Monsoon in 12 days</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/profile" onClick={() => setMenuOpen(false)}>
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <User className="w-5 h-5 mx-auto mb-2 text-gray-600" />
                      <span className="text-sm font-medium">Profile</span>
                    </div>
                  </Link>
                  <Link href="/market" onClick={() => setMenuOpen(false)}>
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <Bell className="w-5 h-5 mx-auto mb-2 text-gray-600" />
                      <span className="text-sm font-medium">Market</span>
                    </div>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  )
}