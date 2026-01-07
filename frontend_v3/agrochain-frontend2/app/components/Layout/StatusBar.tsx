'use client'

import { Wifi, Battery, Signal } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function StatusBar() {
  const [time, setTime] = useState(new Date())
  const router = useRouter()

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 py-2 bg-gradient-to-b from-black/20 to-transparent pointer-events-none">
      <div className="flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{formatTime(time)}</span>
          <div className="flex items-center gap-1">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <span className="text-xs">100%</span>
          <Battery className="w-4 h-4" />
        </div>
      </div>
    </div>
  )
}