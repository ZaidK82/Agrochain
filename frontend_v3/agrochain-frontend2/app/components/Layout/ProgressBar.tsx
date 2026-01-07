'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function ProgressBar() {
  const [progress, setProgress] = useState(0)
  const [show, setShow] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleStart = () => {
      setProgress(0)
      setShow(true)
      
      // Simulate progress
      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(timer)
            return 90
          }
          return prev + 10
        })
      }, 100)
      
      return () => clearInterval(timer)
    }

    const handleComplete = () => {
      setProgress(100)
      setTimeout(() => {
        setShow(false)
        setProgress(0)
      }, 200)
    }

    // Trigger on route change
    handleStart()
    const timeout = setTimeout(handleComplete, 500)

    return () => {
      clearTimeout(timeout)
    }
  }, [pathname, searchParams])

  if (!show) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1">
      <div
        className="h-full bg-gradient-to-r from-agro-green via-agro-blue to-agro-purple transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
      <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer bg-[length:1000px_100%]" />
    </div>
  )
}