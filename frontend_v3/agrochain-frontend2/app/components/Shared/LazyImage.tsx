'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
}

export function LazyImage({ src, alt, className = '', width, height }: LazyImageProps) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="relative overflow-hidden">
      {!loaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <motion.img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`${className} transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setLoaded(true)}
        loading="lazy"
        decoding="async"
      />
    </div>
  )
}