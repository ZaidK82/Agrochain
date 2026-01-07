'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface ResponsiveGridProps {
  children: ReactNode
  className?: string
  cols?: {
    base?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: {
    base?: string
    sm?: string
    md?: string
    lg?: string
    xl?: string
  }
}

export function ResponsiveGrid({ 
  children, 
  className = '',
  cols = { base: 1, sm: 2, lg: 3 },
  gap = { base: '4', sm: '6' }
}: ResponsiveGridProps) {
  const gridCols = {
    base: `grid-cols-${cols.base || 1}`,
    sm: cols.sm ? `sm:grid-cols-${cols.sm}` : '',
    md: cols.md ? `md:grid-cols-${cols.md}` : '',
    lg: cols.lg ? `lg:grid-cols-${cols.lg}` : '',
    xl: cols.xl ? `xl:grid-cols-${cols.xl}` : '',
  }

  const gridGap = {
    base: `gap-${gap.base || '4'}`,
    sm: gap.sm ? `sm:gap-${gap.sm}` : '',
    md: gap.md ? `md:gap-${gap.md}` : '',
    lg: gap.lg ? `lg:gap-${gap.lg}` : '',
    xl: gap.xl ? `xl:gap-${gap.xl}` : '',
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`
        grid
        ${gridCols.base}
        ${gridCols.sm}
        ${gridCols.md}
        ${gridCols.lg}
        ${gridCols.xl}
        ${gridGap.base}
        ${gridGap.sm}
        ${gridGap.md}
        ${gridGap.lg}
        ${gridGap.xl}
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}