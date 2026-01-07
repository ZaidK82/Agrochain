'use client'

import { Wifi, WifiOff } from 'lucide-react'
import { useState, useEffect } from 'react'

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    setIsOnline(navigator.onLine)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="w-4 h-4 text-yellow-600" />
        <span className="text-sm text-yellow-800">
          Working offline with cached data
        </span>
      </div>
    </div>
  )
}