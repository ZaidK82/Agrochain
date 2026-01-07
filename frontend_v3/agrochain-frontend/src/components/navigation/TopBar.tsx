// src/components/navigation/TopBar.tsx
'use client'

import { Globe, Wifi, WifiOff, MapPin } from 'lucide-react'
import { useAppStore } from '@/src/store/useAppStore'

export default function TopBar() {
  const { isOnline, location, language, setLanguage } = useAppStore()
  
  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Location */}
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-green-600" />
          <div className="text-sm">
            <p className="font-medium">{location.district}</p>
            <p className="text-gray-500">{location.state}</p>
          </div>
        </div>
        
        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Connectivity */}
          <div className="flex items-center gap-1">
            {isOnline ? (
              <Wifi className="w-5 h-5 text-green-600" />
            ) : (
              <WifiOff className="w-5 h-5 text-gray-400" />
            )}
            <span className="text-sm">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          
          {/* Language Selector */}
          <div className="relative">
            <button className="flex items-center gap-1 p-2 rounded-lg hover:bg-gray-100">
              <Globe className="w-5 h-5" />
              <span className="text-sm">{language}</span>
            </button>
            {/* Dropdown for language selection */}
          </div>
        </div>
      </div>
    </div>
  )
}