// src/components/empty-states/EmptyCropRecord.tsx
'use client'

import { Sprout } from 'lucide-react'

export default function EmptyCropRecord() {
  return (
    <div className="text-center py-12">
      <Sprout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">No Crop Records</h3>
      <p className="text-gray-600 mb-6">
        Start by adding your first crop to track its journey
      </p>
      <button className="btn-primary px-6 py-3">
        Add Your First Crop
      </button>
    </div>
  )
}