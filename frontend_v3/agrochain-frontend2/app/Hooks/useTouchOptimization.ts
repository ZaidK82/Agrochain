import { useEffect, useState } from 'react'

export function useTouchOptimization() {
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check for touch device
    const checkTouchDevice = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore
        navigator.msMaxTouchPoints > 0
      )
    }

    // Check for mobile device
    const checkMobile = () => {
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
      setIsMobile(mobileRegex.test(navigator.userAgent))
    }

    // Check screen size
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkTouchDevice()
    checkMobile()
    checkScreenSize()

    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  return { isTouchDevice, isMobile }
}