import { useEffect } from 'react'

export function useSmoothScroll() {
  useEffect(() => {
    // Smooth scroll for anchor links
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a[href^="#"]')
      
      if (anchor) {
        e.preventDefault()
        const href = anchor.getAttribute('href')
        if (href && href !== '#') {
          const element = document.querySelector(href)
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            })
          }
        }
      }
    }

    // Prevent rubber-band scrolling on iOS
    const preventRubberBand = (e: TouchEvent) => {
      if (document.scrollingElement!.scrollTop === 0) {
        e.preventDefault()
      }
    }

    document.addEventListener('click', handleClick)
    document.addEventListener('touchmove', preventRubberBand, { passive: false })

    return () => {
      document.removeEventListener('click', handleClick)
      document.removeEventListener('touchmove', preventRubberBand)
    }
  }, [])
}