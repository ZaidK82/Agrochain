'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface VirtualListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  itemHeight?: number
  className?: string
}

export function VirtualList<T>({ 
  items, 
  renderItem, 
  itemHeight = 72,
  className = ''
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visibleItems, setVisibleItems] = useState<T[]>(items.slice(0, 10))
  const [scrollTop, setScrollTop] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      setScrollTop(container.scrollTop)
      
      const startIndex = Math.floor(container.scrollTop / itemHeight)
      const endIndex = Math.min(
        startIndex + Math.ceil(container.clientHeight / itemHeight) + 2,
        items.length
      )
      
      setVisibleItems(items.slice(startIndex, endIndex))
    }

    container.addEventListener('scroll', handleScroll)
    handleScroll() // Initial calculation

    return () => container.removeEventListener('scroll', handleScroll)
  }, [items, itemHeight])

  return (
    <div
      ref={containerRef}
      className={`overflow-y-auto scrollbar-thin ${className}`}
      style={{ height: '400px' }}
    >
      <div style={{ height: `${items.length * itemHeight}px` }}>
        {visibleItems.map((item, index) => {
          const absoluteIndex = Math.floor(scrollTop / itemHeight) + index
          return (
            <motion.div
              key={absoluteIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'absolute',
                top: `${absoluteIndex * itemHeight}px`,
                width: '100%',
              }}
            >
              {renderItem(item, absoluteIndex)}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}