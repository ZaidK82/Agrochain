// src/components/cards/SeasonIndicator.tsx
'use client'

export default function SeasonIndicator({ season }: { season?: string }) {
  return (
    <div className="text-sm text-gray-500 mt-1">
      Season: {season || 'N/A'}
    </div>
  )
}
