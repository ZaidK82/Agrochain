'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface ResponsiveCardProps {
  children: ReactNode
  className?: string
  hoverable?: boolean
  clickable?: boolean
  onClick?: () => void
  padding?: 'sm' | 'md' | 'lg'
}

export function ResponsiveCard({ 
  children, 
  className = '',
  hoverable = true,
  clickable = false,
  onClick,
  padding = 'md'
}: ResponsiveCardProps) {
  const paddingClasses = {
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hoverable ? { y: -4, transition: { duration: 0.2 } } : {}}
      whileTap={clickable ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`
        bg-white rounded-xl shadow-sm border border-gray-200
        ${paddingClasses[padding]}
        ${hoverable ? 'hover:shadow-md hover:border-agro-green/30 transition-all duration-300' : ''}
        ${clickable ? 'cursor-pointer active:scale-95' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}