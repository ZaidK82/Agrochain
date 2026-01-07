// src/components/offline/OfflineBanner.tsx
'use client'

import { WifiOff, Cloud } from 'lucide-react'
import { useAppStore } from '@/src/store/useAppStore'

export default function OfflineBanner() {
  const { isOnline, lastSync } = useAppStore()
  
  if (isOnline) return null
  
  return (
    <div className="sticky top-14 z-40 bg-yellow-50 border-b border-yellow-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <WifiOff className="w-5 h-5 text-yellow-600" />
          <div>
            <p className="font-medium text-yellow-800">Offline Mode Active</p>
            <p className="text-sm text-yellow-700">
              Last synced: {lastSync}
            </p>
          </div>
        </div>
        <Cloud className="w-5 h-5 text-yellow-600 animate-pulse" />
      </div>
    </div>
  )
}